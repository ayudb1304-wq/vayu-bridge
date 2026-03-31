"use client"

import { useEffect, useRef, useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Maximize2 } from "lucide-react"
import type { SyncedRecord } from "@/hooks/use-records"

type Props = {
  columns: ColumnDef<SyncedRecord>[]
  data: SyncedRecord[]
  isFetching: boolean
  hasMore: boolean
  onBottomReached: () => void
}

/** Returns a plain string representation of any cell value for expand/copy */
function cellToString(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "object") return JSON.stringify(value, null, 2)
  return String(value)
}

const EXPAND_THRESHOLD = 30 // chars — shorter values don't get the expand icon

export function DataTable({ columns, data, isFetching, hasMore, onBottomReached }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [expandedValue, setExpandedValue] = useState<{ label: string; text: string } | null>(null)

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
    <>
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
                    {row.getVisibleCells().map((cell) => {
                      const rawValue = cell.getValue()
                      const str = cellToString(rawValue)
                      const isLong = str.length > EXPAND_THRESHOLD

                      return (
                        <TableCell
                          key={cell.id}
                          className="font-mono text-xs max-w-[240px] group"
                        >
                          <div className="flex items-start gap-1 min-w-0">
                            <span className="truncate flex-1">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </span>
                            {isLong && (
                              <button
                                onClick={() => setExpandedValue({
                                  label: String(cell.column.columnDef.header ?? cell.column.id),
                                  text: str,
                                })}
                                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                aria-label="Expand cell"
                              >
                                <Maximize2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      )
                    })}
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

        {hasMore && <div ref={sentinelRef} className="h-4" />}
      </div>

      {/* Single shared expand dialog — only one in the DOM regardless of row count */}
      <Dialog open={!!expandedValue} onOpenChange={(o) => !o && setExpandedValue(null)}>
        <DialogContent className="max-w-xl max-h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{expandedValue?.label}</DialogTitle>
          </DialogHeader>
          <pre className="overflow-auto flex-1 rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap break-words">
            {expandedValue?.text}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  )
}
