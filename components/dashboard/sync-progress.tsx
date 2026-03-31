"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

type SyncLog = {
  id: string
  status: string
  records_synced: number
  message: string | null
  error_message: string | null
  started_at: string
  completed_at: string | null
}

type Props = {
  connectedBaseId: string
  syncLogId: string
  onComplete?: () => void
}

export function SyncProgress({ connectedBaseId, syncLogId, onComplete }: Props) {
  const [log, setLog] = useState<SyncLog | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch
    supabase
      .from("sync_log")
      .select("*")
      .eq("id", syncLogId)
      .single()
      .then(({ data }) => {
        if (data) setLog(data as SyncLog)
      })

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`sync_log:${syncLogId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sync_log",
          filter: `id=eq.${syncLogId}`,
        },
        (payload) => {
          const updated = payload.new as SyncLog
          setLog(updated)
          if (updated.status === "complete" || updated.status === "error") {
            onComplete?.()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [syncLogId, onComplete])

  if (!log) return null

  const isRunning = log.status === "running"
  const isComplete = log.status === "complete"
  const isError = log.status === "error"

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium font-mono">
          {log.message ?? "Syncing…"}
        </span>
        <Badge
          variant={isComplete ? "default" : isError ? "destructive" : "secondary"}
        >
          {isComplete ? "Complete" : isError ? "Error" : "Running"}
        </Badge>
      </div>

      {isRunning && (
        <Progress value={undefined} className="h-1.5 animate-pulse" />
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{log.records_synced.toLocaleString()} records synced</span>
        {isError && log.error_message && (
          <span className="text-destructive truncate max-w-xs">{log.error_message}</span>
        )}
      </div>
    </div>
  )
}
