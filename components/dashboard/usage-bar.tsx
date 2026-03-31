"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import { usagePercent } from "@/lib/plans"
import type { PlanLimits, PlanTier } from "@/lib/plans"

interface UsageBarProps {
  planTier: PlanTier
  limits: PlanLimits
  recordCount: number
  baseCount: number
  automationCount: number
}

export function UsageBar({ planTier, limits, recordCount, baseCount, automationCount }: UsageBarProps) {
  const [showUpgrade, setShowUpgrade] = useState(false)

  const recordPct = usagePercent(recordCount, limits.maxSyncedRecords)
  const basePct = usagePercent(baseCount, limits.maxConnectedBases)
  const automationPct = usagePercent(automationCount, limits.maxAutomations)
  const maxPct = Math.max(recordPct, basePct, automationPct)

  useEffect(() => {
    setShowUpgrade(maxPct >= 80)
  }, [maxPct])

  async function handleUpgrade(plan: "growth" | "scale") {
    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
  }

  const nextPlan = planTier === "free" ? "growth" : planTier === "growth" ? "scale" : null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {planTier} plan
        </span>
        {nextPlan && (
          <button
            onClick={() => handleUpgrade(nextPlan)}
            className="flex items-center gap-0.5 text-[11px] font-medium text-foreground hover:underline"
          >
            Upgrade <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <UsageRow label="Records" current={recordCount} max={limits.maxSyncedRecords} pct={recordPct} />
        <UsageRow label="Bases" current={baseCount} max={limits.maxConnectedBases} pct={basePct} />
        <UsageRow label="Automations" current={automationCount} max={limits.maxAutomations} pct={automationPct} />
      </div>

      {showUpgrade && nextPlan && (
        <Button
          size="sm"
          variant="outline"
          className="mt-1 h-7 w-full text-[11px]"
          onClick={() => handleUpgrade(nextPlan)}
        >
          Upgrade to {nextPlan}
        </Button>
      )}
    </div>
  )
}

function UsageRow({ label, current, max, pct }: { label: string; current: number; max: number; pct: number }) {
  if (max === -1) {
    return (
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span>{current.toLocaleString()}</span>
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span>{current.toLocaleString()}/{max.toLocaleString()}</span>
      </div>
      <Progress
        value={pct}
        className={`h-1 ${pct >= 90 ? "[&>div]:bg-destructive" : pct >= 80 ? "[&>div]:bg-yellow-500" : ""}`}
      />
    </div>
  )
}
