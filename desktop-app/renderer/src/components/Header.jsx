import React from 'react'
import useStore from '../store'

function Header() {
  const { currentView, topic, isGenerating } = useStore()

  const getTitle = () => {
    switch (currentView) {
      case 'progress':
        return `Generating: ${topic}`
      case 'preview':
        return `Preview: ${topic}`
      default:
        return 'Create Content'
    }
  }

  return (
    <header className="px-6 py-4 border-b border-dark-800/50">
      <h1 className="text-xl font-bold text-white flex items-center gap-2">
        {getTitle()}
        {isGenerating && (
          <span className="inline-block w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
        )}
      </h1>
    </header>
  )
}

export default Header
