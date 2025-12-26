'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useStore } from '@/store/useStore'
import { parseBlogFrontmatter } from '@/lib/utils'

const TABS = [
  { id: 'blog', label: 'Blog' },
  { id: 'x', label: 'X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'image', label: 'Image' }
]

export default function PreviewView() {
  const {
    topic,
    results,
    contentId,
    platforms,
    previewTab,
    setPreviewTab,
    reset
  } = useStore()

  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string; platform?: string } | null>(null)

  const blogContent = results?.blog
  const xContent = results?.x
  const linkedinContent = results?.linkedin
  const imageUrl = results?.image

  const handlePublish = async (platform: 'x' | 'linkedin' | 'blog') => {
    let content: string | undefined

    if (platform === 'x') content = xContent
    else if (platform === 'linkedin') content = linkedinContent
    else if (platform === 'blog') content = blogContent

    if (!content) return

    setIsPublishing(true)
    setPublishResult(null)

    try {
      let response

      if (platform === 'blog') {
        // Publish blog to DefendreSolutions
        response = await fetch('/api/publish-blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blogContent: content,
          }),
        })
      } else {
        // Publish to X or LinkedIn via Typefully
        response = await fetch('/api/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [platform === 'x' ? 'xContent' : 'linkedinContent']: content,
            imageUrl,
            schedule: 'next-free-slot',
          }),
        })
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to publish')
      }

      setPublishResult({ success: true, message: 'Published successfully!', platform })
    } catch (error: any) {
      setPublishResult({ success: false, message: error.message, platform })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleNewContent = () => {
    reset()
  }

  const { meta: blogMeta, body: blogBody } = parseBlogFrontmatter(blogContent || '')

  const renderTabContent = () => {
    switch (previewTab) {
      case 'blog':
        return (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-6 overflow-auto max-h-[400px]">
              {blogMeta.title && (
                <div className="mb-6 pb-4 border-b border-slate-700">
                  <h1 className="text-xl font-bold text-white mb-2">{blogMeta.title}</h1>
                  {blogMeta.description && (
                    <p className="text-slate-400 text-sm">{blogMeta.description}</p>
                  )}
                </div>
              )}
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{blogBody || blogContent || 'No blog content generated'}</ReactMarkdown>
              </div>
            </div>
            {blogContent && (
              <div className="flex items-center justify-end">
                <button
                  onClick={() => handlePublish('blog')}
                  disabled={isPublishing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
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
            <div className="bg-black rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
                  SD
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Steve Defendre</span>
                    <span className="text-gray-500 text-sm">@sdefendre</span>
                  </div>
                  <div className="mt-2 text-white whitespace-pre-wrap text-sm">
                    {xContent || 'No X content generated'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                (xContent?.length || 0) > 280 ? 'text-red-400' : 'text-green-400'
              }`}>
                {xContent?.length || 0} / 280 characters
              </span>
              {xContent && (
                <button
                  onClick={() => handlePublish('x')}
                  disabled={isPublishing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
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
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  SD
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Steve Defendre</p>
                  <p className="text-sm text-gray-500">Founder at DefendreSolutions</p>
                </div>
              </div>
              <div className="text-gray-800 whitespace-pre-wrap text-sm">
                {linkedinContent || 'No LinkedIn content generated'}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                (linkedinContent?.length || 0) > 3000 ? 'text-red-400' : 'text-green-400'
              }`}>
                {linkedinContent?.length || 0} / 3000 characters
              </span>
              {linkedinContent && (
                <button
                  onClick={() => handlePublish('linkedin')}
                  disabled={isPublishing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
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
                alt="Generated image"
                className="max-w-full max-h-[350px] rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-48 bg-slate-800 rounded-lg flex items-center justify-center">
                <p className="text-slate-500">No image generated</p>
              </div>
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
      <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-green-300 text-sm">Content generated successfully for "{topic}"</span>
      </div>

      {/* Publish Result */}
      {publishResult && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${
          publishResult.success
            ? 'bg-green-500/10 border border-green-500/30'
            : 'bg-red-500/10 border border-red-500/30'
        }`}>
          <svg className={`w-5 h-5 ${publishResult.success ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {publishResult.success ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
          <span className={`text-sm ${publishResult.success ? 'text-green-300' : 'text-red-300'}`}>
            {publishResult.success ? publishResult.message : `Error: ${publishResult.message}`}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPreviewTab(tab.id as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              previewTab === tab.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Preview */}
      <div className="card p-4 mb-4">
        {renderTabContent()}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleNewContent}
          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New
        </button>
      </div>
    </div>
  )
}

