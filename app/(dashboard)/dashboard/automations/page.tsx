"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AutomationCard } from "@/components/dashboard/automation-card"
import { AutomationBuilder } from "@/components/dashboard/automation-builder"
import { Plus, Zap } from "lucide-react"

type ConnectedBase = { id: string; base_name: string | null; airtable_base_id: string }
type Automation = {
  id: string
  name: string
  enabled: boolean
  trigger_table: string
  trigger_field: string
  trigger_condition: string
  trigger_value: string | null
  action_type: string
  connected_bases: ConnectedBase | null
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [bases, setBases] = useState<ConnectedBase[]>([])
  const [loading, setLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)

  const fetchAll = useCallback(async () => {
    const [autoRes, baseRes] = await Promise.all([
      fetch("/api/automations"),
      fetch("/api/airtable/bases"),
    ])
    const [autoJson, baseJson] = await Promise.all([autoRes.json(), baseRes.json()])
    setAutomations(autoJson.automations ?? [])
    setBases(baseJson.bases ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleToggle(id: string, enabled: boolean) {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled } : a))
    await fetch(`/api/automations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    })
  }

  async function handleDelete(id: string) {
    await fetch(`/api/automations/${id}`, { method: "DELETE" })
    setAutomations(prev => prev.filter(a => a.id !== id))
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading automations…</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">Automations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {automations.length} automation{automations.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <Button onClick={() => setShowBuilder(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Automation
        </Button>
      </div>

      {automations.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4">
          <Zap className="h-10 w-10 text-muted-foreground/40" />
          <div className="space-y-1">
            <p className="font-mono font-semibold">No automations yet</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Automations fire on Airtable record changes — send emails, POST webhooks, or update records automatically.
            </p>
          </div>
          <Button onClick={() => setShowBuilder(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create your first automation
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {automations.map(a => (
            <AutomationCard
              key={a.id}
              automation={a}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Sheet open={showBuilder} onOpenChange={setShowBuilder}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-mono">New Automation</SheetTitle>
          </SheetHeader>
          {bases.length === 0 ? (
            <p className="text-sm text-muted-foreground">Connect a base and run a sync first.</p>
          ) : (
            <AutomationBuilder
              bases={bases}
              onSuccess={() => { setShowBuilder(false); fetchAll() }}
              onCancel={() => setShowBuilder(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
