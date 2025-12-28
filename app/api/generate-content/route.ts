import { NextRequest, NextResponse } from 'next/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

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
 * Generate blog post, X post, and LinkedIn post for a topic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, platforms, geminiApiKey } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Use provided API key or fall back to environment variable
    const apiKey = geminiApiKey || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is required. Add it in Settings.' },
        { status: 400 }
      )
    }

    const topicSlug = slugify(topic)

    // Generate blog post first
    console.log(`Generating blog post for: ${topic}`)
    const blogPost = await generateBlogPost(topic, apiKey)

    // Extract summary for social posts
    const blogBody = blogPost.split('---').slice(2).join('---').trim()
    const blogSummary = blogBody.substring(0, 500)

    // Generate social posts
    console.log('Generating social media posts...')
    const [xPost, linkedinPost] = await Promise.all([
      platforms.includes('x') ? generateXPost(topic, blogSummary, apiKey) : null,
      platforms.includes('linkedin') ? generateLinkedInPost(topic, blogSummary, apiKey) : null,
    ])

    // Get stock image - using picsum for reliable placeholder images
    // source.unsplash.com is deprecated
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(topic.substring(0, 20))}/1200/630`

    return NextResponse.json({
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
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    )
  }
}
