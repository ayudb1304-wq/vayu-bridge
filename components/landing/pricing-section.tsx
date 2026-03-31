"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Check, Minus, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type PlanFeature = {
  label: string
  free: string | boolean
  growth: string | boolean
  scale: string | boolean
}

const features: PlanFeature[] = [
  { label: "Connected Bases", free: "1", growth: "3", scale: "Unlimited" },
  { label: "Synced Records", free: "5,000", growth: "50,000", scale: "500,000" },
  { label: "Overflow Automations", free: "3", growth: "25", scale: "Unlimited" },
  { label: "Sync Frequency", free: "15 min", growth: "Real-time", scale: "Real-time" },
  { label: "CSV / Excel Export", free: false, growth: true, scale: true },
  { label: "API Access", free: false, growth: true, scale: true },
  { label: "Team Seats", free: "1", growth: "1", scale: "3" },
  { label: "Support", free: "Community", growth: "Email 48h", scale: "Email 24h" },
]

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Test the sync with a small base.",
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$29",
    period: "/month",
    description: "For teams hitting their first limits.",
    highlight: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "$79",
    period: "/month",
    description: "For agencies and high-volume bases.",
    highlight: false,
  },
]

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-foreground" />
  if (value === false) return <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />
  return <span className="text-xs text-foreground">{value}</span>
}

function PlanCard({ plan, index }: { plan: (typeof plans)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96, y: 24 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex"
    >
      <Card
        className={`relative flex w-full flex-col overflow-hidden border bg-background ${
          plan.highlight ? "ring-2 ring-foreground shadow-md" : "border-border"
        }`}
      >
        {plan.highlight && (
          <div className="absolute top-0 right-0 left-0 h-[3px] bg-foreground" />
        )}

        <div className="p-6 pb-4">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-heading text-sm font-semibold text-foreground">
              {plan.name}
            </span>
            {plan.highlight && (
              <Badge className="text-[10px]" variant="secondary">
                Most Popular
              </Badge>
            )}
          </div>

          <div className="mt-3 flex items-end gap-1">
            <span className="font-heading text-4xl font-bold text-foreground">
              {plan.price}
            </span>
            <span className="mb-1 text-sm text-muted-foreground">{plan.period}</span>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">{plan.description}</p>
        </div>

        <Separator />

        <div className="flex-1 space-y-0 p-6 pt-4">
          {features.map((feature) => {
            const val = feature[plan.id as keyof PlanFeature]
            return (
              <div
                key={feature.label}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-muted-foreground">{feature.label}</span>
                <FeatureValue value={val} />
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="p-6 pt-0">
          <PlanCTA planId={plan.id} highlight={plan.highlight} />
        </div>
      </Card>
    </motion.div>
  )
}

function PlanCTA({ planId, highlight }: { planId: string; highlight: boolean }) {
  const [loading, setLoading] = useState(false)

  if (planId === "free") {
    return (
      <Button variant="outline" className="w-full" asChild>
        <a href="/login">Get Started Free</a>
      </Button>
    )
  }

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        // Not logged in — redirect to login first
        window.location.href = `/login?plan=${planId}`
      }
    } catch {
      window.location.href = "/login"
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      className="w-full"
      variant={highlight ? "default" : "outline"}
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
      {planId === "growth" ? "Get Growth" : "Get Scale"}
    </Button>
  )
}

export function PricingSection() {
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" })

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">

        {/* ── Section header ── */}
        <div ref={titleRef} className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
          >
            <span className="font-mono mb-3 block text-xs uppercase tracking-widest text-muted-foreground">
              Pricing
            </span>
            <h2
              id="pricing-heading"
              className="font-heading text-3xl font-bold tracking-tight text-foreground lg:text-4xl xl:text-5xl"
            >
              Simple Pricing.
              <br />
              Zero Migration.
            </h2>
          </motion.div>

          <motion.div
            className="self-end lg:col-span-6 lg:col-start-7"
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className="rounded-lg border border-border bg-muted/40 px-5 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Airtable Enterprise starts at{" "}
                <span className="font-semibold text-foreground">$45 per seat per month</span>{" "}
                — with a minimum seat requirement. VayuBridge Growth is{" "}
                <span className="font-semibold text-foreground">$29 for your whole team.</span>{" "}
                Do the math.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── Plan cards ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>

        {/* ── Add-on line ── */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Need more records?{" "}
          <span className="font-medium text-foreground">+100K synced records for $10/mo.</span>{" "}
          No surprises.
        </p>

      </div>
    </section>
  )
}
