"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export function CheckoutRedirect() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const triggered = useRef(false)
  const plan = searchParams.get("checkout")

  useEffect(() => {
    if (!plan || triggered.current) return
    if (plan !== "growth" && plan !== "scale") return
    triggered.current = true

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
        // Clear the param if checkout fails
        router.replace("/dashboard")
      }
    }

    startCheckout()
  }, [plan, router])

  if (!plan) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center space-y-2">
        <div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        <p className="text-sm text-muted-foreground">Redirecting to checkout…</p>
      </div>
    </div>
  )
}
