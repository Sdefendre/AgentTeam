'use client'

import { useStore } from '@/store/useStore'

export default function HistoryView() {
    const { history, loadFromHistory, clearHistory, setCurrentView } = useStore()

    if (history.length === 0) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No History Yet</h3>
                    <p className="text-slate-400 mb-6">Your generated content will appear here</p>
                    <button
                        onClick={() => setCurrentView('create')}
                        className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all"
                    >
                        Create Your First Post
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Post History</h2>
                <button
                    onClick={clearHistory}
                    className="text-sm text-red-400 hover:text-red-300"
                >
                    Clear All
                </button>
            </div>

            <div className="space-y-3">
                {history.map((item) => (
                    <div
                        key={item.id}
                        className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-4 hover:border-violet-500/50 transition-all cursor-pointer group"
                        onClick={() => loadFromHistory(item)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-medium text-white group-hover:text-violet-300 transition-colors">
                                    {item.topic}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.results.blog && (
                                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                        Blog
                                    </span>
                                )}
                                {item.results.x && (
                                    <span className="px-2 py-1 bg-sky-500/20 text-sky-400 text-xs rounded-full">
                                        X
                                    </span>
                                )}
                                {item.results.linkedin && (
                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                        LinkedIn
                                    </span>
                                )}
                            </div>
                        </div>
                        {item.results.blog && (
                            <p className="text-sm text-slate-400 mt-3 line-clamp-2">
                                {item.results.blog.split('---')[2]?.substring(0, 150).trim()}...
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
