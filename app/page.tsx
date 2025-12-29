'use client'

import { useStore } from '@/store/useStore'
import CreateView from '@/components/CreateView'
import ProgressView from '@/components/ProgressView'
import SettingsView from '@/components/SettingsView'
import HistoryView from '@/components/HistoryView'
import CalendarView from '@/components/CalendarView'
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
      case 'calendar':
        return <CalendarView />
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
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'history', label: 'History', icon: '📋', badge: history.length },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0a0f]">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-slate-950 to-[#0a0a0f]" />

        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-violet-600/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-cyan-600/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-gradient-to-r from-indigo-600/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur-2xl border-b border-violet-500/20 sticky top-0 z-50 shadow-lg shadow-black/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">SM</span>
              </div>
              <span className="text-lg font-bold text-white hidden sm:block">Social Media Manager</span>
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
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${isActive
                      ? 'bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-cyan-600/20 text-white border border-violet-500/40 shadow-lg shadow-violet-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
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
      <footer className="bg-slate-900/50 border-t border-slate-800 py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4">
            <a
              href="/changelog"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 hover:border-violet-500/60 rounded-xl text-sm text-violet-300 hover:text-violet-200 transition-all duration-200 hover:scale-[1.02]"
            >
              <span className="text-base">📋</span>
              <span>View Changelog</span>
            </a>
          </div>

          <p className="text-xs text-slate-500">
            Built by{' '}
            <a
              href="https://defendresolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 hover:underline transition-colors"
            >
              DefendreSolutions.com
            </a>
            <span className="mx-2">•</span>
            <span className="text-slate-600">Powered by Claude Opus 4.5 & Google Imagen</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
