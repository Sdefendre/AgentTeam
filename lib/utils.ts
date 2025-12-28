/**
 * Utility functions
 */

/**
 * Convert text to URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Get current month folder path (YYYY-MM format)
 */
export function getCurrentMonthFolder(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Parse blog post frontmatter
 */
export function parseBlogFrontmatter(content: string): {
  meta: Record<string, string>
  body: string
} {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  
  if (!frontmatterMatch) {
    return { meta: {}, body: content }
  }

  const meta: Record<string, string> = {}
  frontmatterMatch[1].split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts.length) {
      meta[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '')
    }
  })

  return { meta, body: frontmatterMatch[2] }
}

