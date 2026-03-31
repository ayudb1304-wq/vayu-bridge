"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { X } from "lucide-react"
import { Card } from "@/components/ui/card"

const errors = [
  {
    message:
      "Sorry, you've reached the maximum number of automations for this base.",
    context: "50-automation cap",
  },
  {
    message: "This view is only showing the first 1,000 records.",
    context: "Record display limit",
  },
  {
    message: "You've exceeded the usage limits for this base.",
    context: "500 fields / 50K records",
  },
  {
    message: "Rate limit exceeded. Please wait before retrying.",
    context: "5 req/sec API cap",
  },
]

function ErrorCard({ message, context, index }: { message: string; context: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group relative overflow-hidden border border-border bg-background p-4 transition-shadow hover:shadow-md">
        {/* Red left accent */}
        <div className="absolute top-0 left-0 h-full w-[3px] bg-red-400/70" />

        <div className="flex items-start gap-3 pl-2">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40">
            <X className="h-3 w-3 text-red-500 dark:text-red-400" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs leading-relaxed text-foreground/80">
              &ldquo;{message}&rdquo;
            </p>
            <span className="mt-1.5 inline-block text-[10px] text-muted-foreground">
              {context}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export function PainSection() {
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" })
  const closingRef = useRef<HTMLParagraphElement>(null)
  const closingInView = useInView(closingRef, { once: true, margin: "-80px" })

  return (
    <section id="pain" aria-labelledby="pain-heading" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left — section title (hard left, asymmetric) */}
          <div ref={titleRef} className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={titleInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Slightly rotated label */}
              <div className="mb-4 inline-block -rotate-[1.5deg]">
                <h2 id="pain-heading" className="font-heading text-4xl font-bold leading-none tracking-tight text-foreground lg:text-5xl xl:text-6xl">
                  Sound
                  <br />
                  Familiar?
                </h2>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                These aren&rsquo;t edge cases. They&rsquo;re the walls that every serious Airtable
                user hits — usually right when their business depends on it.
              </p>
            </motion.div>
          </div>

          {/* Right — error cards grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {errors.map((error, i) => (
                <ErrorCard
                  key={i}
                  message={error.message}
                  context={error.context}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Closing line — full width */}
        <motion.p
          ref={closingRef}
          className="mt-16 max-w-2xl text-base italic text-muted-foreground lg:ml-[33.33%]"
          initial={{ opacity: 0, y: 16 }}
          animate={closingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          We&rsquo;ve seen these too. Every single one. That&rsquo;s exactly why we built
          VayuBridge.
        </motion.p>
      </div>
    </section>
  )
}
