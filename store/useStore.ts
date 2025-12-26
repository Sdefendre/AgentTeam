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
  contentId?: string
}

interface Store {
  // View state
  currentView: 'create' | 'progress' | 'preview' | 'settings'
  setCurrentView: (view: 'create' | 'progress' | 'preview' | 'settings') => void

  // Topic input
  topic: string
  setTopic: (topic: string) => void

  // Platform selection
  platforms: ('x' | 'linkedin')[]
  togglePlatform: (platform: 'x' | 'linkedin') => void

  // Generation state
  isGenerating: boolean
  currentStep: string | null
  progress: number
  stepStatuses: StepStatuses

  startGeneration: () => void
  updateStep: (step: string, status: 'pending' | 'in_progress' | 'complete' | 'error') => void
  stopGeneration: () => void

  // Generated content
  results: Results | null
  contentId: string | null
  setResults: (results: Results, contentId: string) => void

  // History
  history: any[]
  setHistory: (history: any[]) => void

  // Preview tab
  previewTab: 'blog' | 'x' | 'linkedin' | 'image'
  setPreviewTab: (tab: 'blog' | 'x' | 'linkedin' | 'image') => void

  // Error state
  error: string | null
  setError: (error: string | null) => void
  clearError: () => void

  // Reset
  reset: () => void
}

export const useStore = create<Store>((set) => ({
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
  currentStep: null,
  progress: 0,
  stepStatuses: {},

  startGeneration: () =>
    set({
      isGenerating: true,
      currentView: 'progress',
      currentStep: null,
      progress: 0,
      stepStatuses: {},
      error: null,
    }),

  updateStep: (step, status) =>
    set((state) => {
      const newStatuses = { ...state.stepStatuses, [step]: status }
      const steps = ['blog', 'x', 'linkedin', 'image', 'complete']
      const completed = steps.filter((s) => newStatuses[s] === 'complete').length
      return {
        currentStep: step,
        stepStatuses: newStatuses,
        progress: Math.round((completed / (steps.length - 1)) * 100),
      }
    }),

  stopGeneration: () => set({ isGenerating: false }),

  // Generated content
  results: null,
  contentId: null,
  setResults: (results, contentId) =>
    set({
      results,
      contentId,
      isGenerating: false,
      currentView: 'preview',
    }),

  // History
  history: [],
  setHistory: (history) => set({ history }),

  // Preview tab
  previewTab: 'blog',
  setPreviewTab: (tab) => set({ previewTab: tab }),

  // Error state
  error: null,
  setError: (error) => set({ error, isGenerating: false }),
  clearError: () => set({ error: null }),

  // Reset
  reset: () =>
    set({
      topic: '',
      currentView: 'create',
      isGenerating: false,
      currentStep: null,
      progress: 0,
      stepStatuses: {},
      results: null,
      contentId: null,
      error: null,
      previewTab: 'blog',
    }),
}))

