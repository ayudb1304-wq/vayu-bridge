"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Check, Minus, Clock, Zap, Star, TrendingUp, AlertTriangle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { WaitlistForm } from "@/components/waitlist-form"

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
    founderPrice: "$23",
  },
  {
    id: "scale",
    name: "Scale",
    price: "$79",
    period: "/month",
    description: "For agencies and high-volume bases.",
    highlight: false,
    founderPrice: "$63",
  },
]

const founderPerks = [
  {
    icon: Clock,
    title: "2 months free",
    detail: "Your first two billing months are on us — no charge, no conditions.",
  },
  {
    icon: TrendingUp,
    title: "20% off, forever",
    detail: "Every invoice you ever receive is 20% below the public price. Permanently.",
  },
  {
    icon: Zap,
    title: "First access",
    detail: "You get in before anyone else. No waiting list when we launch — you're already through.",
  },
  {
    icon: Star,
    title: "Founding Member badge",
    detail: "Permanent recognition on your account. Priority support for life.",
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

          {"founderPrice" in plan && (
            <p className="mt-1 text-xs text-emerald-600 font-medium">
              Founding members pay {plan.founderPrice}/mo — forever
            </p>
          )}

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
        window.location.href = `/login?redirect=/dashboard&plan=${planId}`
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
      {planId === "growth" ? "Start Growth Trial" : "Start Scale Trial"}
    </Button>
  )
}

export function PricingSection() {
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" })
  const founderRef = useRef<HTMLDivElement>(null)
  const founderInView = useInView(founderRef, { once: true, margin: "-80px" })

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

        {/* ── Founding Member Waitlist Section ── */}
        <motion.div
          ref={founderRef}
          initial={{ opacity: 0, y: 32 }}
          animate={founderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 overflow-hidden rounded-2xl border border-foreground/10 bg-foreground text-background"
        >
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-12">

            {/* Left — copy */}
            <div className="flex flex-col justify-center p-8 lg:col-span-7 lg:p-12">

              {/* Scarcity pill */}
              <div className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-background/10 px-3 py-1 text-xs font-medium text-background/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Founding member spots are limited
              </div>

              <h3 className="font-heading mb-4 text-2xl font-bold leading-snug text-background lg:text-3xl">
                Your Airtable base is hitting a wall{" "}
                <span className="text-background/60">right now.</span>
                <br />
                Don&rsquo;t pay full price to fix it.
              </h3>

              <p className="mb-6 text-sm leading-relaxed text-background/70">
                VayuBridge removes every limit — records, automations, API rate caps — in 90 seconds.
                We&rsquo;re launching soon. Founding members get in early and pay less, permanently.
                Once we launch, this offer is gone. There&rsquo;s no way to get it after.
              </p>

              {/* Pain echo */}
              <div className="mb-8 rounded-lg border border-background/10 bg-background/5 px-4 py-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <p className="text-xs leading-relaxed text-background/70">
                    Every week you wait is another week where your automations stop firing, your forms
                    reject new leads, and your team works around limits that shouldn&rsquo;t exist.
                    The fix is ready. The founding price won&rsquo;t be.
                  </p>
                </div>
              </div>

              {/* Perks grid */}
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {founderPerks.map((perk) => {
                  const Icon = perk.icon
                  return (
                    <div key={perk.title} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background/10">
                        <Icon className="h-3.5 w-3.5 text-background" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-background">{perk.title}</p>
                        <p className="text-xs leading-relaxed text-background/60">{perk.detail}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Form */}
              <WaitlistForm
                source="pricing-founder"
                placeholder="Enter your work email"
                buttonLabel="Claim Founding Member Spot"
                variant="inverted"
                className="max-w-md"
              />
              <p className="mt-2 text-xs text-background/50">
                No credit card. No commitment. Just your spot in line.
              </p>
            </div>

            {/* Right — pricing comparison */}
            <div className="flex flex-col justify-center border-t border-background/10 p-8 lg:col-span-5 lg:border-t-0 lg:border-l lg:p-12">
              <p className="font-mono mb-6 text-[10px] font-medium uppercase tracking-widest text-background/50">
                What founding members pay
              </p>

              <div className="space-y-5">
                {[
                  { plan: "Free", public: "$0/mo", founder: "$0/mo", savings: null },
                  {
                    plan: "Growth",
                    public: "$29/mo",
                    founder: "$23/mo",
                    savings: "Save $72/year + 2 months free",
                  },
                  {
                    plan: "Scale",
                    public: "$79/mo",
                    founder: "$63/mo",
                    savings: "Save $192/year + 2 months free",
                  },
                ].map((row) => (
                  <div key={row.plan} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-background">{row.plan}</p>
                      {row.savings && (
                        <p className="text-[11px] text-emerald-400">{row.savings}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {row.savings ? (
                        <>
                          <p className="text-xs text-background/40 line-through">{row.public}</p>
                          <p className="font-heading text-lg font-bold text-background">
                            {row.founder}
                          </p>
                        </>
                      ) : (
                        <p className="font-heading text-lg font-bold text-background">
                          {row.public}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6 bg-background/10" />

              <p className="text-xs leading-relaxed text-background/50">
                Founding member pricing is locked at signup and never changes — even if public
                prices increase. This is a one-time window that closes at launch.
              </p>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  )
}
