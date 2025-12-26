import { NextRequest, NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'
import * as storage from '@/lib/storage'
import {
  GEMINI_API_KEY,
  CONTENT_API_URL,
  AUTHOR_NAME,
  WEBSITE_URL,
  TWITTER_HANDLE,
  BLOG_MIN_WORDS,
  BLOG_MAX_WORDS,
} from '@/lib/config'

/**
 * Call Gemini API to generate content
 */
async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(`${CONTENT_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
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
async function generateBlogPost(topic: string): Promise<string> {
  const prompt = `Write a professional, engaging blog post about "${topic}" for DefendreSolutions.com.

Requirements:
- ${BLOG_MIN_WORDS}-${BLOG_MAX_WORDS} words
- SEO-optimized with clear structure
- Include frontmatter with: title, description, date, author
- Use H2 and H3 headings
- Professional tone but accessible
- Focus on practical value for businesses
- Include actionable insights

Format the response as:
---
title: "Your SEO-Optimized Title"
description: "Compelling 150-160 character description"
date: "${new Date().toISOString().split('T')[0]}"
author: "${AUTHOR_NAME}"
keywords: "relevant, keywords, here"
readTime: "X min read"
---

[Full blog post content in markdown]

Write the complete blog post now:`

  return await callGemini(prompt)
}

/**
 * Generate X (Twitter) post
 */
async function generateXPost(topic: string, blogSummary: string): Promise<string> {
  const prompt = `Create an engaging X (Twitter) post about "${topic}".

Context: ${blogSummary.substring(0, 500)}

Requirements:
- Maximum 280 characters
- Hook first sentence
- Short, punchy sentences
- Use line breaks for readability
- End with call-to-action: "→ ${WEBSITE_URL}"
- NO hashtags (or max 1-2 if essential)
- Professional but conversational tone

Format as a single post (NOT a thread).

Write the X post now:`

  return await callGemini(prompt)
}

/**
 * Generate LinkedIn post
 */
async function generateLinkedInPost(topic: string, blogSummary: string): Promise<string> {
  const prompt = `Create a professional LinkedIn post about "${topic}".

Context: ${blogSummary.substring(0, 500)}

Requirements:
- 1000-1500 characters
- Professional storytelling approach
- Start with a hook or personal insight
- Include 3-5 key takeaways or insights
- End with an engaging question to drive discussion
- Add 3-5 relevant hashtags at the bottom
- Use bullet points or numbered lists for readability

Write the LinkedIn post now:`

  return await callGemini(prompt)
}

/**
 * Generate content for a topic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, platforms } = body

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const topicSlug = slugify(topic)

    // Generate blog post first
    console.log(`Generating blog post for: ${topic}`)
    const blogPost = await generateBlogPost(topic)

    // Extract blog summary for social posts (first 500 chars after frontmatter)
    const blogBody = blogPost.split('---').slice(2).join('---').trim()
    const blogSummary = blogBody.substring(0, 500)

    // Generate social posts in parallel
    console.log('Generating social media posts...')
    const [xPost, linkedinPost] = await Promise.all([
      platforms.includes('x') ? generateXPost(topic, blogSummary) : Promise.resolve(null),
      platforms.includes('linkedin') ? generateLinkedInPost(topic, blogSummary) : Promise.resolve(null),
    ])

    // Get stock image from Unsplash (free alternative to AI generation)
    let imageUrl = null
    try {
      console.log('Fetching stock image from Unsplash...')

      // Extract keywords from topic for image search
      const searchQuery = topic.replace(/[^\w\s]/g, '').substring(0, 50)

      // Unsplash API (no key required for basic usage via source.unsplash.com)
      // For production, consider getting an Unsplash API key for better control
      imageUrl = `https://source.unsplash.com/1200x630/?${encodeURIComponent(searchQuery)},technology,business`

      console.log(`Stock image URL: ${imageUrl}`)
    } catch (error) {
      console.error('Stock image fetch failed:', error)
      // Continue without image
    }

    // Save to in-memory storage
    const content = storage.createContent({
      topic,
      topic_slug: topicSlug,
      blog_post: blogPost,
      x_post: xPost,
      linkedin_post: linkedinPost,
      image_url: imageUrl,
      platforms: platforms || ['x', 'linkedin'],
      status: 'draft',
      published_at: null,
      metadata: {},
    })

    return NextResponse.json({
      success: true,
      contentId: content.id,
      results: {
        blog: blogPost,
        x: xPost || undefined,
        linkedin: linkedinPost || undefined,
        image: imageUrl || undefined,
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
