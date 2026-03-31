import { createServiceClient } from "@/utils/supabase/service"
import { Client } from "@upstash/qstash"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Fallback: re-enqueue a full sync for any active base that hasn't synced in >20 min
export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret")
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = createServiceClient()
  const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString()

  const { data: staleBases } = await db
    .from("connected_bases")
    .select("id, user_id")
    .eq("sync_status", "active")
    .or(`last_synced_at.is.null,last_synced_at.lt.${twentyMinsAgo}`)

  if (!staleBases?.length) {
    return NextResponse.json({ polled: 0 })
  }

  const qstash = new Client({ token: process.env.QSTASH_TOKEN! })

  for (const base of staleBases) {
    // Create a sync_log entry and enqueue
    const { data: log } = await db
      .from("sync_log")
      .insert({
        connected_base_id: base.id,
        user_id: base.user_id,
        status: "running",
        message: "Poll sync started",
      })
      .select("id")
      .single()

    if (log) {
      await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/sync/initial`,
        body: { connectedBaseId: base.id, syncLogId: log.id },
      })
    }
  }

  return NextResponse.json({ polled: staleBases.length })
}
