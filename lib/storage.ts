/**
 * Simple in-memory storage for content
 * No database required - data persists only during server runtime
 * For production, you'd want to use a database
 */

export interface Content {
  id: string
  topic: string
  topic_slug: string
  blog_post: string | null
  x_post: string | null
  linkedin_post: string | null
  image_url: string | null
  status: 'draft' | 'published' | 'archived'
  platforms: string[]
  created_at: string
  updated_at: string
  published_at: string | null
  metadata: Record<string, any>
}

// In-memory storage
const contentStore: Map<string, Content> = new Map()

/**
 * Generate a simple ID
 */
function generateId(): string {
  return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get all content
 */
export function getAllContent(limit = 50, status?: string): Content[] {
  let content = Array.from(contentStore.values())
  
  if (status) {
    content = content.filter(c => c.status === status)
  }
  
  // Sort by created_at descending
  content.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  return content.slice(0, limit)
}

/**
 * Get content by ID
 */
export function getContentById(id: string): Content | null {
  return contentStore.get(id) || null
}

/**
 * Create new content
 */
export function createContent(data: Omit<Content, 'id' | 'created_at' | 'updated_at'>): Content {
  const id = generateId()
  const now = new Date().toISOString()
  
  const content: Content = {
    id,
    ...data,
    created_at: now,
    updated_at: now,
  }
  
  contentStore.set(id, content)
  return content
}

/**
 * Update content
 */
export function updateContent(id: string, updates: Partial<Content>): Content | null {
  const existing = contentStore.get(id)
  if (!existing) {
    return null
  }
  
  const updated: Content = {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  }
  
  contentStore.set(id, updated)
  return updated
}

/**
 * Delete content
 */
export function deleteContent(id: string): boolean {
  return contentStore.delete(id)
}

