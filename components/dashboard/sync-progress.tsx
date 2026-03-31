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
    let done = false

    async function fetchLog() {
      const { data } = await supabase
        .from("sync_log")
        .select("*")
        .eq("id", syncLogId)
        .single()
      if (!data || done) return
      setLog(data as SyncLog)
      if (data.status === "complete" || data.status === "error") {
        done = true
        onComplete?.()
      }
    }

    // Initial fetch
    fetchLog()

    // Polling fallback — catches updates when realtime is slow or misses events
    const poll = setInterval(fetchLog, 1500)

    // Realtime subscription — delivers updates faster when WebSocket is ready
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
          if (done) return
          const updated = payload.new as SyncLog
          setLog(updated)
          if (updated.status === "complete" || updated.status === "error") {
            done = true
            clearInterval(poll)
            onComplete?.()
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[SyncProgress] realtime channel error — polling only")
        }
      })

    return () => {
      done = true
      clearInterval(poll)
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
