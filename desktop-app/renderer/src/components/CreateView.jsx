import React from 'react'
import useStore from '../store'

const XIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

function CreateView() {
  const {
    topic,
    setTopic,
    platforms,
    togglePlatform,
    startGeneration,
    setResults,
    setError,
    error,
    clearError
  } = useStore()

  const handleGenerate = async () => {
    if (!topic.trim()) return
    clearError()
    startGeneration()

    try {
      const result = await window.agentTeam.generateAll(topic, platforms)
      if (result.success) {
        setResults(result.results, result.folderPath)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message || 'Failed to generate content')
    }
  }

  const canGenerate = topic.trim() && platforms.length > 0

  return (
    <div className="max-w-2xl mx-auto">
      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 card border-red-800/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="flex-1 text-sm text-dark-300">{error}</p>
          <button onClick={clearError} className="text-dark-500 hover:text-red-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="card p-6">
        {/* Topic Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-dark-300 mb-2">
            What would you like to write about?
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., AI automation for small businesses..."
            className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none h-24"
          />
        </div>

        {/* Platform Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Platforms
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => togglePlatform('x')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                platforms.includes('x')
                  ? 'bg-primary-500/20 border border-primary-500/50 text-white'
                  : 'bg-dark-800 border border-dark-700 text-dark-400 hover:text-white'
              }`}
            >
              <XIcon />
              <span>X (Twitter)</span>
            </button>
            <button
              onClick={() => togglePlatform('linkedin')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                platforms.includes('linkedin')
                  ? 'bg-primary-500/20 border border-primary-500/50 text-white'
                  : 'bg-dark-800 border border-dark-700 text-dark-400 hover:text-white'
              }`}
            >
              <LinkedInIcon />
              <span>LinkedIn</span>
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 ${
            canGenerate
              ? 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white'
              : 'bg-dark-800 text-dark-500 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate Content
        </button>

        {/* What you'll get */}
        <div className="mt-4 pt-4 border-t border-dark-800">
          <p className="text-xs text-dark-500 text-center">
            Creates: Blog post + AI image + social posts for selected platforms
          </p>
        </div>
      </div>
    </div>
  )
}

export default CreateView
