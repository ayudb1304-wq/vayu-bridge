// scripts/publish-scheduled-posts.js
// Run with: node scripts/publish-scheduled-posts.js
//
// Reads all posts in content/blog/, checks if any have:
//   publishDate <= today AND published = false
// If so, sets published = true and noindex = false in the frontmatter and writes the file back.
// Commit the resulting changes to trigger a Vercel deployment.

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const POSTS_DIR = path.join(__dirname, "..", "content", "blog")
const today = new Date()
today.setHours(0, 0, 0, 0)

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) return { data: {}, body: raw, frontmatterBlock: "" }

  const frontmatterBlock = match[0]
  const body = raw.slice(frontmatterBlock.length)
  const data = {}

  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    // Parse booleans
    if (value === "true") value = true
    else if (value === "false") value = false
    data[key] = value
  }

  return { data, body, frontmatterBlock }
}

function serializeFrontmatter(data) {
  const lines = Object.entries(data).map(([key, value]) => {
    if (typeof value === "boolean") return `${key}: ${value}`
    if (typeof value === "string" && value.includes(":")) return `${key}: "${value}"`
    return `${key}: ${value}`
  })
  return `---\n${lines.join("\n")}\n---\n`
}

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))
let publishedCount = 0

for (const filename of files) {
  const filepath = path.join(POSTS_DIR, filename)
  const raw = fs.readFileSync(filepath, "utf-8")
  const { data, body } = parseFrontmatter(raw)

  if (!data.publishDate) continue

  const publishDate = new Date(data.publishDate)
  publishDate.setHours(0, 0, 0, 0)

  const isDue = publishDate <= today
  const isUnpublished = data.published === false

  if (isDue && isUnpublished) {
    data.published = true
    data.noindex = false
    const updated = serializeFrontmatter(data) + "\n" + body
    fs.writeFileSync(filepath, updated, "utf-8")
    console.log(`Published: "${data.title}" on ${data.publishDate}`)
    publishedCount++
  }
}

if (publishedCount === 0) {
  console.log("No posts due for publishing today.")
} else {
  console.log(`\nDone. ${publishedCount} post(s) published.`)
  console.log("Commit the updated files and push to trigger a Vercel deployment.")
}
