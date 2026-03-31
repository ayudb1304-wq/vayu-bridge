import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const baseId = new URL(request.url).searchParams.get("baseId")
  if (!baseId) return NextResponse.json({ error: "baseId required" }, { status: 400 })

  // Verify ownership
  const { data: base } = await supabase
    .from("connected_bases")
    .select("id")
    .eq("id", baseId)
    .eq("user_id", user.id)
    .single()

  if (!base) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data } = await supabase
    .from("synced_records")
    .select("airtable_table_name")
    .eq("connected_base_id", baseId)
    .order("airtable_table_name")

  const tables = Array.from(new Set((data ?? []).map(r => r.airtable_table_name)))
  return NextResponse.json({ tables })
}
