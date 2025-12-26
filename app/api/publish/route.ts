import { NextRequest, NextResponse } from 'next/server'
import {
  TYPEFULLY_API_KEY,
  TYPEFULLY_BASE_URL,
  TYPEFULLY_SOCIAL_SET_ID,
} from '@/lib/config'

const HEADERS = {
  Authorization: `Bearer ${TYPEFULLY_API_KEY}`,
  'Content-Type': 'application/json',
}

/**
 * Upload image to Typefully
 */
async function uploadImage(imageFile: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', imageFile)

  // Step 1: Request upload URL
  const uploadResponse = await fetch(
    `${TYPEFULLY_BASE_URL}/v2/social-sets/${TYPEFULLY_SOCIAL_SET_ID}/media/upload`,
    {
      method: 'POST',
      headers: {
        Authorization: HEADERS.Authorization,
      },
      body: JSON.stringify({ file_name: imageFile.name }),
    }
  )

  if (!uploadResponse.ok) {
    throw new Error(`Failed to get upload URL: ${uploadResponse.statusText}`)
  }

  const uploadData = await uploadResponse.json()
  const { media_id, upload_url } = uploadData

  // Step 2: Upload file to S3
  const fileData = await imageFile.arrayBuffer()
  const s3Response = await fetch(upload_url, {
    method: 'PUT',
    body: fileData,
  })

  if (!s3Response.ok) {
    throw new Error(`Failed to upload to S3: ${s3Response.statusText}`)
  }

  // Step 3: Wait for processing
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const statusResponse = await fetch(
      `${TYPEFULLY_BASE_URL}/v2/social-sets/${TYPEFULLY_SOCIAL_SET_ID}/media/${media_id}`,
      {
        headers: HEADERS,
      }
    )

    const status = await statusResponse.json()

    if (status.status === 'ready') {
      return media_id
    } else if (status.status === 'failed') {
      throw new Error(`Image processing failed: ${status.error || 'Unknown error'}`)
    }
  }

  throw new Error('Image processing timed out')
}

/**
 * Publish content to social platforms
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { xContent, linkedinContent, imageUrl, schedule = 'next-free-slot' } = body

    if (!xContent && !linkedinContent) {
      return NextResponse.json(
        { error: 'At least one platform content is required' },
        { status: 400 }
      )
    }

    const mediaIds: string[] = []

    // Upload image if provided
    if (imageUrl) {
      try {
        // Fetch image from URL
        const imageResponse = await fetch(imageUrl)
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob()
          const imageFile = new File([imageBlob], 'image.jpg', { type: 'image/jpeg' })
          const mediaId = await uploadImage(imageFile)
          mediaIds.push(mediaId)
        }
      } catch (error) {
        console.error('Image upload failed:', error)
        // Continue without image
      }
    }

    const results: Record<string, any> = {}

    // Publish to X
    if (xContent) {
      const posts: Array<{ text: string; media_ids?: string[] }> = xContent.includes('\n\n\n\n')
        ? xContent.split('\n\n\n\n').map((text: string) => ({
            text: text.trim(),
          }))
        : [{ text: xContent.trim() }]

      if (mediaIds.length > 0 && posts.length > 0) {
        posts[0].media_ids = mediaIds
      }

      const xPayload = {
        platforms: {
          x: {
            enabled: true,
            posts,
            settings: {},
          },
        },
        publish_at: schedule,
      }

      const xResponse = await fetch(
        `${TYPEFULLY_BASE_URL}/v2/social-sets/${TYPEFULLY_SOCIAL_SET_ID}/drafts`,
        {
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify(xPayload),
        }
      )

      if (!xResponse.ok) {
        const error = await xResponse.json()
        throw new Error(`X publishing failed: ${error.message || xResponse.statusText}`)
      }

      results.x = await xResponse.json()
    }

    // Publish to LinkedIn
    if (linkedinContent) {
      const linkedinPosts: Array<{ text: string; media_ids?: string[] }> = [{ text: linkedinContent.trim() }]
      if (mediaIds.length > 0) {
        linkedinPosts[0].media_ids = mediaIds
      }

      const linkedinPayload = {
        platforms: {
          linkedin: {
            enabled: true,
            posts: linkedinPosts,
            settings: {},
          },
        },
        publish_at: schedule,
      }

      const linkedinResponse = await fetch(
        `${TYPEFULLY_BASE_URL}/v2/social-sets/${TYPEFULLY_SOCIAL_SET_ID}/drafts`,
        {
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify(linkedinPayload),
        }
      )

      if (!linkedinResponse.ok) {
        const error = await linkedinResponse.json()
        throw new Error(`LinkedIn publishing failed: ${error.message || linkedinResponse.statusText}`)
      }

      results.linkedin = await linkedinResponse.json()
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Content published successfully',
    })
  } catch (error: any) {
    console.error('Publishing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish content' },
      { status: 500 }
    )
  }
}

