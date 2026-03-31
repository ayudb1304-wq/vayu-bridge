import { notFound } from "next/navigation"
import { marked } from "marked"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { getAllPosts, getPost, isPostLive } from "@/lib/posts"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  // Only pre-build live posts; unpublished slugs are handled on-demand and 404
  const { getLivePosts } = await import("@/lib/posts")
  return getLivePosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post || !isPostLive(post)) return { robots: { index: false, follow: false } }

  return {
    title: post.title,
    description: post.description,
    robots: post.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: { canonical: `https://vayubridge.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://vayubridge.com/blog/${slug}`,
      publishedTime: post.publishDate,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)

  // 404 for missing, unpublished, or future-dated posts
  if (!post || !isPostLive(post)) notFound()

  const html = await marked(post.content)

  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      {/* Back link */}
      <Link
        href="/#blog"
        className="mb-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All posts
      </Link>

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

      {/* Render markdown */}
      <div
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  )
}
