import { NextRequest, NextResponse } from 'next/server'

/**
 * Parse blog post frontmatter
 */
function parseBlogFrontmatter(content: string): {
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

/**
 * POST /api/publish-blog
 * Publish blog post to your blog
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { blogContent, blogApiKey, blogApiUrl } = body

    if (!blogContent) {
      return NextResponse.json(
        { error: 'Blog content is required' },
        { status: 400 }
      )
    }

    // Use provided keys or fall back to environment variables
    const apiKey = blogApiKey || process.env.BLOG_API_KEY
    const apiUrl = blogApiUrl || process.env.BLOG_API_URL

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Blog API key is required. Add it in Settings.' },
        { status: 400 }
      )
    }

    if (!apiUrl) {
      return NextResponse.json(
        { error: 'Blog API URL is required. Add it in Settings.' },
        { status: 400 }
      )
    }

    // Parse frontmatter from blog content
    const { meta, body: content } = parseBlogFrontmatter(blogContent)

    if (!meta.title) {
      return NextResponse.json(
        { error: 'Blog post must have a title in frontmatter' },
        { status: 400 }
      )
    }

    // Extract tags from frontmatter
    const tags = meta.keywords
      ? meta.keywords.split(',').map((k: string) => k.trim())
      : []

    // Prepare payload
    const payload = {
      title: meta.title,
      excerpt: meta.description || '',
      author: meta.author || 'Author',
      date: meta.date || new Date().toISOString().split('T')[0],
      readTime: meta.readTime || '5 min read',
      tags,
      content: content.trim(),
    }

    // Publish to blog
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Blog publishing failed: ${error}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      result,
      message: 'Blog post published successfully',
    })
  } catch (error: any) {
    console.error('Blog publishing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish blog post' },
      { status: 500 }
    )
  }
}
