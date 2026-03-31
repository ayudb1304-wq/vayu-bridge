import { Receiver, Client } from "@upstash/qstash"
import { createServiceClient } from "@/utils/supabase/service"
import { getValidAccessToken, airtableFetch, registerAirtableWebhook } from "@/lib/airtable"
import { encrypt } from "@/lib/crypto"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const maxDuration = 300 // seconds — requires Vercel Pro; safe to leave on Hobby (capped at 10s but QStash retries)

type AirtableTable = { id: string; name: string }

type SyncPayload = {
  connectedBaseId: string
  syncLogId: string
  tables?: AirtableTable[]
  tableIndex?: number
  offset?: string
}

type BaseRow = {
  id: string
  airtable_base_id: string
  user_id: string
  access_token_enc: string
  refresh_token_enc: string
  token_expires_at: string | null
}

export async function POST(request: NextRequest) {
  // 1. Verify QStash signature (skipped in local dev via x-dev-bypass header)
  const rawBody = await request.text()
  const isDevBypass =
    process.env.NODE_ENV === "development" &&
    request.headers.get("x-dev-bypass") === "true"

  if (!isDevBypass) {
    const receiver = new Receiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
    })
    const isValid = await receiver.verify({
      signature: request.headers.get("upstash-signature") ?? "",
      body: rawBody,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/sync/initial`,
    })
    if (!isValid) {
      return NextResponse.json({ error: "Invalid QStash signature" }, { status: 401 })
    }
  }

  const payload: SyncPayload = JSON.parse(rawBody)
  const { connectedBaseId, syncLogId } = payload
  const tableIndex = payload.tableIndex ?? 0

  const db = createServiceClient()

  // 2. Load the connected base
  const { data: base, error: baseError } = await db
    .from("connected_bases")
    .select("id, airtable_base_id, user_id, access_token_enc, refresh_token_enc, token_expires_at")
    .eq("id", connectedBaseId)
    .single<BaseRow>()

  if (baseError || !base) {
    await failSync(db, syncLogId, "Connected base not found")
    return NextResponse.json({ error: "Base not found" }, { status: 404 })
  }

  let token: string
  try {
    token = await getValidAccessToken(base)
  } catch (e) {
    await failSync(db, syncLogId, `Token error: ${(e as Error).message}`)
    return NextResponse.json({ error: "Token refresh failed" }, { status: 500 })
  }

  // 3. Discover tables on first call
  let tables = payload.tables
  if (!tables) {
    try {
      const schema = await airtableFetch<{ tables: Array<{ id: string; name: string }> }>(
        `https://api.airtable.com/v0/meta/bases/${base.airtable_base_id}/tables`,
        token
      )
      tables = schema.tables.map((t) => ({ id: t.id, name: t.name }))
      await db.from("sync_log").update({ message: `Discovered ${tables.length} table(s)` }).eq("id", syncLogId)
    } catch (e) {
      await failSync(db, syncLogId, `Schema fetch failed: ${(e as Error).message}`)
      return NextResponse.json({ error: "Schema fetch failed" }, { status: 500 })
    }
  }

  // 4. All tables done → register webhook + complete
  if (tableIndex >= tables.length) {
    try {
      const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/airtable`
      const { webhookId, macSecretBase64 } = await registerAirtableWebhook(
        base.airtable_base_id,
        token,
        webhookUrl
      )
      await db.from("connected_bases").update({
        webhook_id: webhookId,
        webhook_secret_enc: encrypt(macSecretBase64),
        sync_status: "active",
        last_synced_at: new Date().toISOString(),
      }).eq("id", connectedBaseId)
    } catch (e) {
      // Webhook registration failure doesn't fail the sync — polling fallback covers it
      console.error("Webhook registration failed:", e)
    }

    await db.from("sync_log").update({
      status: "complete",
      message: "Sync complete",
      completed_at: new Date().toISOString(),
    }).eq("id", syncLogId)

    return NextResponse.json({ done: true })
  }

  // 5. Sync current table page
  const currentTable = tables[tableIndex]
  await db.from("sync_log").update({
    message: `Syncing "${currentTable.name}" (${tableIndex + 1}/${tables.length})`,
  }).eq("id", syncLogId)

  try {
    const url = new URL(
      `https://api.airtable.com/v0/${base.airtable_base_id}/${encodeURIComponent(currentTable.id)}`
    )
    url.searchParams.set("pageSize", "100")
    if (payload.offset) url.searchParams.set("offset", payload.offset)

    const data = await airtableFetch<{
      records: Array<{ id: string; fields: Record<string, unknown> }>
      offset?: string
    }>(url.toString(), token)

    if (data.records.length > 0) {
      await db.from("synced_records").upsert(
        data.records.map((r) => ({
          connected_base_id: connectedBaseId,
          airtable_table_id: currentTable.id,
          airtable_table_name: currentTable.name,
          airtable_record_id: r.id,
          fields: r.fields,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "connected_base_id,airtable_table_id,airtable_record_id" }
      )

      // Increment records_synced
      await db.rpc("increment_sync_records", {
        log_id: syncLogId,
        amount: data.records.length,
      })
    }

    // 6. Chain next job
    const nextPayload: SyncPayload = {
      connectedBaseId,
      syncLogId,
      tables,
      tableIndex: data.offset ? tableIndex : tableIndex + 1,
      offset: data.offset,
    }
    const workerUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/sync/initial`

    if (process.env.NODE_ENV === "development") {
      fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-dev-bypass": "true" },
        body: JSON.stringify(nextPayload),
      }).catch(console.error)
    } else {
      const qstash = new Client({ token: process.env.QSTASH_TOKEN! })
      await qstash.publishJSON({ url: workerUrl, body: nextPayload })
    }

    return NextResponse.json({ ok: true, table: currentTable.name, hasMore: !!data.offset })
  } catch (e) {
    await failSync(db, syncLogId, `Sync error on "${currentTable.name}": ${(e as Error).message}`)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

async function failSync(db: ReturnType<typeof createServiceClient>, syncLogId: string, msg: string) {
  await db.from("sync_log").update({
    status: "error",
    error_message: msg,
    completed_at: new Date().toISOString(),
  }).eq("id", syncLogId)
}
