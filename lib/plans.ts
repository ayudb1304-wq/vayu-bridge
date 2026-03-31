export type PlanTier = "free" | "growth" | "scale"

export interface PlanLimits {
  maxSyncedRecords: number
  maxConnectedBases: number
  maxAutomations: number
  csvExport: boolean
  excelExport: boolean
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxSyncedRecords: 5_000,
    maxConnectedBases: 1,
    maxAutomations: 5,
    csvExport: false,
    excelExport: false,
  },
  growth: {
    maxSyncedRecords: 50_000,
    maxConnectedBases: 3,
    maxAutomations: 25,
    csvExport: true,
    excelExport: true,
  },
  scale: {
    maxSyncedRecords: 500_000,
    maxConnectedBases: -1, // unlimited
    maxAutomations: -1, // unlimited
    csvExport: true,
    excelExport: true,
  },
}

export function getPlanLimits(tier: string): PlanLimits {
  return PLAN_LIMITS[(tier as PlanTier) ?? "free"] ?? PLAN_LIMITS.free
}

export function isAtLimit(current: number, max: number): boolean {
  return max !== -1 && current >= max
}

export function usagePercent(current: number, max: number): number {
  if (max === -1) return 0
  return Math.min(Math.round((current / max) * 100), 100)
}

/** Maps Dodo product IDs back to plan tiers */
export function tierFromProductId(productId: string): PlanTier {
  if (productId === process.env.GROWTH_PRODUCT_ID) return "growth"
  if (productId === process.env.SCALE_PRODUCT_ID) return "scale"
  return "free"
}
