'use client'

import { useStore } from '@/store/useStore'
import CreateView from '@/components/CreateView'
import ProgressView from '@/components/ProgressView'
import SettingsView from '@/components/SettingsView'
import HistoryView from '@/components/HistoryView'
import dynamic from 'next/dynamic'

const PreviewView = dynamic(() => import('@/components/PreviewView'), {
  ssr: false,
})

export default function Home() {
  const { currentView, setCurrentView, history } = useStore()

  const renderView = () => {
    switch (currentView) {
      case 'progress':
        return <ProgressView />
      case 'preview':
        return <PreviewView />
      case 'settings':
        return <SettingsView />
      case 'history':
        return <HistoryView />
      default:
        return <CreateView />
    }
  }

  const navItems = [
    { id: 'create', label: 'Create', icon: '✨' },
    { id: 'history', label: 'History', icon: '📋', badge: history.length },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <span className="text-lg font-bold text-white hidden sm:block">Agent Team</span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.id === currentView ||
                  (item.id === 'create' && (currentView === 'progress' || currentView === 'preview'))
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as any)}
                    className={`relative px-3 py-2 sm:px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${isActive
                        ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-white border border-violet-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        {renderView()}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-800 py-3 px-4 text-center">
        <p className="text-xs text-slate-500">
          Powered by Gemini AI • Built with Next.js
        </p>
      </footer>
    </div>
  )
}
