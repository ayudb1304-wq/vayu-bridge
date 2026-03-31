"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConnectAirtableButton } from "./connect-airtable-button"
import { SyncProgress } from "./sync-progress"
import { Database, RefreshCw } from "lucide-react"

type ConnectedBase = {
  id: string
  airtable_base_id: string
  base_name: string | null
  sync_status: string
  last_synced_at: string | null
}

type SyncState = { logId: string; baseId: string } | null

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending sync", variant: "secondary" },
  active:  { label: "Synced",       variant: "default" },
  error:   { label: "Error",        variant: "destructive" },
}

export function BaseSelector() {
  const [bases, setBases] = useState<ConnectedBase[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<SyncState>(null)
  const [syncingBaseId, setSyncingBaseId] = useState<string | null>(null)

  const fetchBases = useCallback(() => {
    fetch("/api/airtable/bases")
      .then((r) => r.json())
      .then(({ bases }) => setBases(bases ?? []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchBases() }, [fetchBases])

  async function handleSync(connectedBaseId: string) {
    setSyncingBaseId(connectedBaseId)
    try {
      const res = await fetch("/api/sync/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectedBaseId }),
      })
      const { syncLogId } = await res.json()
      if (syncLogId) setSyncing({ logId: syncLogId, baseId: connectedBaseId })
    } finally {
      setSyncingBaseId(null)
    }
  }

  function handleSyncComplete() {
    setSyncing(null)
    fetchBases() // refresh status
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading connected bases…</p>
  }

  if (bases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <div className="space-y-2">
          <h1 className="font-mono text-3xl font-bold tracking-tight">No bases connected yet</h1>
          <p className="text-muted-foreground max-w-sm">
            Connect your Airtable base to start syncing records — no limits, no migration.
          </p>
        </div>
        <ConnectAirtableButton />
        <p className="text-xs text-muted-foreground">
          No credit card required · 90 seconds · Your base is unchanged
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">Connected Bases</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bases.length} base{bases.length !== 1 ? "s" : ""} connected
          </p>
        </div>
        <ConnectAirtableButton />
      </div>

      {syncing && (
        <SyncProgress
          connectedBaseId={syncing.baseId}
          syncLogId={syncing.logId}
          onComplete={handleSyncComplete}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bases.map((base) => {
          const status = STATUS_LABEL[base.sync_status] ?? { label: base.sync_status, variant: "outline" as const }
          const isSyncing = syncing?.baseId === base.id || syncingBaseId === base.id

          return (
            <Card key={base.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <Database className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <Badge variant={status.variant} className="ml-auto">{status.label}</Badge>
                </div>
                <CardTitle className="font-mono text-base leading-snug">
                  {base.base_name ?? base.airtable_base_id}
                </CardTitle>
                <CardDescription className="font-mono text-xs">{base.airtable_base_id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {base.last_synced_at
                    ? `Last synced ${new Date(base.last_synced_at).toLocaleString()}`
                    : "Not yet synced"}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSync(base.id)}
                  disabled={isSyncing || !!syncing}
                >
                  <RefreshCw className={`mr-2 h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Starting…" : "Sync Now"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
