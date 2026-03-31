"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { type ColumnDef, type VisibilityState } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "./data-table"
import { DataTableToolbar, type ColumnFilter } from "./data-table-toolbar"
import { TableStatsBar } from "./table-stats-bar"
import { TableTabs } from "./table-tabs"
import { useRecords, type SyncedRecord } from "@/hooks/use-records"

type Props = {
  baseId: string
  baseName: string
  tables: string[]
  lastSyncedAt: string | null
  initialColumnKeys: string[]
}

function renderCellValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground/50">—</span>
  if (typeof value === "boolean") return <Badge variant={value ? "default" : "secondary"} className="text-[10px] py-0">{String(value)}</Badge>
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground/50">—</span>
    return (
      <span className="truncate">
        {value.map((v, i) => (
          <span key={i} className="inline-block mr-1 px-1 py-0 bg-muted rounded text-[10px]">
            {typeof v === "object" ? JSON.stringify(v) : String(v)}
          </span>
        ))}
      </span>
    )
  }
  if (typeof value === "object") return <span className="text-muted-foreground/70 truncate">{JSON.stringify(value)}</span>
  return String(value)
}

export function QueryDashboard({ baseId, baseName, tables, lastSyncedAt, initialColumnKeys }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL-driven state
  const activeTable = searchParams.get("table") ?? tables[0] ?? ""
  const search      = searchParams.get("search") ?? ""
  const sort        = searchParams.get("sort") ?? ""
  const filtersRaw  = searchParams.get("filters") ?? ""

  const activeFilters: ColumnFilter[] = useMemo(() => {
    if (!filtersRaw) return []
    try { return JSON.parse(atob(filtersRaw)) } catch { return [] }
  }, [filtersRaw])

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const { records, totalCount, isFetching, hasMore, fetchNextPage } = useRecords({
    baseId,
    table: activeTable,
    search,
    sort,
    filters: filtersRaw,
  })

  // Merge column keys as new pages arrive
  const [extraKeys, setExtraKeys] = useState<string[]>([])
  const knownKeys = useMemo(() => {
    const fromRecords = records.flatMap((r) => Object.keys(r.fields))
    const all = Array.from(new Set([...initialColumnKeys, ...fromRecords, ...extraKeys]))
    if (all.length > extraKeys.length + initialColumnKeys.length) {
      setExtraKeys(all.filter((k) => !initialColumnKeys.includes(k)))
    }
    return all
  }, [records, initialColumnKeys, extraKeys])

  const [colVisibility, setColVisibility] = useState<VisibilityState>({})

  const columns = useMemo((): ColumnDef<SyncedRecord>[] => [
    {
      id: "airtable_record_id",
      header: "Record ID",
      accessorKey: "airtable_record_id",
      cell: (info) => <span className="text-muted-foreground">{info.getValue() as string}</span>,
      enableHiding: true,
    },
    ...knownKeys.map((key): ColumnDef<SyncedRecord> => ({
      id: key,
      header: key,
      accessorFn: (row) => row.fields[key],
      cell: (info) => renderCellValue(info.getValue()),
      enableHiding: true,
    })),
  ], [knownKeys])

  // Filters
  function handleAddFilter(f: ColumnFilter) {
    const next = [...activeFilters, f]
    updateParams({ filters: btoa(JSON.stringify(next)), search: "" })
  }
  function handleRemoveFilter(i: number) {
    const next = activeFilters.filter((_, idx) => idx !== i)
    updateParams({ filters: next.length ? btoa(JSON.stringify(next)) : "" })
  }

  // Export
  const [isExporting, setIsExporting] = useState(false)

  async function fetchAllForExport() {
    const url = new URL(`/api/records/${baseId}`, window.location.origin)
    url.searchParams.set("table", activeTable)
    url.searchParams.set("export", "1")
    if (search) url.searchParams.set("search", search)
    if (sort) url.searchParams.set("sort", sort)
    if (filtersRaw) url.searchParams.set("filters", filtersRaw)
    const res = await fetch(url.toString())
    const json = await res.json()
    return (json.records as SyncedRecord[]).map((r) => ({
      record_id: r.airtable_record_id,
      ...r.fields,
    }))
  }

  async function handleExportCSV() {
    setIsExporting(true)
    try {
      const rows = await fetchAllForExport()
      if (!rows.length) return
      const keys = Object.keys(rows[0])
      const csv = [
        keys.join(","),
        ...rows.map((r) =>
          keys.map((k) => {
            const val = (r as Record<string, unknown>)[k]
            const str = val === null || val === undefined ? "" : typeof val === "object" ? JSON.stringify(val) : String(val)
            return `"${str.replace(/"/g, '""')}"`
          }).join(",")
        ),
      ].join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `${baseName}-${activeTable}.csv`
      a.click()
    } finally { setIsExporting(false) }
  }

  async function handleExportXLSX() {
    setIsExporting(true)
    try {
      const rows = await fetchAllForExport()
      if (!rows.length) return
      const XLSX = await import("xlsx")
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, activeTable.slice(0, 31))
      XLSX.writeFile(wb, `${baseName}-${activeTable}.xlsx`)
    } finally { setIsExporting(false) }
  }

  // Need a stable table instance ref for the toolbar column visibility
  // We pass a dummy table ref — the real table lives in DataTable
  // Instead, lift visibility state here and pass down
  // Simple approach: use a fake table-like object just for the toolbar's column visibility
  const toolbarTableFacade = useMemo(() => ({
    getAllColumns: () => columns.map((c) => {
      const id = (c as any).id ?? (c as any).accessorKey ?? ""
      return {
        id,
        getCanHide: () => true,
        getIsVisible: () => colVisibility[id] !== false,
        toggleVisibility: (v: boolean) =>
          setColVisibility((prev) => ({ ...prev, [id]: v })),
      }
    }),
  }), [columns, colVisibility])

  const visibleColumns = useMemo(
    () => columns.filter((c) => {
      const id = (c as any).id ?? (c as any).accessorKey ?? ""
      return colVisibility[id] !== false
    }),
    [columns, colVisibility]
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-mono text-2xl font-bold tracking-tight">{baseName}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{activeTable}</p>
      </div>

      <TableTabs
        tables={tables}
        activeTable={activeTable}
        onChange={(t) => updateParams({ table: t, search: "", filters: "", sort: "" })}
      />

      <DataTableToolbar
        table={toolbarTableFacade as any}
        columnKeys={knownKeys}
        search={search}
        activeFilters={activeFilters}
        onSearchChange={(v) => updateParams({ search: v })}
        onAddFilter={handleAddFilter}
        onExportCSV={handleExportCSV}
        onExportXLSX={handleExportXLSX}
        isExporting={isExporting}
      />

      <TableStatsBar
        totalCount={totalCount}
        lastSyncedAt={lastSyncedAt}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
      />

      <DataTable
        columns={visibleColumns}
        data={records}
        isFetching={isFetching}
        hasMore={hasMore}
        onBottomReached={fetchNextPage}
      />
    </div>
  )
}
