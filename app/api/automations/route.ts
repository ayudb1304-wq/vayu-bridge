import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("automations")
    .select(`
      id, name, enabled, trigger_table, trigger_field, trigger_condition, trigger_value,
      action_type, action_config, created_at,
      connected_bases ( id, base_name, airtable_base_id )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ automations: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const {
    connected_base_id, name, enabled = true,
    trigger_table, trigger_field, trigger_condition, trigger_value,
    action_type, action_config,
  } = body

  // Verify base ownership
  const { data: base } = await supabase
    .from("connected_bases")
    .select("id")
    .eq("id", connected_base_id)
    .eq("user_id", user.id)
    .single()

  if (!base) return NextResponse.json({ error: "Base not found" }, { status: 404 })

  const { data, error } = await supabase
    .from("automations")
    .insert({
      user_id: user.id,
      connected_base_id,
      name,
      enabled,
      trigger_table,
      trigger_field: trigger_field ?? "",
      trigger_condition,
      trigger_value: trigger_value ?? null,
      action_type,
      action_config,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ automation: data }, { status: 201 })
}
