import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export type RecordsResponse = {
  records: Array<{
    id: string
    airtable_record_id: string
    fields: Record<string, unknown>
  }>
  nextCursor: string | null
  totalCount: number | null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ baseId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { baseId } = await params
  const { searchParams } = new URL(request.url)

  const table    = searchParams.get("table") ?? ""
  const cursor   = searchParams.get("cursor")
  const search   = searchParams.get("search") ?? ""
  const sortRaw  = searchParams.get("sort") ?? ""
  const filtersRaw = searchParams.get("filters") ?? ""
  const isExport = searchParams.get("export") === "1"

  if (!table) return NextResponse.json({ error: "table param required" }, { status: 400 })

  // Verify base ownership
  const { data: base } = await supabase
    .from("connected_bases")
    .select("id")
    .eq("id", baseId)
    .eq("user_id", user.id)
    .single()

  if (!base) return NextResponse.json({ error: "Base not found" }, { status: 404 })

  const PAGE_SIZE = isExport ? 10000 : 50

  let query = supabase
    .from("synced_records")
    .select("id, airtable_record_id, fields", cursor ? undefined : { count: "exact" })
    .eq("connected_base_id", baseId)
    .eq("airtable_table_name", table)

  // Search — cast entire JSONB to text
  if (search) {
    query = query.ilike("fields::text", `%${search}%`)
  }

  // Column filters
  if (filtersRaw) {
    try {
      const filters = JSON.parse(atob(filtersRaw)) as Array<{
        column: string
        op: "eq" | "contains" | "gt" | "lt" | "is_empty"
        value: string
      }>
      for (const f of filters) {
        const path = `fields->>${f.column}`
        switch (f.op) {
          case "eq":       query = query.filter(path, "eq",    f.value); break
          case "contains": query = query.filter(path, "ilike", `%${f.value}%`); break
          case "gt":       query = query.filter(path, "gt",    f.value); break
          case "lt":       query = query.filter(path, "lt",    f.value); break
          case "is_empty": query = (query as any).or(`${path}.is.null,${path}.eq.`); break
        }
      }
    } catch { /* malformed filter — ignore */ }
  }

  // Sorting
  if (sortRaw) {
    for (const part of sortRaw.split(",")) {
      const [col, dir] = part.split(":")
      if (col && (dir === "asc" || dir === "desc")) {
        query = query.order(`fields->>${col}` as any, { ascending: dir === "asc" })
      }
    }
  }

  // Cursor (always sort by created_at for stable pagination)
  query = query.order("created_at", { ascending: true })
  if (cursor) {
    query = query.gt("created_at", cursor)
  }

  query = query.limit(PAGE_SIZE)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const records = (data ?? []) as Array<{ id: string; airtable_record_id: string; fields: Record<string, unknown>; created_at?: string }>
  const lastRecord = records.at(-1)
  const nextCursor = !isExport && records.length === PAGE_SIZE && lastRecord
    ? (lastRecord as any).created_at ?? null
    : null

  return NextResponse.json({
    records: records.map(({ id, airtable_record_id, fields }) => ({ id, airtable_record_id, fields })),
    nextCursor,
    totalCount: cursor ? null : (count ?? null),
  } satisfies RecordsResponse)
}
