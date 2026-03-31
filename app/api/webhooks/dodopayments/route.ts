import { NextResponse } from "next/server"
import { createDodoClient } from "@/lib/dodopayments"
import { createServiceClient } from "@/utils/supabase/service"
import { tierFromProductId } from "@/lib/plans"

export async function POST(request: Request) {
  const body = await request.text()
  const headers = Object.fromEntries(request.headers.entries())

  // Verify webhook signature
  const client = createDodoClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any
  try {
    event = client.webhooks.unwrap(body, {
      headers: {
        "webhook-id": headers["webhook-id"] ?? "",
        "webhook-signature": headers["webhook-signature"] ?? "",
        "webhook-timestamp": headers["webhook-timestamp"] ?? "",
      },
    })
  } catch {
    console.error("Webhook signature verification failed")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const eventType = event.type as string
  const data = event.data as any

  const supabase = createServiceClient()

  try {
    switch (eventType) {
      case "subscription.active": {
        const metadata = data.metadata as Record<string, string> | undefined
        const userId = metadata?.user_id
        const productId = data.product_id as string

        if (!userId) {
          console.error("No user_id in subscription metadata", data)
          break
        }

        const tier = tierFromProductId(productId)
        await supabase
          .from("users")
          .update({
            plan_tier: tier,
            dodo_subscription_id: data.subscription_id as string,
            dodo_customer_id: data.customer_id as string,
          })
          .eq("id", userId)

        console.log(`Upgraded user ${userId} to ${tier}`)
        break
      }

      case "subscription.failed":
      case "subscription.cancelled":
      case "subscription.expired": {
        const metadata = data.metadata as Record<string, string> | undefined
        const userId = metadata?.user_id

        if (!userId) {
          // Fallback: look up user by subscription ID
          const subId = data.subscription_id as string
          const { data: userRow } = await supabase
            .from("users")
            .select("id")
            .eq("dodo_subscription_id", subId)
            .single()

          if (userRow) {
            await supabase
              .from("users")
              .update({ plan_tier: "free", dodo_subscription_id: null })
              .eq("id", userRow.id)
            console.log(`Downgraded user ${userRow.id} to free (${eventType})`)
          }
          break
        }

        await supabase
          .from("users")
          .update({ plan_tier: "free", dodo_subscription_id: null })
          .eq("id", userId)
        console.log(`Downgraded user ${userId} to free (${eventType})`)
        break
      }

      case "subscription.renewed": {
        const metadata = data.metadata as Record<string, string> | undefined
        const userId = metadata?.user_id
        const productId = data.product_id as string

        if (!userId) break

        const tier = tierFromProductId(productId)
        await supabase
          .from("users")
          .update({ plan_tier: tier })
          .eq("id", userId)

        console.log(`Renewed user ${userId} on ${tier}`)
        break
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`)
    }
  } catch (error) {
    console.error(`Error processing ${eventType}:`, error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
