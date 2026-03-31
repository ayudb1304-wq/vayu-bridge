"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Infinity, Zap, Database, Clock, ShieldCheck, Plug } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Infinity,
    title: "Unlimited Records",
    description:
      "Break past Airtable's 50,000-record cap. Store millions of rows in a real PostgreSQL database while your team works from Airtable as usual.",
    tag: "No record ceiling",
  },
  {
    icon: Zap,
    title: "Unlimited Automations",
    description:
      "The 50-automation cap disappears. Build every workflow your operations need — triggers, multi-step logic, conditional branches — without hitting a wall.",
    tag: "No automation cap",
  },
  {
    icon: Database,
    title: "Real PostgreSQL Sync",
    description:
      "Your Airtable data lives in a production-grade Postgres database. Query it with SQL, connect BI tools like Metabase or Retool, or build custom reports.",
    tag: "Full SQL access",
  },
  {
    icon: Clock,
    title: "Always in Sync",
    description:
      "Changes in Airtable reflect in your database in seconds. Bidirectional updates mean your source of truth is never stale — no manual exports needed.",
    tag: "Real-time sync",
  },
  {
    icon: ShieldCheck,
    title: "Zero Migration Required",
    description:
      "Keep Airtable exactly as it is. Your team's views, filters, and workflows stay untouched. VayuBridge runs silently underneath — invisible by design.",
    tag: "No disruption",
  },
  {
    icon: Plug,
    title: "High-Throughput API",
    description:
      "Connect external apps via our API without hitting rate limits. Replace brittle Zapier workarounds with a reliable, high-volume integration layer.",
    tag: "No API throttling",
  },
]

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const Icon = feature.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group relative h-full overflow-hidden border border-border bg-background p-6 transition-shadow hover:shadow-md">
        {/* Icon */}
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/50 transition-colors group-hover:bg-muted">
          <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
        </div>

        <h3 className="font-heading mb-2 text-base font-semibold leading-snug text-foreground">
          {feature.title}
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {feature.description}
        </p>

        {/* Tag */}
        <span className="font-mono inline-block text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
          {feature.tag}
        </span>
      </Card>
    </motion.div>
  )
}

export function FeaturesSection() {
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" })

  return (
    <section id="features" aria-labelledby="features-heading" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div ref={titleRef} className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
          >
            <span className="font-mono mb-3 block text-xs uppercase tracking-widest text-muted-foreground">
              Features
            </span>
            <h2
              id="features-heading"
              className="font-heading text-3xl font-bold tracking-tight text-foreground lg:text-4xl xl:text-5xl"
            >
              Everything Airtable
              <br />
              Should Have Been
            </h2>
          </motion.div>

          <motion.div
            className="self-end lg:col-span-5 lg:col-start-8"
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              VayuBridge removes every hard limit Airtable imposes — without touching your team's
              workflow. Connect once and forget the walls ever existed.
            </p>
          </motion.div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
