'use client'

import { create } from 'zustand'

interface StepStatuses {
  [key: string]: 'pending' | 'in_progress' | 'complete' | 'error'
}

interface Results {
  blog?: string
  x?: string
  linkedin?: string
  image?: string
}

interface HistoryItem {
  id: string
  topic: string
  createdAt: string
  results: Results
}

interface ScheduledPost {
  id: string
  topic: string
  scheduledDate: string
  status: 'draft' | 'scheduled' | 'published'
  platforms: ('x' | 'linkedin' | 'blog')[]
  results?: Results
}

interface UserProfile {
  name: string
  title: string
  handle: string
  image?: string
}

interface Store {
  // View state
  currentView: 'create' | 'progress' | 'preview' | 'settings' | 'history' | 'calendar'
  setCurrentView: (view: 'create' | 'progress' | 'preview' | 'settings' | 'history' | 'calendar') => void

  // Topic input
  topic: string
  setTopic: (topic: string) => void

  // Platform selection
  platforms: ('x' | 'linkedin')[]
  togglePlatform: (platform: 'x' | 'linkedin') => void

  // Generation state
  isGenerating: boolean
  progress: number
  stepStatuses: StepStatuses

  startGeneration: () => void
  updateStep: (step: string, status: 'pending' | 'in_progress' | 'complete' | 'error') => void

  // Generated content
  results: Results | null
  contentId: string | null
  setResults: (results: Results, contentId: string) => void

  // History
  history: HistoryItem[]
  addToHistory: (item: HistoryItem) => void
  loadFromHistory: (item: HistoryItem) => void
  clearHistory: () => void

  // Preview
  previewTab: 'blog' | 'x' | 'linkedin' | 'image'
  setPreviewTab: (tab: 'blog' | 'x' | 'linkedin' | 'image') => void
  showMarkdown: boolean
  toggleMarkdown: () => void

  // Calendar & Scheduled Posts
  scheduledPosts: ScheduledPost[]
  addScheduledPost: (post: ScheduledPost) => void
  updateScheduledPost: (id: string, updates: Partial<ScheduledPost>) => void
  deleteScheduledPost: (id: string) => void

  // User Profile
  userProfile: UserProfile
  updateUserProfile: (profile: Partial<UserProfile>) => void

  // Error state
  error: string | null
  setError: (error: string | null) => void
  clearError: () => void

  // Reset
  reset: () => void
}

// Load history from localStorage
function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('smm-agent-history')
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

// Save history to localStorage
function saveHistory(history: HistoryItem[]) {
  localStorage.setItem('smm-agent-history', JSON.stringify(history))
}

// Load scheduled posts from localStorage
function loadScheduledPosts(): ScheduledPost[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('smm-agent-scheduled-posts')
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

// Save scheduled posts to localStorage
function saveScheduledPosts(posts: ScheduledPost[]) {
  localStorage.setItem('smm-agent-scheduled-posts', JSON.stringify(posts))
}

// Load user profile from localStorage
function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return {
    name: 'Your Name',
    title: 'Your Title',
    handle: '@yourhandle'
  }
  const stored = localStorage.getItem('smm-agent-user-profile')
  if (!stored) return {
    name: 'Your Name',
    title: 'Your Title',
    handle: '@yourhandle'
  }
  try {
    return JSON.parse(stored)
  } catch {
    return {
      name: 'Your Name',
      title: 'Your Title',
      handle: '@yourhandle'
    }
  }
}

// Save user profile to localStorage
function saveUserProfile(profile: UserProfile) {
  localStorage.setItem('smm-agent-user-profile', JSON.stringify(profile))
}

export const useStore = create<Store>((set, get) => ({
  // View state
  currentView: 'create',
  setCurrentView: (view) => set({ currentView: view }),

  // Topic input
  topic: '',
  setTopic: (topic) => set({ topic }),

  // Platform selection
  platforms: ['x', 'linkedin'],
  togglePlatform: (platform) =>
    set((state) => ({
      platforms: state.platforms.includes(platform)
        ? state.platforms.filter((p) => p !== platform)
        : [...state.platforms, platform],
    })),

  // Generation state
  isGenerating: false,
  progress: 0,
  stepStatuses: {},

  startGeneration: () =>
    set({
      isGenerating: true,
      currentView: 'progress',
      progress: 0,
      stepStatuses: {},
      error: null,
    }),

  updateStep: (step, status) =>
    set((state) => {
      const newStatuses = { ...state.stepStatuses, [step]: status }
      const steps = ['research', 'blog', 'x', 'linkedin', 'image']
      const completed = steps.filter((s) => newStatuses[s] === 'complete').length
      return {
        stepStatuses: newStatuses,
        progress: Math.round((completed / steps.length) * 100),
      }
    }),

  // Generated content
  results: null,
  contentId: null,
  setResults: (results, contentId) => {
    const topic = get().topic
    const historyItem: HistoryItem = {
      id: contentId,
      topic,
      createdAt: new Date().toISOString(),
      results,
    }
    const history = [historyItem, ...get().history].slice(0, 50) // Keep last 50
    saveHistory(history)
    set({
      results,
      contentId,
      isGenerating: false,
      currentView: 'preview',
      history,
    })
  },

  // History
  history: typeof window !== 'undefined' ? loadHistory() : [],
  addToHistory: (item) => {
    const history = [item, ...get().history].slice(0, 50)
    saveHistory(history)
    set({ history })
  },
  loadFromHistory: (item) => {
    set({
      topic: item.topic,
      results: item.results,
      contentId: item.id,
      currentView: 'preview',
      previewTab: 'blog',
    })
  },
  clearHistory: () => {
    localStorage.removeItem('smm-agent-history')
    set({ history: [] })
  },

  // Preview
  previewTab: 'blog',
  setPreviewTab: (tab) => set({ previewTab: tab }),
  showMarkdown: false,
  toggleMarkdown: () => set((state) => ({ showMarkdown: !state.showMarkdown })),

  // Calendar & Scheduled Posts
  scheduledPosts: typeof window !== 'undefined' ? loadScheduledPosts() : [],
  addScheduledPost: (post) => {
    const scheduledPosts = [...get().scheduledPosts, post]
    saveScheduledPosts(scheduledPosts)
    set({ scheduledPosts })
  },
  updateScheduledPost: (id, updates) => {
    const scheduledPosts = get().scheduledPosts.map((post) =>
      post.id === id ? { ...post, ...updates } : post
    )
    saveScheduledPosts(scheduledPosts)
    set({ scheduledPosts })
  },
  deleteScheduledPost: (id) => {
    const scheduledPosts = get().scheduledPosts.filter((post) => post.id !== id)
    saveScheduledPosts(scheduledPosts)
    set({ scheduledPosts })
  },

  // User Profile
  userProfile: typeof window !== 'undefined' ? loadUserProfile() : {
    name: 'Your Name',
    title: 'Your Title',
    handle: '@yourhandle'
  },
  updateUserProfile: (profile) => {
    const userProfile = { ...get().userProfile, ...profile }
    saveUserProfile(userProfile)
    set({ userProfile })
  },

  // Error state
  error: null,
  setError: (error) => set({ error, isGenerating: false, currentView: 'create' }),
  clearError: () => set({ error: null }),

  // Reset
  reset: () =>
    set({
      topic: '',
      currentView: 'create',
      isGenerating: false,
      progress: 0,
      stepStatuses: {},
      results: null,
      contentId: null,
      error: null,
      previewTab: 'blog',
      showMarkdown: false,
    }),
}))
