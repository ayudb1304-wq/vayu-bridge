import { createServiceClient } from "@/utils/supabase/service"
import { decrypt } from "@/lib/crypto"
import { airtableFetch, getValidAccessToken } from "@/lib/airtable"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import crypto from "crypto"

type AirtableNotification = {
  base: { id: string }
  webhook: { id: string }
  timestamp: string
}

type WebhookPayload = {
  payloads: Array<{
    createdTablesById?: Record<string, unknown>
    destroyedTableIds?: string[]
    changedTablesById?: Record<string, {
      createdRecordsById?: Record<string, { cellValuesByFieldId: Record<string, unknown> }>
      destroyedRecordIds?: string[]
      changedRecordsById?: Record<string, { current: { cellValuesByFieldId: Record<string, unknown> } }>
    }>
  }>
  cursor: number
  mightHaveMore: boolean
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const macHeader = request.headers.get("x-airtable-content-mac") ?? ""

  // Parse the notification (no secret needed yet — we look up the secret by webhook ID)
  let notification: AirtableNotification
  try {
    notification = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const db = createServiceClient()

  // Find connected base by webhook_id
  const { data: base } = await db
    .from("connected_bases")
    .select("id, airtable_base_id, user_id, webhook_id, webhook_secret_enc, access_token_enc, refresh_token_enc, token_expires_at")
    .eq("webhook_id", notification.webhook.id)
    .single()

  if (!base) {
    return NextResponse.json({ error: "Unknown webhook" }, { status: 404 })
  }

  // Verify HMAC-SHA256 signature
  if (base.webhook_secret_enc) {
    const macSecret = Buffer.from(decrypt(base.webhook_secret_enc), "base64")
    const expectedMac = crypto.createHmac("sha256", macSecret).update(rawBody).digest("hex")
    const expectedHeader = `hmac-sha256=${expectedMac}`
    if (macHeader !== expectedHeader) {
      return NextResponse.json({ error: "Invalid MAC" }, { status: 401 })
    }
  }

  // Get valid token
  const token = await getValidAccessToken(base)

  // Fetch the actual change payloads from Airtable
  const payloadData = await airtableFetch<WebhookPayload>(
    `https://api.airtable.com/v0/bases/${base.airtable_base_id}/webhooks/${notification.webhook.id}/payloads`,
    token
  )

  for (const event of payloadData.payloads) {
    if (!event.changedTablesById) continue

    for (const [tableId, tableChanges] of Object.entries(event.changedTablesById)) {
      // Upsert created records
      if (tableChanges.createdRecordsById) {
        const rows = Object.entries(tableChanges.createdRecordsById).map(([recordId, data]) => ({
          connected_base_id: base.id,
          airtable_table_id: tableId,
          airtable_table_name: tableId, // name not available in webhook payload
          airtable_record_id: recordId,
          fields: data.cellValuesByFieldId,
          updated_at: new Date().toISOString(),
        }))
        if (rows.length > 0) {
          await db.from("synced_records").upsert(rows, {
            onConflict: "connected_base_id,airtable_table_id,airtable_record_id",
          })
        }
      }

      // Upsert updated records
      if (tableChanges.changedRecordsById) {
        const rows = Object.entries(tableChanges.changedRecordsById).map(([recordId, data]) => ({
          connected_base_id: base.id,
          airtable_table_id: tableId,
          airtable_table_name: tableId,
          airtable_record_id: recordId,
          fields: data.current.cellValuesByFieldId,
          updated_at: new Date().toISOString(),
        }))
        if (rows.length > 0) {
          await db.from("synced_records").upsert(rows, {
            onConflict: "connected_base_id,airtable_table_id,airtable_record_id",
          })
        }
      }

      // Delete destroyed records
      if (tableChanges.destroyedRecordIds?.length) {
        await db.from("synced_records")
          .delete()
          .eq("connected_base_id", base.id)
          .eq("airtable_table_id", tableId)
          .in("airtable_record_id", tableChanges.destroyedRecordIds)
      }
    }
  }

  // Update last_synced_at
  await db.from("connected_bases").update({
    last_synced_at: new Date().toISOString(),
  }).eq("id", base.id)

  return NextResponse.json({ ok: true })
}
