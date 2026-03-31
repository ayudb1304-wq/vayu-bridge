"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Database, Zap, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const headlineWords = ["You", "Built", "Something", "Great", "in", "Airtable."]
const headlineWords2 = ["Don't", "Let", "a", "Limit", "Tear", "It", "Down."]

function AnimatedWord({ word, delay }: { word: string; delay: number }) {
  return (
    <motion.span
      className="inline-block"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {word}
    </motion.span>
  )
}

function MockDashboard() {
  return (
    <Card className="relative overflow-hidden border border-border bg-background shadow-2xl shadow-black/8">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-border" />
        <div className="h-2.5 w-2.5 rounded-full bg-border" />
        <div className="h-2.5 w-2.5 rounded-full bg-border" />
        <div className="ml-3 h-5 flex-1 rounded-sm bg-border/60 text-[10px] font-mono flex items-center px-2 text-muted-foreground">
          app.vayubridge.com/dashboard
        </div>
      </div>

      {/* Dashboard content */}
      <div className="p-5">
        {/* Stats bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            </div>
            <span className="font-heading text-sm font-semibold text-foreground">
              87,432 records
            </span>
            <span className="text-xs text-muted-foreground">synced</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Live
          </Badge>
        </div>

        {/* Fake table rows */}
        <div className="space-y-2">
          {["Inventory", "CRM", "Projects", "Analytics", "Orders"].map((label, i) => (
            <motion.div
              key={label}
              className="flex items-center gap-3 rounded-md bg-muted/40 px-3 py-2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.06, duration: 0.3 }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
              <div className="h-2 flex-1 rounded-full bg-foreground/10" />
              <div
                className="h-2 rounded-full bg-foreground/10"
                style={{ width: `${40 + i * 8}px` }}
              />
            </motion.div>
          ))}
        </div>

        {/* Floating error toast — crossed out */}
        <motion.div
          className="absolute right-4 bottom-4 left-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.4 }}
        >
          <div className="relative overflow-hidden rounded-md border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900/60 dark:bg-red-950/40">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-red-400 line-through dark:text-red-400/80">
                &ldquo;This view is only showing the first 1,000 records.&rdquo;
              </span>
            </div>
            {/* Strike line */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-emerald-500/20"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1.8, duration: 0.5, ease: "easeOut" }}
            />
            <motion.div
              className="absolute right-2 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.3, duration: 0.3, type: "spring" }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Card>
  )
}

export function Hero() {
  return (
    <section id="hero" aria-label="Hero" className="relative min-h-svh overflow-hidden pt-16">
      {/* Background dot grid — uses foreground color so it works in both modes */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Subtle gradient sweep */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/60 dark:from-transparent dark:via-transparent dark:to-transparent" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-12 lg:py-32">
        {/* Left column — headline + CTA (7 cols) */}
        <div className="lg:col-span-7">
          {/* Label chip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge
              variant="outline"
              className="mb-6 gap-1.5 px-3 py-1 text-xs text-muted-foreground"
            >
              <Database className="h-3 w-3" />
              Airtable → PostgreSQL sync, in 90 seconds
            </Badge>
          </motion.div>

          {/* Headline */}
          <h1 className="font-heading mb-6 text-5xl font-bold leading-[1.08] tracking-tight text-foreground lg:text-6xl xl:text-7xl">
            <span className="flex flex-wrap gap-x-[0.25em] gap-y-1">
              {headlineWords.map((word, i) => (
                <AnimatedWord key={i} word={word} delay={0.1 + i * 0.06} />
              ))}
            </span>
            <span className="mt-1 flex flex-wrap gap-x-[0.25em] gap-y-1">
              {headlineWords2.map((word, i) => (
                <AnimatedWord
                  key={i}
                  word={word}
                  delay={0.1 + (headlineWords.length + i) * 0.06}
                />
              ))}
            </span>
          </h1>

          {/* Subheadline */}
          <motion.p
            className="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
          >
            VayuBridge removes Airtable&rsquo;s record caps, automation limits, and API
            restrictions — without touching your existing bases or workflows.
          </motion.p>

          {/* CTA */}
          <motion.div
            className="flex max-w-md flex-col gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Button size="lg" asChild>
              <a href="/login">Get Started Free</a>
            </Button>
            <span className="text-xs text-muted-foreground">
              No credit card required · 90 seconds to connect · Your base is unchanged
            </span>
          </motion.div>

          {/* Social proof / trust signals */}
          <motion.div
            className="mt-12 flex items-center gap-6 border-t border-border pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            {[
              { icon: Database, label: "PostgreSQL-backed" },
              { icon: Zap, label: "30-second sync" },
              { icon: CheckCircle2, label: "No migration needed" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right column — UI Mockup (5 cols) */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative">
            {/* Offset shadow card behind */}
            <div className="absolute -right-3 -bottom-3 left-3 top-3 rounded-xl border border-border bg-muted/40" />
            <MockDashboard />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
