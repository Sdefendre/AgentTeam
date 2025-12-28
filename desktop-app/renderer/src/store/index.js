import { create } from 'zustand'

const useStore = create((set, get) => ({
  // View state
  currentView: 'create', // 'create' | 'progress' | 'preview' | 'settings'
  setCurrentView: (view) => set({ currentView: view }),

  // Topic input
  topic: '',
  setTopic: (topic) => set({ topic }),

  // Platform selection
  platforms: ['x', 'linkedin'],
  togglePlatform: (platform) => set((state) => ({
    platforms: state.platforms.includes(platform)
      ? state.platforms.filter(p => p !== platform)
      : [...state.platforms, platform]
  })),

  // Generation state
  isGenerating: false,
  currentStep: null,
  progress: 0,
  stepStatuses: {},

  startGeneration: () => set({
    isGenerating: true,
    currentView: 'progress',
    currentStep: null,
    progress: 0,
    stepStatuses: {},
    error: null
  }),

  updateStep: (step, status) => set((state) => {
    const newStatuses = { ...state.stepStatuses, [step]: status }
    const steps = ['blog', 'x', 'linkedin', 'image', 'complete']
    const completed = steps.filter(s => newStatuses[s] === 'done').length
    return {
      currentStep: step,
      stepStatuses: newStatuses,
      progress: Math.round((completed / (steps.length - 1)) * 100)
    }
  }),

  stopGeneration: () => set({ isGenerating: false }),

  // Generated content
  results: null,
  folderPath: null,
  setResults: (results, folderPath) => set({
    results,
    folderPath,
    isGenerating: false,
    currentView: 'preview'
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
  reset: () => set({
    topic: '',
    currentView: 'create',
    isGenerating: false,
    currentStep: null,
    progress: 0,
    stepStatuses: {},
    results: null,
    folderPath: null,
    error: null,
    previewTab: 'blog'
  })
}))

export default useStore
