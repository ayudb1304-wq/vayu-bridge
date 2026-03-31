import { createClient } from "@/utils/supabase/server"
import { getPlanLimits } from "@/lib/plans"
import type { PlanTier } from "@/lib/plans"
import { UsageBar } from "./usage-bar"

export async function UsageBarServer({ userId }: { userId: string }) {
  const supabase = await createClient()

  const [{ data: userRow }, { count: recordCount }, { count: baseCount }, { count: automationCount }] =
    await Promise.all([
      supabase.from("users").select("plan_tier").eq("id", userId).single(),
      supabase.from("synced_records").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("connected_bases").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("automations").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ])

  const planTier = (userRow?.plan_tier ?? "free") as PlanTier
  const limits = getPlanLimits(planTier)

  return (
    <UsageBar
      planTier={planTier}
      limits={limits}
      recordCount={recordCount ?? 0}
      baseCount={baseCount ?? 0}
      automationCount={automationCount ?? 0}
    />
  )
}
