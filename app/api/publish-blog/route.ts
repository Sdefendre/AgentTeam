import { NextRequest, NextResponse } from 'next/server'
import { BLOG_API_KEY, BLOG_API_URL, AUTHOR_NAME } from '@/lib/config'
import { parseBlogFrontmatter } from '@/lib/utils'

/**
 * Publish blog post to DefendreSolutions.com
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { blogContent } = body

    if (!blogContent) {
      return NextResponse.json(
        { error: 'Blog content is required' },
        { status: 400 }
      )
    }

    if (!BLOG_API_KEY) {
      return NextResponse.json(
        { error: 'Blog API key not configured. Please set BLOG_API_KEY in environment variables.' },
        { status: 500 }
      )
    }

    // Parse frontmatter from blog content
    const { meta, body: content } = parseBlogFrontmatter(blogContent)

    // Validate required fields
    if (!meta.title) {
      return NextResponse.json(
        { error: 'Blog post must have a title in frontmatter' },
        { status: 400 }
      )
    }

    // Extract tags from frontmatter keywords or tags field
    const tags = meta.keywords
      ? meta.keywords.split(',').map((k: string) => k.trim())
      : meta.tags || []

    // Prepare payload for DefendreSolutions blog API
    const payload = {
      title: meta.title,
      excerpt: meta.description || meta.excerpt || '',
      author: meta.author || AUTHOR_NAME,
      date: meta.date || new Date().toISOString().split('T')[0],
      readTime: meta.readTime || '5 min read',
      tags: Array.isArray(tags) ? tags : [],
      content: content.trim(),
    }

    // Publish to DefendreSolutions blog
    const response = await fetch(BLOG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': BLOG_API_KEY,
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
      message: 'Blog post published successfully to DefendreSolutions.com',
    })
  } catch (error: any) {
    console.error('Blog publishing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish blog post' },
      { status: 500 }
    )
  }
}
