"use client"

import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

type ActiveFilter = {
  column: string
  op: string
  value: string
}

type Props = {
  totalCount: number | null
  filteredCount?: number | null
  lastSyncedAt: string | null
  activeFilters: ActiveFilter[]
  onRemoveFilter: (index: number) => void
}

export function TableStatsBar({
  totalCount,
  filteredCount,
  lastSyncedAt,
  activeFilters,
  onRemoveFilter,
}: Props) {
  const isFiltered = activeFilters.length > 0 || filteredCount !== totalCount

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span className="font-mono">
        {isFiltered && filteredCount !== null
          ? `${filteredCount?.toLocaleString()} of ${totalCount?.toLocaleString() ?? "…"} records`
          : `${totalCount?.toLocaleString() ?? "…"} records`}
      </span>

      {lastSyncedAt && (
        <>
          <span className="text-border">·</span>
          <span>Last synced {new Date(lastSyncedAt).toLocaleString()}</span>
        </>
      )}

      {activeFilters.map((f, i) => (
        <Badge key={i} variant="secondary" className="font-mono gap-1 pl-2 pr-1">
          {f.column} {f.op} {f.value || "empty"}
          <button
            onClick={() => onRemoveFilter(i)}
            className="ml-0.5 hover:text-foreground"
            aria-label={`Remove filter on ${f.column}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  )
}
