import React from 'react'
import useStore from '../store'

function Sidebar() {
  const { currentView, setCurrentView, history, reset, setContent, setTopic } = useStore()

  const handleNewContent = () => {
    reset()
    setCurrentView('create')
  }

  const handleHistoryClick = async (item) => {
    try {
      const content = await window.agentTeam.readContentFolder(item.path)
      setTopic(item.title)
      setContent(content)
    } catch (error) {
      console.error('Failed to load content:', error)
    }
  }

  // Group history by month
  const groupedHistory = history.reduce((acc, item) => {
    const month = item.month
    if (!acc[month]) {
      acc[month] = []
    }
    acc[month].push(item)
    return acc
  }, {})

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(year, parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <aside className="w-72 bg-gradient-to-b from-dark-900 to-dark-950 border-r border-dark-800/50 flex flex-col">
      {/* Logo Section */}
      <div className="p-5 border-b border-dark-800/50">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">Agent Team</h1>
            <p className="text-xs text-dark-500">Content Pipeline</p>
          </div>
        </div>

        {/* New Content Button */}
        <button
          onClick={handleNewContent}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Content</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3">
        <button
          onClick={() => setCurrentView('create')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            currentView === 'create'
              ? 'bg-gradient-to-r from-primary-500/20 to-purple-500/10 border border-primary-500/30 text-white'
              : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            currentView === 'create' ? 'bg-primary-500/20' : 'bg-dark-800'
          }`}>
            <svg className={`w-4 h-4 ${currentView === 'create' ? 'text-primary-400' : 'text-dark-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <span className="font-medium">Create</span>
            {currentView === 'create' && (
              <span className="block text-xs text-dark-400">Active workspace</span>
            )}
          </div>
        </button>
      </nav>

      {/* History */}
      <div className="flex-1 overflow-auto px-3 pb-3">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
            History
          </h3>
          <span className="text-xs text-dark-600 bg-dark-800 px-2 py-0.5 rounded-full">
            {history.length}
          </span>
        </div>

        {Object.keys(groupedHistory).length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm text-dark-500">No content yet</p>
            <p className="text-xs text-dark-600 mt-1">Create your first post above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedHistory).map(([month, items]) => (
              <div key={month}>
                <h4 className="px-4 py-2 text-xs font-medium text-dark-500 sticky top-0 bg-dark-900/80 backdrop-blur-sm">
                  {formatMonth(month)}
                </h4>
                <div className="space-y-1">
                  {items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleHistoryClick(item)}
                      className="w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-dark-800/70 group"
                    >
                      <div className="flex items-start gap-3">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-dark-700 group-hover:border-primary-500/30 transition-colors"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-dark-800 to-dark-700 flex items-center justify-center flex-shrink-0 border border-dark-700">
                            <svg className="w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-dark-200 group-hover:text-white truncate font-medium transition-colors">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.isComplete ? (
                              <span className="badge badge-success text-[10px] py-0.5">
                                <svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Complete
                              </span>
                            ) : (
                              <span className="badge badge-warning text-[10px] py-0.5">
                                Draft
                              </span>
                            )}
                            <span className="text-[10px] text-dark-600">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / User */}
      <div className="p-4 border-t border-dark-800/50 bg-dark-900/80">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-primary-500/20">
            SD
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
              Steve Defendre
            </p>
            <p className="text-xs text-dark-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              DefendreSolutions
            </p>
          </div>
          <svg className="w-4 h-4 text-dark-500 group-hover:text-dark-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
