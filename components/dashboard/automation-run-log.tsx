"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw } from "lucide-react"

type Run = {
  id: string
  status: "success" | "error"
  triggered_by_record_id: string | null
  error_message: string | null
  executed_at: string
}

export function AutomationRunLog({ automationId }: { automationId: string }) {
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchRuns() {
    setLoading(true)
    const res = await fetch(`/api/automations/${automationId}/runs`)
    const json = await res.json()
    setRuns(json.runs ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchRuns() }, [automationId])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Last 50 runs</p>
        <Button size="sm" variant="ghost" onClick={fetchRuns} disabled={loading} className="h-7 gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {runs.length === 0 && !loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">No runs yet.</p>
      ) : (
        <div className="rounded-md border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs font-mono">Status</TableHead>
                <TableHead className="text-xs font-mono">Record</TableHead>
                <TableHead className="text-xs font-mono">Time</TableHead>
                <TableHead className="text-xs font-mono">Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
                    <Badge variant={run.status === "success" ? "default" : "destructive"} className="text-[10px]">
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {run.triggered_by_record_id ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {new Date(run.executed_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-destructive max-w-[200px] truncate">
                    {run.error_message ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
