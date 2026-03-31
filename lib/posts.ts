import { readFileSync, readdirSync } from "fs"
import { join } from "path"
import matter from "gray-matter"

export type Post = {
  slug: string
  title: string
  description: string
  targetKeyword: string
  tag: string
  publishDate: string // YYYY-MM-DD
  published: boolean
  noindex: boolean
  readTime: number // minutes
  content: string // raw markdown without frontmatter
}

const POSTS_DIR = join(process.cwd(), "content", "blog")

function parsePost(slug: string, raw: string): Post {
  const { data, content } = matter(raw)
  // Strip markdown syntax tokens before counting words
  const wordCount = content
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/`[^`]*`/g, "") // remove inline code
    .replace(/[#*_\[\]()>!]/g, "") // remove common md chars
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  return {
    slug: data.slug ?? slug,
    title: data.title ?? "",
    description: data.metaDescription ?? "",
    targetKeyword: data.targetKeyword ?? "",
    tag: data.tag ?? "",
    publishDate: data.publishDate ?? "2099-01-01",
    published: data.published ?? false,
    noindex: data.noindex ?? true,
    readTime,
    content,
  }
}

export function getAllPosts(): Post[] {
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))
  return files
    .map((filename) => {
      const slug = filename.replace(".md", "")
      const raw = readFileSync(join(POSTS_DIR, filename), "utf-8")
      return parsePost(slug, raw)
    })
    .sort((a, b) => a.publishDate.localeCompare(b.publishDate))
}

export function getPost(slug: string): Post | undefined {
  try {
    const raw = readFileSync(join(POSTS_DIR, `${slug}.md`), "utf-8")
    return parsePost(slug, raw)
  } catch {
    return undefined
  }
}

export function isPostLive(post: Post): boolean {
  return post.published === true && new Date(post.publishDate) <= new Date()
}

export function getLivePosts(): Post[] {
  return getAllPosts().filter(isPostLive)
}
