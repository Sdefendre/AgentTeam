import { NextRequest, NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'
import * as storage from '@/lib/storage'

/**
 * GET - List all content
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || undefined

    const data = storage.getAllContent(limit, status)

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create new content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, blogPost, xPost, linkedinPost, imageUrl, platforms } = body

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const topicSlug = slugify(topic)

    const content = storage.createContent({
      topic,
      topic_slug: topicSlug,
      blog_post: blogPost || null,
      x_post: xPost || null,
      linkedin_post: linkedinPost || null,
      image_url: imageUrl || null,
      platforms: platforms || ['x', 'linkedin'],
      status: 'draft',
      published_at: null,
      metadata: {},
    })

    return NextResponse.json({ success: true, data: content })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create content' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update content
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }

    const content = storage.updateContent(id, updates)

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: content })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update content' },
      { status: 500 }
    )
  }
}
