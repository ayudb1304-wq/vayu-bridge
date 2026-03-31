"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Table } from "@tanstack/react-table"
import { Download, Filter, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SyncedRecord } from "@/hooks/use-records"

export type ColumnFilter = {
  column: string
  op: "eq" | "contains" | "gt" | "lt" | "is_empty"
  value: string
}

const OP_LABELS: Record<ColumnFilter["op"], string> = {
  eq: "equals",
  contains: "contains",
  gt: "greater than",
  lt: "less than",
  is_empty: "is empty",
}

type Props = {
  table: ReturnType<typeof import("@tanstack/react-table").useReactTable<SyncedRecord>>
  columnKeys: string[]
  search: string
  activeFilters: ColumnFilter[]
  onSearchChange: (v: string) => void
  onAddFilter: (f: ColumnFilter) => void
  onExportCSV: () => void
  onExportXLSX: () => void
  isExporting: boolean
}

export function DataTableToolbar({
  table,
  columnKeys,
  search,
  activeFilters,
  onSearchChange,
  onAddFilter,
  onExportCSV,
  onExportXLSX,
  isExporting,
}: Props) {
  const [searchValue, setSearchValue] = useState(search)
  const [showFilterBuilder, setShowFilterBuilder] = useState(false)
  const [newFilter, setNewFilter] = useState<ColumnFilter>({
    column: columnKeys[0] ?? "",
    op: "contains",
    value: "",
  })

  // Sync search value when parent resets (e.g. table switch)
  useEffect(() => setSearchValue(search), [search])

  // Debounce search → parent
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearch = (v: string) => {
    setSearchValue(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearchChange(v), 300)
  }

  const handleAddFilter = useCallback(() => {
    if (!newFilter.column) return
    onAddFilter(newFilter)
    setNewFilter({ column: columnKeys[0] ?? "", op: "contains", value: "" })
    setShowFilterBuilder(false)
  }, [newFilter, onAddFilter, columnKeys])

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <Input
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search all fields…"
        className="h-8 w-64 font-mono text-xs"
      />

      {/* Filter builder */}
      <div className="relative">
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5"
          onClick={() => setShowFilterBuilder((v) => !v)}
        >
          <Filter className="h-3.5 w-3.5" />
          Filter
          {activeFilters.length > 0 && (
            <span className="ml-0.5 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0 leading-4">
              {activeFilters.length}
            </span>
          )}
        </Button>

        {showFilterBuilder && (
          <div className="absolute left-0 top-10 z-20 flex flex-col gap-2 rounded-lg border border-border bg-background p-3 shadow-md w-80">
            <p className="text-xs font-medium text-muted-foreground">Add filter</p>
            <Select
              value={newFilter.column}
              onValueChange={(v) => setNewFilter((f) => ({ ...f, column: v }))}
            >
              <SelectTrigger className="h-8 font-mono text-xs">
                <SelectValue placeholder="Column" />
              </SelectTrigger>
              <SelectContent>
                {columnKeys.map((k) => (
                  <SelectItem key={k} value={k} className="font-mono text-xs">
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={newFilter.op}
              onValueChange={(v) => setNewFilter((f) => ({ ...f, op: v as ColumnFilter["op"] }))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(OP_LABELS) as [ColumnFilter["op"], string][]).map(([op, label]) => (
                  <SelectItem key={op} value={op} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {newFilter.op !== "is_empty" && (
              <Input
                value={newFilter.value}
                onChange={(e) => setNewFilter((f) => ({ ...f, value: e.target.value }))}
                placeholder="Value…"
                className="h-8 font-mono text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleAddFilter()}
              />
            )}

            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowFilterBuilder(false)}>
                Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={handleAddFilter}>
                Add
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Column visibility */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="h-8 gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44 max-h-72 overflow-y-auto">
          <DropdownMenuLabel className="text-xs">Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table.getAllColumns().filter((c) => c.getCanHide()).map((col) => (
            <DropdownMenuCheckboxItem
              key={col.id}
              className="font-mono text-xs capitalize"
              checked={col.getIsVisible()}
              onCheckedChange={(v) => col.toggleVisibility(v)}
            >
              {col.id}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Exports */}
      <div className="ml-auto flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5"
          onClick={onExportCSV}
          disabled={isExporting}
        >
          <Download className="h-3.5 w-3.5" />
          CSV
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5"
          onClick={onExportXLSX}
          disabled={isExporting}
        >
          <Download className="h-3.5 w-3.5" />
          Excel
        </Button>
      </div>
    </div>
  )
}
