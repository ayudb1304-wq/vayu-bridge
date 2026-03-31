import DodoPayments from "dodopayments"

export function createDodoClient() {
  return new DodoPayments({
    bearerToken: process.env.DODO_API_KEY!,
    environment: process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
  })
}

export const PRODUCT_IDS = {
  growth: process.env.GROWTH_PRODUCT_ID!,
  scale: process.env.SCALE_PRODUCT_ID!,
} as const
