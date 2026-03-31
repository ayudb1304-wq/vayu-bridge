"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { ArrowRight, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Post } from "@/lib/posts"

function PostCard({ post, index }: { post: Post; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <Card className="relative h-full overflow-hidden border border-border bg-background p-6 transition-shadow hover:shadow-md">
          {/* Tag + read time */}
          <div className="mb-3 flex items-center gap-3">
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
              {post.tag}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70">
              <Clock className="h-3 w-3" />
              {post.readTime} min read
            </span>
          </div>

          <h3 className="font-heading mb-3 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-foreground/80">
            {post.title}
          </h3>

          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            {post.description}
          </p>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground transition-all group-hover:gap-2">
            Read post
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </Card>
      </Link>
    </motion.div>
  )
}

export function BlogSection({ posts }: { posts: Post[] }) {
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInView = useInView(titleRef, { once: true, margin: "-80px" })

  if (posts.length === 0) return null

  return (
    <section id="blog" aria-labelledby="blog-heading" className="bg-muted/40 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div ref={titleRef} className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
          >
            <span className="font-mono mb-3 block text-xs uppercase tracking-widest text-muted-foreground">
              From the Blog
            </span>
            <h2
              id="blog-heading"
              className="font-heading text-3xl font-bold tracking-tight text-foreground lg:text-4xl xl:text-5xl"
            >
              Every Airtable
              <br />
              Limit, Explained
            </h2>
          </motion.div>

          <motion.div
            className="self-end lg:col-span-5 lg:col-start-8"
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              In-depth guides on Airtable's record caps, automation limits, API rate limits, and
              when it makes sense to remove them vs. migrate away entirely.
            </p>
          </motion.div>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {posts.map((post, i) => (
            <PostCard key={post.slug} post={post} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
