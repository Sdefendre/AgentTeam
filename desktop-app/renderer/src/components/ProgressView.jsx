import React from 'react'
import useStore from '../store'

const Spinner = () => (
  <div className="w-8 h-8 border-3 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
)

const STEPS = [
  { id: 'blog', label: 'Writing Blog Post', icon: '📝' },
  { id: 'x', label: 'Creating X Post', icon: '𝕏' },
  { id: 'linkedin', label: 'Creating LinkedIn Post', icon: '💼' },
  { id: 'image', label: 'Generating Image', icon: '🖼️' }
]

function ProgressView() {
  const { topic, progress, currentStep, stepStatuses, reset } = useStore()

  const getStepStatus = (stepId) => {
    if (stepStatuses[stepId] === 'done') return 'complete'
    if (stepStatuses[stepId] === 'generating') return 'in_progress'
    if (stepStatuses[stepId] === 'error') return 'error'
    return 'pending'
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{progress}%</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Generating Content</h2>
        <p className="text-dark-400 text-sm">
          Creating content for <span className="text-primary-400">"{topic}"</span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="card p-4 mb-6">
        <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="card p-4 mb-6">
        <div className="space-y-3">
          {STEPS.map((step) => {
            const status = getStepStatus(step.id)
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                  status === 'in_progress'
                    ? 'bg-primary-500/10 border border-primary-500/30'
                    : status === 'complete'
                    ? 'bg-green-500/5 border border-green-500/20'
                    : status === 'error'
                    ? 'bg-red-500/5 border border-red-500/20'
                    : 'bg-dark-800/30 border border-transparent'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  status === 'complete'
                    ? 'bg-green-500'
                    : status === 'in_progress'
                    ? 'bg-primary-500'
                    : status === 'error'
                    ? 'bg-red-500'
                    : 'bg-dark-700'
                }`}>
                  {status === 'complete' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : status === 'in_progress' ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : status === 'error' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <span className="text-lg opacity-50">{step.icon}</span>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1">
                  <p className={`font-medium ${
                    status === 'complete' ? 'text-green-400' :
                    status === 'in_progress' ? 'text-white' :
                    status === 'error' ? 'text-red-400' :
                    'text-dark-500'
                  }`}>
                    {step.label}
                    {status === 'in_progress' && '...'}
                  </p>
                </div>

                {/* Status Badge */}
                {status === 'complete' && (
                  <span className="text-xs text-green-400 font-medium">Done</span>
                )}
                {status === 'in_progress' && (
                  <span className="text-xs text-primary-400 font-medium animate-pulse">Working</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Cancel Button */}
      <button
        onClick={reset}
        className="w-full py-3 bg-dark-800 hover:bg-dark-700 rounded-lg text-dark-300 font-medium transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}

export default ProgressView
