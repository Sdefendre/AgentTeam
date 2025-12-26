import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
// These should be set as environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key must be set in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Content {
  id: string
  topic: string
  topic_slug: string
  blog_post: string | null
  x_post: string | null
  linkedin_post: string | null
  image_url: string | null
  image_data: Uint8Array | null
  status: 'draft' | 'published' | 'archived'
  platforms: string[]
  created_at: string
  updated_at: string
  published_at: string | null
  metadata: Record<string, any>
}

export interface PublishingHistory {
  id: string
  content_id: string
  platform: 'x' | 'linkedin'
  draft_id: string | null
  status: 'scheduled' | 'published' | 'failed'
  scheduled_for: string | null
  published_at: string | null
  error_message: string | null
  created_at: string
}

