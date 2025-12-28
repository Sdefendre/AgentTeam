import React, { useEffect } from 'react'
import useStore from './store'
import CreateView from './components/CreateView'
import ProgressView from './components/ProgressView'
import PreviewView from './components/PreviewView'
import SettingsView from './components/SettingsView'

function App() {
  const {
    currentView,
    setCurrentView,
    setHistory,
    updateStep
  } = useStore()

  // Load history on mount
  useEffect(() => {
    const init = async () => {
      try {
        const history = await window.agentTeam.getHistory()
        setHistory(history || [])
      } catch (error) {
        console.error('Failed to load history:', error)
      }
    }
    init()
  }, [setHistory])

  // Set up progress event listener
  useEffect(() => {
    const unsubProgress = window.agentTeam.onProgress((data) => {
      updateStep(data.step, data.status)
    })

    return () => {
      unsubProgress()
    }
  }, [updateStep])

  const renderView = () => {
    switch (currentView) {
      case 'progress':
        return <ProgressView />
      case 'preview':
        return <PreviewView />
      case 'settings':
        return <SettingsView />
      default:
        return <CreateView />
    }
  }

  return (
    <div className="h-screen flex flex-col bg-dark-950">
      {/* Title bar */}
      <div className="h-8 drag-region bg-dark-900 flex items-center justify-center border-b border-dark-800">
        <span className="text-xs text-dark-400 font-medium">Agent Team</span>
      </div>

      {/* Navigation */}
      <div className="bg-dark-900 border-b border-dark-800 px-4 py-2">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('create')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'create' || currentView === 'progress' || currentView === 'preview'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              Create
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'settings'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              Settings
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-dark-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            API Ready
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

export default App
