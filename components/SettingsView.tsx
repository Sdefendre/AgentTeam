'use client'

import { useState, useEffect } from 'react'

// Keys stored in localStorage
const STORAGE_KEY = 'agent-team-settings'

interface Settings {
  geminiApiKey: string
  typefullyApiKey: string
  typefullySocialSetId: string
  blogApiKey: string
  blogApiUrl: string
}

const defaultSettings: Settings = {
  geminiApiKey: '',
  typefullyApiKey: '',
  typefullySocialSetId: '273516',
  blogApiKey: '',
  blogApiUrl: 'https://defendresolutions.com/api/admin/publish-blog',
}

export function getSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return defaultSettings
  try {
    return { ...defaultSettings, ...JSON.parse(stored) }
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export default function SettingsView() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [showKeys, setShowKeys] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // First check localStorage
    const localSettings = getSettings()

    // If localStorage has values, use them
    if (localSettings.geminiApiKey) {
      setSettings(localSettings)
      setLoading(false)
      return
    }

    // Otherwise, fetch from API (environment variables)
    fetch('/api/settings')
      .then((res) => res.json())
      .then((envSettings) => {
        // Merge: localStorage takes priority, then env vars, then defaults
        const merged = {
          ...defaultSettings,
          ...envSettings,
          ...localSettings,
        }
        // Only use env values if localStorage is empty
        if (!localSettings.geminiApiKey && envSettings.geminiApiKey) {
          merged.geminiApiKey = envSettings.geminiApiKey
        }
        if (!localSettings.typefullyApiKey && envSettings.typefullyApiKey) {
          merged.typefullyApiKey = envSettings.typefullyApiKey
        }
        if (!localSettings.blogApiKey && envSettings.blogApiKey) {
          merged.blogApiKey = envSettings.blogApiKey
        }
        setSettings(merged)
      })
      .catch(() => {
        setSettings(localSettings)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleChange = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputClass =
    'w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <p className="text-sm text-slate-400 mt-1">Configure your API keys</p>
          </div>
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            {showKeys ? '🙈 Hide' : '👁️ Show'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : (
          <div className="space-y-5">
            {/* Gemini API Key */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Gemini API Key <span className="text-red-400">*</span>
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={settings.geminiApiKey}
                onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                placeholder="AIza..."
                className={inputClass}
              />
              <p className="text-xs text-slate-500 mt-2">
                Get from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  className="text-violet-400 hover:underline"
                >
                  Google AI Studio →
                </a>
              </p>
            </div>

            <div className="border-t border-slate-700 pt-5">
              <p className="text-xs text-slate-500 mb-4">Optional: For Publishing</p>
            </div>

            {/* Typefully API Key */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Typefully API Key
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={settings.typefullyApiKey}
                onChange={(e) => handleChange('typefullyApiKey', e.target.value)}
                placeholder="For X & LinkedIn publishing"
                className={inputClass}
              />
            </div>

            {/* Typefully Social Set ID */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Typefully Social Set ID
              </label>
              <input
                type="text"
                value={settings.typefullySocialSetId}
                onChange={(e) => handleChange('typefullySocialSetId', e.target.value)}
                placeholder="273516"
                className={inputClass}
              />
            </div>

            {/* Blog API Key */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Blog API Key
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={settings.blogApiKey}
                onChange={(e) => handleChange('blogApiKey', e.target.value)}
                placeholder="For blog publishing"
                className={inputClass}
              />
            </div>

            {/* Blog API URL */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Blog API URL
              </label>
              <input
                type="text"
                value={settings.blogApiUrl}
                onChange={(e) => handleChange('blogApiUrl', e.target.value)}
                placeholder="https://yoursite.com/api/publish"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/25"
          >
            Save Settings
          </button>
          {saved && (
            <span className="text-emerald-400 text-sm flex items-center gap-1">
              ✓ Saved!
            </span>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-500 text-center">
          🔒 Settings are stored locally in your browser
        </p>
      </div>
    </div>
  )
}
