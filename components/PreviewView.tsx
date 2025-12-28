'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useStore } from '@/store/useStore'

// Parse blog frontmatter
function parseBlogFrontmatter(content: string): { meta: Record<string, string>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: content }
  const meta: Record<string, string> = {}
  match[1].split('\n').forEach((line) => {
    const [key, ...vals] = line.split(':')
    if (key && vals.length) {
      meta[key.trim()] = vals.join(':').trim().replace(/^["']|["']$/g, '')
    }
  })
  return { meta, body: match[2] }
}

// Get settings from localStorage
function getSettings() {
  if (typeof window === 'undefined') return {}
  const stored = localStorage.getItem('agent-team-settings')
  if (!stored) return {}
  try {
    return JSON.parse(stored)
  } catch {
    return {}
  }
}

const TABS = [
  { id: 'blog', label: 'Blog' },
  { id: 'x', label: 'X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'image', label: 'Image' },
]

export default function PreviewView() {
  const { topic, results, previewTab, setPreviewTab, reset, showMarkdown, toggleMarkdown } = useStore()

  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const blogContent = results?.blog || ''
  const xContent = results?.x || ''
  const linkedinContent = results?.linkedin || ''
  const imageUrl = results?.image || ''

  const handlePublish = async (platform: 'x' | 'linkedin' | 'blog') => {
    let content: string | undefined
    if (platform === 'x') content = xContent
    else if (platform === 'linkedin') content = linkedinContent
    else if (platform === 'blog') content = blogContent

    if (!content) return

    const settings = getSettings()
    setIsPublishing(true)
    setPublishResult(null)

    try {
      let response

      if (platform === 'blog') {
        response = await fetch('/api/publish-blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blogContent: content,
            blogApiKey: settings.blogApiKey,
            blogApiUrl: settings.blogApiUrl,
          }),
        })
      } else {
        response = await fetch('/api/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [platform === 'x' ? 'xContent' : 'linkedinContent']: content,
            imageUrl,
            schedule: 'next-free-slot',
            typefullyApiKey: settings.typefullyApiKey,
            typefullySocialSetId: settings.typefullySocialSetId,
          }),
        })
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to publish')
      }

      setPublishResult({ success: true, message: 'Published successfully!' })
    } catch (error: any) {
      setPublishResult({ success: false, message: error.message })
    } finally {
      setIsPublishing(false)
    }
  }

  const { meta: blogMeta, body: blogBody } = parseBlogFrontmatter(blogContent)

  const renderTabContent = () => {
    switch (previewTab) {
      case 'blog':
        return (
          <div className="space-y-4">
            {/* Toggle */}
            <div className="flex justify-end">
              <button
                onClick={toggleMarkdown}
                className="text-sm text-slate-400 hover:text-white"
              >
                {showMarkdown ? 'View Rendered' : 'View Markdown'}
              </button>
            </div>

            {showMarkdown ? (
              /* Raw Markdown View */
              <div className="bg-slate-800 rounded-lg p-4 overflow-auto max-h-[400px]">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                  {blogContent || 'No blog content'}
                </pre>
              </div>
            ) : (
              /* Rendered Blog Preview */
              <div className="bg-white rounded-lg p-6 overflow-auto max-h-[400px]">
                {blogMeta.title && (
                  <div className="mb-6 pb-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">{blogMeta.title}</h1>
                    {blogMeta.description && (
                      <p className="text-gray-600 mt-2">{blogMeta.description}</p>
                    )}
                    {blogMeta.date && (
                      <p className="text-sm text-gray-500 mt-2">{blogMeta.date}</p>
                    )}
                  </div>
                )}
                <div className="prose prose-sm max-w-none text-gray-800">
                  <ReactMarkdown>{blogBody || 'No blog content'}</ReactMarkdown>
                </div>
              </div>
            )}

            {blogContent && (
              <div className="flex justify-end">
                <button
                  onClick={() => handlePublish('blog')}
                  disabled={isPublishing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-white text-sm font-medium"
                >
                  {isPublishing ? 'Publishing...' : 'Publish to Blog'}
                </button>
              </div>
            )}
          </div>
        )

      case 'x':
        return (
          <div className="space-y-4">
            {/* Toggle */}
            <div className="flex justify-end">
              <button
                onClick={toggleMarkdown}
                className="text-sm text-slate-400 hover:text-white"
              >
                {showMarkdown ? 'View Rendered' : 'View Markdown'}
              </button>
            </div>

            {showMarkdown ? (
              <div className="bg-slate-800 rounded-lg p-4">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                  {xContent || 'No X content'}
                </pre>
              </div>
            ) : (
              /* X/Twitter Preview */
              <div className="bg-black rounded-xl p-4 max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    U
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Your Name</span>
                      <span className="text-gray-500 text-sm">@yourhandle</span>
                    </div>
                    <div className="mt-2 text-white text-sm whitespace-pre-wrap">
                      {xContent || 'No X content'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${(xContent?.length || 0) > 280 ? 'text-red-400' : 'text-green-400'
                  }`}
              >
                {xContent?.length || 0} / 280
              </span>
              {xContent && (
                <button
                  onClick={() => handlePublish('x')}
                  disabled={isPublishing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-white text-sm font-medium"
                >
                  {isPublishing ? 'Publishing...' : 'Publish to X'}
                </button>
              )}
            </div>
          </div>
        )

      case 'linkedin':
        return (
          <div className="space-y-4">
            {/* Toggle */}
            <div className="flex justify-end">
              <button
                onClick={toggleMarkdown}
                className="text-sm text-slate-400 hover:text-white"
              >
                {showMarkdown ? 'View Rendered' : 'View Markdown'}
              </button>
            </div>

            {showMarkdown ? (
              <div className="bg-slate-800 rounded-lg p-4">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                  {linkedinContent || 'No LinkedIn content'}
                </pre>
              </div>
            ) : (
              /* LinkedIn Preview */
              <div className="bg-white rounded-lg p-4 max-w-lg mx-auto">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold">
                    U
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Your Name</p>
                    <p className="text-xs text-gray-500">Your Title • Just now</p>
                  </div>
                </div>
                <div className="text-gray-800 text-sm whitespace-pre-wrap">
                  {linkedinContent || 'No LinkedIn content'}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${(linkedinContent?.length || 0) > 3000 ? 'text-red-400' : 'text-green-400'
                  }`}
              >
                {linkedinContent?.length || 0} / 3000
              </span>
              {linkedinContent && (
                <button
                  onClick={() => handlePublish('linkedin')}
                  disabled={isPublishing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded text-white text-sm font-medium"
                >
                  {isPublishing ? 'Publishing...' : 'Publish to LinkedIn'}
                </button>
              )}
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="flex flex-col items-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Generated"
                className="max-w-full max-h-[350px] rounded-lg"
                onError={(e) => {
                  // Fallback to placeholder on error
                  (e.target as HTMLImageElement).src = `https://placehold.co/1200x630/1e293b/64748b?text=${encodeURIComponent(topic || 'Image')}`
                }}
              />
            ) : (
              <div className="w-full h-48 bg-slate-800 rounded-lg flex items-center justify-center">
                <p className="text-slate-500">No image</p>
              </div>
            )}
            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm text-blue-400 hover:underline"
              >
                Open image in new tab
              </a>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Message */}
      <div className="mb-4 p-3 bg-green-900/30 border border-green-800/50 rounded-lg">
        <span className="text-green-300 text-sm">Content generated for "{topic}"</span>
      </div>

      {/* Publish Result */}
      {publishResult && (
        <div
          className={`mb-4 p-3 rounded-lg ${publishResult.success
              ? 'bg-green-900/30 border border-green-800/50'
              : 'bg-red-900/30 border border-red-800/50'
            }`}
        >
          <span className={`text-sm ${publishResult.success ? 'text-green-300' : 'text-red-300'}`}>
            {publishResult.success ? publishResult.message : `Error: ${publishResult.message}`}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-lg mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPreviewTab(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium ${previewTab === tab.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
        {renderTabContent()}
      </div>

      {/* Actions */}
      <button
        onClick={reset}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
      >
        Create New
      </button>
    </div>
  )
}
