"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"
import type { AutomationActionType, AutomationTriggerCondition, HttpPostConfig, SendEmailConfig, UpdateAirtableConfig } from "@/lib/automations"

type ConnectedBase = { id: string; base_name: string | null; airtable_base_id: string }

type Props = {
  bases: ConnectedBase[]
  onSuccess: () => void
  onCancel: () => void
}

const CONDITION_LABELS: Record<AutomationTriggerCondition, string> = {
  any_change: "changes (any value)",
  not_empty:  "is not empty",
  eq:         "equals",
  contains:   "contains",
}

const ACTION_LABELS: Record<AutomationActionType, string> = {
  http_post:        "HTTP POST",
  send_email:       "Send Email",
  update_airtable:  "Update Airtable Record",
}

export function AutomationBuilder({ bases, onSuccess, onCancel }: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Core fields
  const [name, setName] = useState("")
  const [enabled, setEnabled] = useState(true)
  const [baseId, setBaseId] = useState(bases[0]?.id ?? "")

  // Trigger
  const [tables, setTables] = useState<string[]>([])
  const [triggerTable, setTriggerTable] = useState("")
  const [triggerField, setTriggerField] = useState("")
  const [triggerCondition, setTriggerCondition] = useState<AutomationTriggerCondition>("any_change")
  const [triggerValue, setTriggerValue] = useState("")

  // Action
  const [actionType, setActionType] = useState<AutomationActionType>("http_post")
  // http_post
  const [postUrl, setPostUrl] = useState("")
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([])
  // send_email
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  // update_airtable
  const [updateField, setUpdateField] = useState("")
  const [updateValue, setUpdateValue] = useState("")

  // Load tables when base changes
  useEffect(() => {
    if (!baseId) return
    fetch(`/api/records/${baseId}?table=__meta_tables__`)
      .catch(() => null)

    // Query distinct tables from synced_records via the bases API
    fetch(`/api/airtable/bases`)
      .then(r => r.json())
      .then(({ bases: allBases }) => {
        // We can't query tables directly without a dedicated endpoint.
        // Use a lightweight fetch to get the table list from the records API with a meta flag.
        // Instead, fall back to a direct synced_records query via the records endpoint
        // by trying the first page and noting the table name — but that's roundabout.
        // For v1, expose tables from the existing records API as a separate lightweight call.
      })
      .catch(() => null)

    // Call a tables endpoint
    fetch(`/api/automations/tables?baseId=${baseId}`)
      .then(r => r.ok ? r.json() : { tables: [] })
      .then(({ tables: t }) => {
        setTables(t ?? [])
        setTriggerTable(t?.[0] ?? "")
      })
      .catch(() => setTables([]))
  }, [baseId])

  function buildActionConfig(): HttpPostConfig | SendEmailConfig | UpdateAirtableConfig {
    if (actionType === "http_post") {
      return { url: postUrl, headers: headers.filter(h => h.key) }
    }
    if (actionType === "send_email") {
      return { to: emailTo, subject: emailSubject, body: emailBody }
    }
    return { field_name: updateField, field_value: updateValue }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connected_base_id: baseId,
          name: name.trim(),
          enabled,
          trigger_table: triggerTable,
          trigger_field: triggerField.trim(),
          trigger_condition: triggerCondition,
          trigger_value: (triggerCondition === "eq" || triggerCondition === "contains") ? triggerValue : null,
          action_type: actionType,
          action_config: buildActionConfig(),
        }),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? "Failed to save")
      }
      onSuccess()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const needsValue = triggerCondition === "eq" || triggerCondition === "contains"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name + enabled */}
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1">
          <Label htmlFor="auto-name" className="text-xs">Automation name</Label>
          <Input
            id="auto-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Notify on status change"
            required
            className="h-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <Switch checked={enabled} onCheckedChange={setEnabled} id="auto-enabled" />
          <Label htmlFor="auto-enabled" className="text-xs text-muted-foreground">Enabled</Label>
        </div>
      </div>

      <Separator />

      {/* Trigger */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trigger</p>

        <div className="space-y-1">
          <Label className="text-xs">Base</Label>
          <Select value={baseId} onValueChange={setBaseId}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select base" />
            </SelectTrigger>
            <SelectContent>
              {bases.map(b => (
                <SelectItem key={b.id} value={b.id} className="text-sm">
                  {b.base_name ?? b.airtable_base_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Table</Label>
          {tables.length > 0 ? (
            <Select value={triggerTable} onValueChange={setTriggerTable}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map(t => (
                  <SelectItem key={t} value={t} className="text-sm font-mono">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={triggerTable}
              onChange={e => setTriggerTable(e.target.value)}
              placeholder="Table name (sync first to populate)"
              className="h-8 text-sm font-mono"
              required
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Field</Label>
            <Input
              value={triggerField}
              onChange={e => setTriggerField(e.target.value)}
              placeholder="Field name"
              className="h-8 text-sm font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Condition</Label>
            <Select value={triggerCondition} onValueChange={v => setTriggerCondition(v as AutomationTriggerCondition)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(CONDITION_LABELS) as [AutomationTriggerCondition, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k} className="text-sm">{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {needsValue && (
          <div className="space-y-1">
            <Label className="text-xs">Value</Label>
            <Input
              value={triggerValue}
              onChange={e => setTriggerValue(e.target.value)}
              placeholder="Value to match"
              className="h-8 text-sm font-mono"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Action */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</p>

        <div className="space-y-1">
          <Label className="text-xs">Action type</Label>
          <Select value={actionType} onValueChange={v => setActionType(v as AutomationActionType)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(ACTION_LABELS) as [AutomationActionType, string][]).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-sm">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {actionType === "http_post" && (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">URL</Label>
              <Input value={postUrl} onChange={e => setPostUrl(e.target.value)} placeholder="https://" required className="h-8 text-sm font-mono" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Headers (optional)</Label>
                {headers.length < 3 && (
                  <button type="button" onClick={() => setHeaders(h => [...h, { key: "", value: "" }])} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                )}
              </div>
              {headers.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={h.key} onChange={e => setHeaders(hs => hs.map((x, j) => j === i ? { ...x, key: e.target.value } : x))} placeholder="Header name" className="h-7 text-xs font-mono flex-1" />
                  <Input value={h.value} onChange={e => setHeaders(hs => hs.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} placeholder="Value" className="h-7 text-xs font-mono flex-1" />
                  <button type="button" onClick={() => setHeaders(hs => hs.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {actionType === "send_email" && (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder="recipient@example.com" type="email" required className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Subject</Label>
              <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="e.g. Order {{Status}} updated" required className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Body</Label>
              <textarea
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                placeholder={"Record {{Name}} changed.\n\nStatus: {{Status}}"}
                required
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-[11px] text-muted-foreground">Use <code className="font-mono bg-muted px-1 rounded">{"{{field_name}}"}</code> to insert record values.</p>
            </div>
          </div>
        )}

        {actionType === "update_airtable" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Field to update</Label>
                <Input value={updateField} onChange={e => setUpdateField(e.target.value)} placeholder="Field name" required className="h-8 text-sm font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">New value</Label>
                <Input value={updateValue} onChange={e => setUpdateValue(e.target.value)} placeholder="Value or {{field}}" required className="h-8 text-sm font-mono" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">⚠ Updating a field that re-triggers this automation can cause a loop.</p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving}>{saving ? "Saving…" : "Create automation"}</Button>
      </div>
    </form>
  )
}
