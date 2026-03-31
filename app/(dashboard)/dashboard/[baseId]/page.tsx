import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { QueryDashboard } from "@/components/dashboard/query-dashboard"
import { Suspense } from "react"

export default async function BaseQueryPage({
  params,
}: {
  params: Promise<{ baseId: string }>
}) {
  const { baseId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // Verify ownership and get base info
  const { data: base } = await supabase
    .from("connected_bases")
    .select("id, base_name, airtable_base_id, last_synced_at, sync_status")
    .eq("id", baseId)
    .eq("user_id", user.id)
    .single()

  if (!base) notFound()

  // Discover distinct tables
  const { data: tableRows } = await supabase
    .from("synced_records")
    .select("airtable_table_name")
    .eq("connected_base_id", baseId)
    .order("airtable_table_name")

  const tables = Array.from(new Set((tableRows ?? []).map((r) => r.airtable_table_name)))

  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <h1 className="font-mono text-2xl font-bold">{base.base_name ?? base.airtable_base_id}</h1>
        <p className="text-muted-foreground">
          No records synced yet.{" "}
          {base.sync_status === "pending" ? "Trigger a sync from the dashboard." : ""}
        </p>
      </div>
    )
  }

  const firstTable = tables[0]

  // Fetch first page server-side (avoids loading flash)
  const { data: firstPageRows } = await supabase
    .from("synced_records")
    .select("id, airtable_record_id, fields")
    .eq("connected_base_id", baseId)
    .eq("airtable_table_name", firstTable)
    .order("created_at", { ascending: true })
    .limit(50)

  const firstPageRecords = (firstPageRows ?? []) as Array<{
    id: string
    airtable_record_id: string
    fields: Record<string, unknown>
  }>

  const initialColumnKeys = Array.from(
    new Set(firstPageRecords.flatMap((r) => Object.keys(r.fields ?? {})))
  )

  return (
    <Suspense>
      <QueryDashboard
        baseId={baseId}
        baseName={base.base_name ?? base.airtable_base_id}
        tables={tables}
        lastSyncedAt={base.last_synced_at}
        initialColumnKeys={initialColumnKeys}
      />
    </Suspense>
  )
}
