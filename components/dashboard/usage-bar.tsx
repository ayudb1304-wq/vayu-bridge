"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
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
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Plan: <span className="font-medium text-foreground capitalize">{planTier}</span>
        </span>
        {nextPlan && (
          <Button variant="ghost" size="sm" onClick={() => handleUpgrade(nextPlan)}>
            Upgrade to {nextPlan}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <UsageRow
          label="Records"
          current={recordCount}
          max={limits.maxSyncedRecords}
          pct={recordPct}
        />
        <UsageRow
          label="Bases"
          current={baseCount}
          max={limits.maxConnectedBases}
          pct={basePct}
        />
        <UsageRow
          label="Automations"
          current={automationCount}
          max={limits.maxAutomations}
          pct={automationPct}
        />
      </div>

      {showUpgrade && nextPlan && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You&apos;re approaching your plan limits.</span>
            <Button size="sm" variant="outline" onClick={() => handleUpgrade(nextPlan)}>
              Upgrade to {nextPlan}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function UsageRow({ label, current, max, pct }: { label: string; current: number; max: number; pct: number }) {
  if (max === -1) {
    return (
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{current.toLocaleString()} (unlimited)</span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>
          {current.toLocaleString()} / {max.toLocaleString()} ({pct}%)
        </span>
      </div>
      <Progress value={pct} className={pct >= 90 ? "[&>div]:bg-destructive" : pct >= 80 ? "[&>div]:bg-yellow-500" : ""} />
    </div>
  )
}
