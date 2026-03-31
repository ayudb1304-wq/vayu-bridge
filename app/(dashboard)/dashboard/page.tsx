import { Suspense } from "react"
import { BaseSelector } from "@/components/dashboard/base-selector"
import { CheckoutRedirect } from "@/components/dashboard/checkout-redirect"

export default function DashboardPage() {
  return (
    <>
      <Suspense>
        <CheckoutRedirect />
      </Suspense>
      <BaseSelector />
    </>
  )
}
