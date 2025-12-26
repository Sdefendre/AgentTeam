'use client'

import { useStore } from '@/store/useStore'
import CreateView from '@/components/CreateView'
import ProgressView from '@/components/ProgressView'
import dynamic from 'next/dynamic'

// Lazy load PreviewView to reduce initial bundle size
const PreviewView = dynamic(() => import('@/components/PreviewView'), {
  ssr: false,
})

export default function Home() {
  const { currentView, setCurrentView } = useStore()

  const renderView = () => {
    switch (currentView) {
      case 'progress':
        return <ProgressView />
      case 'preview':
        return <PreviewView />
      case 'settings':
        return <div className="max-w-2xl mx-auto card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
          <p className="text-slate-400">Settings page coming soon...</p>
        </div>
      default:
        return <CreateView />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('create')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'create' || currentView === 'progress' || currentView === 'preview'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'settings'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Settings
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Agent Team
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {renderView()}
      </main>
    </div>
  )
}
