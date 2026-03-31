"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export function CheckoutRedirect() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const triggered = useRef(false)

  // Check both URL param and localStorage for checkout intent
  const urlPlan = searchParams.get("checkout")

  useEffect(() => {
    if (triggered.current) return
    const plan = urlPlan || localStorage.getItem("checkout_plan")
    if (!plan || (plan !== "growth" && plan !== "scale")) return

    triggered.current = true
    // Clear stored intent immediately
    localStorage.removeItem("checkout_plan")

    async function startCheckout() {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        router.replace("/dashboard")
      }
    }

    startCheckout()
  }, [urlPlan, router])

  return null
}
