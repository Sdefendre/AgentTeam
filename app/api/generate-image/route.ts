import { NextRequest, NextResponse } from 'next/server'
import {
  GEMINI_API_KEY,
  IMAGE_API_URL,
  DEFAULT_IMAGE_STYLE,
} from '@/lib/config'

/**
 * Generate AI image using Nano Banana Pro API
 */
export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { prompt } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const fullPrompt = `Generate an image: ${prompt}. Style: ${DEFAULT_IMAGE_STYLE}`

    const payload = {
      contents: [
        {
          parts: [{ text: fullPrompt }],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }

    const response = await fetch(`${IMAGE_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok || 'error' in data) {
      return NextResponse.json(
        { error: data.error?.message || 'Failed to generate image' },
        { status: response.status || 500 }
      )
    }

    if (!data.candidates || data.candidates.length === 0) {
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      )
    }

    // Extract image data
    for (const part of data.candidates[0].content?.parts || []) {
      if (part.inlineData) {
        // Return base64 image data
        return NextResponse.json({
          success: true,
          imageData: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/jpeg',
        })
      }
    }

    return NextResponse.json(
      { error: 'No image in response' },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    )
  }
}

