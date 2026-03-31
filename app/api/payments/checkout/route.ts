import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createDodoClient, PRODUCT_IDS } from "@/lib/dodopayments"
import type { PlanTier } from "@/lib/plans"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { plan } = (await request.json()) as { plan?: string }

  if (plan !== "growth" && plan !== "scale") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const productId = PRODUCT_IDS[plan as Exclude<PlanTier, "free">]
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  try {
    const client = createDodoClient()
    const session = await client.subscriptions.create({
      billing: {
        city: "",
        country: "US",
        state: "",
        street: "",
        zipcode: "",
      },
      customer: {
        email: user.email!,
        name: user.email!,
      },
      product_id: productId,
      quantity: 1,
      payment_link: true,
      return_url: `${siteUrl}/dashboard?upgraded=true`,
      metadata: {
        user_id: user.id,
        plan_tier: plan,
      },
    })

    return NextResponse.json({ url: session.payment_link })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
