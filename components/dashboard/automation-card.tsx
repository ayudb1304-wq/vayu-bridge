"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AutomationRunLog } from "./automation-run-log"
import { Activity, Trash2 } from "lucide-react"

type Automation = {
  id: string
  name: string
  enabled: boolean
  trigger_table: string
  trigger_field: string
  trigger_condition: string
  trigger_value: string | null
  action_type: string
  connected_bases: { id: string; base_name: string | null; airtable_base_id: string } | null
}

const ACTION_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  http_post:       { label: "HTTP POST",       variant: "secondary" },
  send_email:      { label: "Send Email",       variant: "secondary" },
  update_airtable: { label: "Update Airtable",  variant: "secondary" },
}

export function AutomationCard({
  automation,
  onToggle,
  onDelete,
}: {
  automation: Automation
  onToggle: (id: string, enabled: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [showRuns, setShowRuns] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleToggle(checked: boolean) {
    setToggling(true)
    await onToggle(automation.id, checked)
    setToggling(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${automation.name}"? This cannot be undone.`)) return
    setDeleting(true)
    await onDelete(automation.id)
  }

  const triggerSummary = (() => {
    const table = automation.trigger_table
    const field = automation.trigger_field
    const cond = automation.trigger_condition
    const val = automation.trigger_value

    if (cond === "any_change") return `Any change in ${table}`
    if (cond === "not_empty") return `${field} is not empty in ${table}`
    if (cond === "eq") return `${field} = "${val}" in ${table}`
    if (cond === "contains") return `${field} contains "${val}" in ${table}`
    return table
  })()

  const action = ACTION_BADGE[automation.action_type] ?? { label: automation.action_type, variant: "outline" as const }
  const baseName = automation.connected_bases?.base_name ?? automation.connected_bases?.airtable_base_id ?? "Unknown base"

  return (
    <>
      <Card className={deleting ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="font-mono text-sm leading-snug truncate">{automation.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{baseName}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant={action.variant} className="text-[10px]">{action.label}</Badge>
              <Switch
                checked={automation.enabled}
                onCheckedChange={handleToggle}
                disabled={toggling}
                aria-label="Toggle automation"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground font-mono truncate" title={triggerSummary}>
            {triggerSummary}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs flex-1" onClick={() => setShowRuns(true)}>
              <Activity className="h-3 w-3" />
              Runs
            </Button>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRuns} onOpenChange={setShowRuns}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{automation.name} — Run Log</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1">
            <AutomationRunLog automationId={automation.id} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
