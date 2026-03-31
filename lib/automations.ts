import { createServiceClient } from "@/utils/supabase/service"
import { airtableFetch, getValidAccessToken } from "@/lib/airtable"
import { Resend } from "resend"

export type AutomationTriggerCondition = "any_change" | "not_empty" | "eq" | "contains"
export type AutomationActionType = "http_post" | "send_email" | "update_airtable"

export type HttpPostConfig = {
  url: string
  headers: Array<{ key: string; value: string }>
}

export type SendEmailConfig = {
  to: string
  subject: string
  body: string
}

export type UpdateAirtableConfig = {
  field_name: string
  field_value: string
}

type Automation = {
  id: string
  user_id: string
  trigger_table: string
  trigger_field: string
  trigger_condition: AutomationTriggerCondition
  trigger_value: string | null
  action_type: AutomationActionType
  action_config: Record<string, unknown>
}

type ChangedRecord = {
  airtable_record_id: string
  airtable_table_name: string
  fields: Record<string, unknown>
}

type BaseRow = {
  id: string
  airtable_base_id: string
  user_id: string
  access_token_enc: string
  refresh_token_enc: string
  token_expires_at: string | null
}

/** Resolves {{field_name}} template variables from a record's fields */
function resolveTemplate(template: string, fields: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const val = fields[key.trim()]
    if (val === null || val === undefined) return ""
    if (typeof val === "object") return JSON.stringify(val)
    return String(val)
  })
}

/** Evaluates whether a record satisfies an automation's trigger condition */
function matchesCondition(automation: Automation, fields: Record<string, unknown>): boolean {
  const { trigger_condition, trigger_field, trigger_value } = automation

  if (trigger_condition === "any_change") return true

  const fieldVal = fields[trigger_field]

  if (trigger_condition === "not_empty") {
    return fieldVal !== null && fieldVal !== undefined && fieldVal !== ""
  }

  const strVal = fieldVal === null || fieldVal === undefined ? "" : String(fieldVal)

  if (trigger_condition === "eq") {
    return strVal === (trigger_value ?? "")
  }

  if (trigger_condition === "contains") {
    return strVal.toLowerCase().includes((trigger_value ?? "").toLowerCase())
  }

  return false
}

async function executeHttpPost(
  config: HttpPostConfig,
  record: ChangedRecord
): Promise<void> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    for (const h of config.headers ?? []) {
      if (h.key) headers[h.key] = h.value
    }

    const res = await fetch(config.url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        record_id: record.airtable_record_id,
        table: record.airtable_table_name,
        fields: record.fields,
        triggered_at: new Date().toISOString(),
      }),
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } finally {
    clearTimeout(timeout)
  }
}

async function executeEmail(
  config: SendEmailConfig,
  record: ChangedRecord
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const subject = resolveTemplate(config.subject, record.fields)
  const body = resolveTemplate(config.body, record.fields)

  const { error } = await resend.emails.send({
    from: "VayuBridge Automations <automations@vayubridge.com>",
    to: config.to,
    subject,
    text: body,
  })

  if (error) throw new Error(error.message)
}

async function executeUpdateAirtable(
  config: UpdateAirtableConfig,
  record: ChangedRecord,
  base: BaseRow
): Promise<void> {
  const token = await getValidAccessToken(base)
  const fieldValue = resolveTemplate(config.field_value, record.fields)

  await airtableFetch(
    `https://api.airtable.com/v0/${base.airtable_base_id}/${encodeURIComponent(record.airtable_table_name)}/${record.airtable_record_id}`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ fields: { [config.field_name]: fieldValue } }),
    }
  )
}

/**
 * Main entry point — called from the Airtable webhook handler after upserting records.
 * Fetches all enabled automations for the base, evaluates conditions, and executes matching ones.
 * Uses Promise.allSettled so one failure doesn't block others.
 */
export async function executeAutomations(
  db: ReturnType<typeof createServiceClient>,
  base: BaseRow,
  changedRecords: ChangedRecord[]
): Promise<void> {
  if (changedRecords.length === 0) return

  // Single query — partial index on (connected_base_id) where enabled=true keeps this fast
  const { data: automations } = await db
    .from("automations")
    .select("id, user_id, trigger_table, trigger_field, trigger_condition, trigger_value, action_type, action_config")
    .eq("connected_base_id", base.id)
    .eq("enabled", true)

  if (!automations || automations.length === 0) return

  // Group by trigger_table for O(records) lookup instead of O(records × automations)
  const byTable = new Map<string, Automation[]>()
  for (const a of automations as Automation[]) {
    const list = byTable.get(a.trigger_table) ?? []
    list.push(a)
    byTable.set(a.trigger_table, list)
  }

  // Collect all (automation, record) pairs that match
  const tasks: Array<{ automation: Automation; record: ChangedRecord }> = []
  for (const record of changedRecords) {
    const candidates = byTable.get(record.airtable_table_name) ?? []
    for (const automation of candidates) {
      if (matchesCondition(automation, record.fields)) {
        tasks.push({ automation, record })
      }
    }
  }

  if (tasks.length === 0) return

  // Execute all matched tasks concurrently — failures are isolated
  await Promise.allSettled(
    tasks.map(async ({ automation, record }) => {
      let status: "success" | "error" = "success"
      let errorMessage: string | undefined

      try {
        const config = automation.action_config as Record<string, unknown>

        if (automation.action_type === "http_post") {
          await executeHttpPost(config as unknown as HttpPostConfig, record)
        } else if (automation.action_type === "send_email") {
          await executeEmail(config as unknown as SendEmailConfig, record)
        } else if (automation.action_type === "update_airtable") {
          await executeUpdateAirtable(config as unknown as UpdateAirtableConfig, record, base)
        }
      } catch (e) {
        status = "error"
        errorMessage = (e as Error).message
        console.error(`[automations] ${automation.id} failed:`, errorMessage)
      }

      // Log the run (service client — bypasses RLS, correct for server-side execution)
      await db.from("automation_runs").insert({
        automation_id: automation.id,
        user_id: automation.user_id,
        status,
        triggered_by_record_id: record.airtable_record_id,
        error_message: errorMessage ?? null,
      })
    })
  )
}
