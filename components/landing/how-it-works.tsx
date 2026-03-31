"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Link2, Database, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Connect your Airtable base",
    description:
      "Click \"Connect Airtable\", authorise VayuBridge, pick your base. That's it. 90 seconds.",
  },
  {
    number: "02",
    icon: Database,
    title: "We sync everything quietly",
    description:
      "VayuBridge copies your data to a real PostgreSQL database and keeps it perfectly up to date. You don't see any of this.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Use Airtable exactly as before — now without limits",
    description:
      "Your team opens Airtable and nothing looks different. Except the walls are gone.",
  },
]

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const Icon = step.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Connector line (hidden on last) */}
      {index < steps.length - 1 && (
        <div className="absolute top-8 left-full z-10 hidden w-full items-center lg:flex">
          <div className="w-full border-t border-dashed border-border" />
        </div>
      )}

      <Card className="relative h-full overflow-hidden border border-border bg-background p-6 transition-shadow hover:shadow-md">
        {/* Decorative step number */}
        <span className="font-heading pointer-events-none absolute -right-2 -top-4 select-none text-8xl font-bold text-foreground/[0.04]">
          {step.number}
        </span>

        {/* Icon */}
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/50">
          <Icon className="h-5 w-5 text-foreground" />
        </div>

        {/* Step label */}
        <span className="font-mono mb-2 block text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Step {step.number}
        </span>

        <h3 className="font-heading mb-3 text-base font-semibold leading-snug text-foreground">
          {step.title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
      </Card>
    </motion.div>
  )
}

export function HowItWorks() {
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" })

  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="bg-muted/40 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header — left-aligned, asymmetric */}
        <div ref={titleRef} className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
          >
            <span className="font-mono mb-3 block text-xs uppercase tracking-widest text-muted-foreground">
              How it works
            </span>
            <h2 id="how-it-works-heading" className="font-heading text-3xl font-bold tracking-tight text-foreground lg:text-4xl xl:text-5xl">
              Up and Running
              <br />
              in 3 Minutes
            </h2>
          </motion.div>
          <motion.div
            className="self-end lg:col-span-5 lg:col-start-8"
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              Non-technical operators and SMB owners set this up in minutes. No developer
              required. No migration. No disruption to your team.
            </p>
          </motion.div>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
