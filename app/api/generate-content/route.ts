import { NextRequest } from 'next/server'

/**
 * Call Gemini API to generate content
 */
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

/**
 * Generate blog post content
 */
async function generateBlogPost(topic: string, apiKey: string): Promise<string> {
  const prompt = `Write a professional blog post about "${topic}".

Requirements:
- 800-1500 words
- SEO-optimized with clear structure
- Include frontmatter with: title, description, date, author
- Use H2 and H3 headings
- Professional tone but accessible
- Include actionable insights

Format:
---
title: "Your SEO Title"
description: "150-160 character description"
date: "${new Date().toISOString().split('T')[0]}"
author: "Author"
---

[Full blog post content in markdown]

Write the complete blog post now:`

  return await callGemini(prompt, apiKey)
}

/**
 * Generate X (Twitter) post
 */
async function generateXPost(topic: string, blogSummary: string, apiKey: string): Promise<string> {
  const prompt = `Create an X (Twitter) post about "${topic}".

Context: ${blogSummary.substring(0, 500)}

Requirements:
- Maximum 280 characters
- Hook first sentence
- Short, punchy sentences
- End with call-to-action
- NO hashtags (or max 1-2)

Write the X post now:`

  return await callGemini(prompt, apiKey)
}

/**
 * Generate LinkedIn post
 */
async function generateLinkedInPost(topic: string, blogSummary: string, apiKey: string): Promise<string> {
  const prompt = `Create a professional LinkedIn post about "${topic}".

Context: ${blogSummary.substring(0, 500)}

Requirements:
- 1000-1500 characters
- Professional storytelling
- Start with a hook
- End with an engaging question
- Add 3-5 relevant hashtags at the bottom

Write the LinkedIn post now:`

  return await callGemini(prompt, apiKey)
}

/**
 * POST /api/generate-content
 * Generate content with SSE streaming for real-time progress updates
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { topic, platforms, geminiApiKey } = body

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      // Helper to send SSE events
      const sendEvent = (type: string, data: any) => {
        const message = `data: ${JSON.stringify({ type, ...data })}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      try {
        // Validate inputs
        if (!topic) {
          sendEvent('error', { error: 'Topic is required' })
          controller.close()
          return
        }

        const apiKey = geminiApiKey || process.env.GEMINI_API_KEY

        if (!apiKey) {
          sendEvent('error', { error: 'Gemini API key is required. Add it in Settings.' })
          controller.close()
          return
        }

        // Step 1: Generate blog post
        sendEvent('step', { step: 'blog', status: 'in_progress' })
        let blogPost: string
        try {
          blogPost = await generateBlogPost(topic, apiKey)
          sendEvent('step', { step: 'blog', status: 'complete' })
        } catch (err: any) {
          sendEvent('step', { step: 'blog', status: 'error' })
          throw new Error(`Blog generation failed: ${err.message}`)
        }

        // Extract summary for social posts
        const blogBody = blogPost.split('---').slice(2).join('---').trim()
        const blogSummary = blogBody.substring(0, 500)

        // Step 2: Generate X post
        let xPost: string | null = null
        if (platforms.includes('x')) {
          sendEvent('step', { step: 'x', status: 'in_progress' })
          try {
            xPost = await generateXPost(topic, blogSummary, apiKey)
            sendEvent('step', { step: 'x', status: 'complete' })
          } catch (err: any) {
            sendEvent('step', { step: 'x', status: 'error' })
            throw new Error(`X post generation failed: ${err.message}`)
          }
        } else {
          sendEvent('step', { step: 'x', status: 'complete' })
        }

        // Step 3: Generate LinkedIn post
        let linkedinPost: string | null = null
        if (platforms.includes('linkedin')) {
          sendEvent('step', { step: 'linkedin', status: 'in_progress' })
          try {
            linkedinPost = await generateLinkedInPost(topic, blogSummary, apiKey)
            sendEvent('step', { step: 'linkedin', status: 'complete' })
          } catch (err: any) {
            sendEvent('step', { step: 'linkedin', status: 'error' })
            throw new Error(`LinkedIn post generation failed: ${err.message}`)
          }
        } else {
          sendEvent('step', { step: 'linkedin', status: 'complete' })
        }

        // Step 4: Get stock image
        sendEvent('step', { step: 'image', status: 'in_progress' })
        const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(topic.substring(0, 20))}/1200/630`
        // Small delay to show the image step animation
        await new Promise(resolve => setTimeout(resolve, 500))
        sendEvent('step', { step: 'image', status: 'complete' })

        // Send final results
        sendEvent('complete', {
          success: true,
          contentId: `content_${Date.now()}`,
          results: {
            blog: blogPost,
            x: xPost || undefined,
            linkedin: linkedinPost || undefined,
            image: imageUrl,
          },
        })

      } catch (error: any) {
        console.error('Content generation error:', error)
        sendEvent('error', { error: error.message || 'Failed to generate content' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
