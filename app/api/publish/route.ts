import { NextRequest, NextResponse } from 'next/server'

/**
 * Upload image to Typefully
 */
async function uploadImage(
  imageFile: File,
  apiKey: string,
  socialSetId: string
): Promise<string> {
  const baseUrl = 'https://api.typefully.com'
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }

  // Request upload URL
  const uploadResponse = await fetch(
    `${baseUrl}/v2/social-sets/${socialSetId}/media/upload`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ file_name: imageFile.name }),
    }
  )

  if (!uploadResponse.ok) {
    throw new Error(`Failed to get upload URL: ${uploadResponse.statusText}`)
  }

  const { media_id, upload_url } = await uploadResponse.json()

  // Upload to S3
  const fileData = await imageFile.arrayBuffer()
  const s3Response = await fetch(upload_url, {
    method: 'PUT',
    body: fileData,
  })

  if (!s3Response.ok) {
    throw new Error(`Failed to upload to S3: ${s3Response.statusText}`)
  }

  // Wait for processing
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000))
    const statusResponse = await fetch(
      `${baseUrl}/v2/social-sets/${socialSetId}/media/${media_id}`,
      { headers }
    )
    const status = await statusResponse.json()
    if (status.status === 'ready') return media_id
    if (status.status === 'failed') throw new Error('Image processing failed')
  }

  throw new Error('Image processing timed out')
}

/**
 * POST /api/publish
 * Publish content to X and/or LinkedIn via Typefully
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      xContent,
      linkedinContent,
      imageUrl,
      schedule = 'next-free-slot',
      typefullyApiKey,
      typefullySocialSetId,
    } = body

    if (!xContent && !linkedinContent) {
      return NextResponse.json(
        { error: 'At least one platform content is required' },
        { status: 400 }
      )
    }

    // Use provided keys or fall back to environment variables
    const apiKey = typefullyApiKey || process.env.TYPEFULLY_API_KEY
    const socialSetId = typefullySocialSetId || process.env.TYPEFULLY_SOCIAL_SET_ID || '273516'

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Typefully API key is required. Add it in Settings.' },
        { status: 400 }
      )
    }

    const baseUrl = 'https://api.typefully.com'
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }

    const mediaIds: string[] = []

    // Upload image if provided
    if (imageUrl) {
      try {
        const imageResponse = await fetch(imageUrl)
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob()
          const imageFile = new File([imageBlob], 'image.jpg', { type: 'image/jpeg' })
          const mediaId = await uploadImage(imageFile, apiKey, socialSetId)
          mediaIds.push(mediaId)
        }
      } catch (error) {
        console.error('Image upload failed:', error)
      }
    }

    const results: Record<string, any> = {}

    // Publish to X
    if (xContent) {
      const posts = xContent.includes('\n\n\n\n')
        ? xContent.split('\n\n\n\n').map((text: string) => ({ text: text.trim() }))
        : [{ text: xContent.trim() }]

      if (mediaIds.length > 0 && posts.length > 0) {
        posts[0].media_ids = mediaIds
      }

      const xResponse = await fetch(`${baseUrl}/v2/social-sets/${socialSetId}/drafts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platforms: { x: { enabled: true, posts, settings: {} } },
          publish_at: schedule,
        }),
      })

      if (!xResponse.ok) {
        const error = await xResponse.json()
        throw new Error(`X publishing failed: ${error.message || xResponse.statusText}`)
      }

      results.x = await xResponse.json()
    }

    // Publish to LinkedIn
    if (linkedinContent) {
      const linkedinPosts = [{ text: linkedinContent.trim(), media_ids: mediaIds.length > 0 ? mediaIds : undefined }]

      const linkedinResponse = await fetch(`${baseUrl}/v2/social-sets/${socialSetId}/drafts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platforms: { linkedin: { enabled: true, posts: linkedinPosts, settings: {} } },
          publish_at: schedule,
        }),
      })

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
