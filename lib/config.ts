/**
 * Configuration for Agent Team
 * Uses environment variables for API keys
 */

// API Keys - must be set in environment variables
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NANO_BANANA_API_KEY
export const TYPEFULLY_API_KEY = process.env.TYPEFULLY_API_KEY
export const BLOG_API_KEY = process.env.BLOG_API_KEY

// Typefully Settings
export const TYPEFULLY_BASE_URL = 'https://api.typefully.com'
export const TYPEFULLY_SOCIAL_SET_ID = process.env.TYPEFULLY_SOCIAL_SET_ID || '273516' // @Sdefendre

// Blog API Settings
export const BLOG_API_URL = process.env.BLOG_API_URL || 'https://defendresolutions.com/api/admin/publish-blog'

// Image Generation Settings
// Try gemini-2.0-flash-exp which supports both text and image generation
export const IMAGE_MODEL = 'gemini-2.0-flash-exp'
export const IMAGE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`

// Content Generation Settings
export const CONTENT_MODEL = 'gemini-2.0-flash-exp'
export const CONTENT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${CONTENT_MODEL}:generateContent`

// Default image style
export const DEFAULT_IMAGE_STYLE = 'professional, modern, tech-focused, clean composition, suitable for social media'
export const IMAGE_DIMENSIONS = '1200x630 landscape orientation'

// Content Settings
export const AUTHOR_NAME = 'Steve Defendre'
export const WEBSITE_URL = 'https://defendresolutions.com'
export const TWITTER_HANDLE = '@sdefendre'

// Content length targets
export const BLOG_MIN_WORDS = 800
export const BLOG_MAX_WORDS = 1500
export const LINKEDIN_TARGET_CHARS = 1500
export const X_MAX_CHARS = 280

// Validation
export function validateConfig() {
  const errors: string[] = []

  if (!GEMINI_API_KEY) {
    errors.push('GEMINI_API_KEY is required')
  }

  if (!TYPEFULLY_API_KEY) {
    errors.push('TYPEFULLY_API_KEY is required')
  }

  if (!BLOG_API_KEY) {
    errors.push('BLOG_API_KEY is required for blog publishing')
  }

  return errors
}

