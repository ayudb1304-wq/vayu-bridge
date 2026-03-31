import { createClient } from "@/utils/supabase/server"
import { createServiceClient } from "@/utils/supabase/service"
import { createQStashClient } from "@/lib/qstash"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { connectedBaseId } = body as { connectedBaseId?: string }

    if (!connectedBaseId) {
      return NextResponse.json({ error: "connectedBaseId required" }, { status: 400 })
    }

    // Verify the base belongs to this user
    const { data: base } = await supabase
      .from("connected_bases")
      .select("id")
      .eq("id", connectedBaseId)
      .eq("user_id", user.id)
      .single()

    if (!base) {
      return NextResponse.json({ error: "Base not found" }, { status: 404 })
    }

    // Create a sync_log entry
    const db = createServiceClient()
    const { data: log, error: logError } = await db
      .from("sync_log")
      .insert({
        connected_base_id: connectedBaseId,
        user_id: user.id,
        status: "running",
        message: "Starting sync…",
      })
      .select("id")
      .single()

    if (logError || !log) {
      return NextResponse.json(
        { error: "Failed to create sync log", detail: logError?.message },
        { status: 500 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_SITE_URL env var not set" }, { status: 500 })
    }

    const workerUrl = `${siteUrl}/api/sync/initial`
    const workerBody = JSON.stringify({ connectedBaseId, syncLogId: log.id })

    if (process.env.NODE_ENV === "development") {
      // In dev, call the worker directly (QStash can't reach localhost)
      console.log("[enqueue] dev mode — calling worker directly:", workerUrl)
      fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-dev-bypass": "true" },
        body: workerBody,
      }).catch((e) => console.error("[enqueue] worker fetch error:", e))
    } else {
      console.log("[enqueue] publishing to QStash:", workerUrl)
      const qstash = createQStashClient()
      const result = await qstash.publishJSON({ url: workerUrl, body: JSON.parse(workerBody) })
      console.log("[enqueue] QStash messageId:", result.messageId)
    }

    return NextResponse.json({ syncLogId: log.id })
  } catch (err) {
    console.error("[sync/enqueue]", err)
    return NextResponse.json(
      { error: "Internal server error", detail: (err as Error).message },
      { status: 500 }
    )
  }
}
