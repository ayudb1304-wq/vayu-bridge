"use client"

import { useEffect, useRef } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { SyncedRecord } from "@/hooks/use-records"

type Props = {
  columns: ColumnDef<SyncedRecord>[]
  data: SyncedRecord[]
  isFetching: boolean
  hasMore: boolean
  onBottomReached: () => void
}

export function DataTable({ columns, data, isFetching, hasMore, onBottomReached }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onBottomReached() },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onBottomReached])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="relative flex flex-col min-h-0">
      <div className="overflow-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-mono text-xs whitespace-nowrap"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 && !isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground text-sm"
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="font-mono text-xs max-w-[240px] truncate"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
            {isFetching && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-3 text-center text-xs text-muted-foreground"
                >
                  Loading…
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Scroll sentinel for infinite load */}
      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  )
}
