import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  // Verify automation belongs to user before returning runs
  const { data: automation } = await supabase
    .from("automations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!automation) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data, error } = await supabase
    .from("automation_runs")
    .select("id, status, triggered_by_record_id, error_message, executed_at")
    .eq("automation_id", id)
    .order("executed_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ runs: data })
}
