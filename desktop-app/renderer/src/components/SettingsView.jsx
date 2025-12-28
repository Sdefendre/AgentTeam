import React, { useState, useEffect } from 'react'

const ApiKeyInput = ({ label, value, onChange, onTest, testing, testResult }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-dark-300">{label}</label>
    <div className="flex gap-2">
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter API key..."
        className="flex-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
      />
      <button
        onClick={onTest}
        disabled={!value || testing}
        className="px-4 py-3 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors min-w-[80px]"
      >
        {testing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
        ) : 'Test'}
      </button>
    </div>
    {testResult && (
      <div className={`text-sm px-3 py-2 rounded-lg ${
        testResult.success
          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
          : 'bg-red-500/10 text-red-400 border border-red-500/20'
      }`}>
        {testResult.success ? '✓ ' : '✗ '}{testResult.message}
      </div>
    )}
  </div>
)

function SettingsView() {
  const [keys, setKeys] = useState({
    anthropic: '',
    nanoBanana: '',
    typefully: ''
  })
  const [testing, setTesting] = useState({
    anthropic: false,
    nanoBanana: false,
    typefully: false
  })
  const [testResults, setTestResults] = useState({
    anthropic: null,
    nanoBanana: null,
    typefully: null
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loadKeys = async () => {
      const savedKeys = await window.agentTeam.getApiKeys()
      if (savedKeys) {
        setKeys(savedKeys)
      }
    }
    loadKeys()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await window.agentTeam.saveApiKeys(keys)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const testKey = async (keyType) => {
    setTesting(prev => ({ ...prev, [keyType]: true }))
    setTestResults(prev => ({ ...prev, [keyType]: null }))

    let result
    switch (keyType) {
      case 'anthropic':
        result = await window.agentTeam.testAnthropic(keys.anthropic)
        break
      case 'nanoBanana':
        result = await window.agentTeam.testNanoBanana(keys.nanoBanana)
        break
      case 'typefully':
        result = await window.agentTeam.testTypefully(keys.typefully)
        break
    }

    setTestResults(prev => ({ ...prev, [keyType]: result }))
    setTesting(prev => ({ ...prev, [keyType]: false }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          API Settings
        </h2>

        <div className="space-y-6">
          {/* Anthropic API Key */}
          <ApiKeyInput
            label="Anthropic API Key (Required - Content Generation)"
            value={keys.anthropic}
            onChange={(val) => setKeys(prev => ({ ...prev, anthropic: val }))}
            onTest={() => testKey('anthropic')}
            testing={testing.anthropic}
            testResult={testResults.anthropic}
          />

          {/* Nano Banana / Google API Key */}
          <ApiKeyInput
            label="Google API Key (Optional - Image Generation)"
            value={keys.nanoBanana}
            onChange={(val) => setKeys(prev => ({ ...prev, nanoBanana: val }))}
            onTest={() => testKey('nanoBanana')}
            testing={testing.nanoBanana}
            testResult={testResults.nanoBanana}
          />

          {/* Typefully API Key */}
          <ApiKeyInput
            label="Typefully API Key (Optional - Publishing)"
            value={keys.typefully}
            onChange={(val) => setKeys(prev => ({ ...prev, typefully: val }))}
            onTest={() => testKey('typefully')}
            testing={testing.typefully}
            testResult={testResults.typefully}
          />

          {/* Save Button */}
          <div className="pt-4 border-t border-dark-800">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 disabled:opacity-50 rounded-lg text-white font-semibold transition-all"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : saved ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </span>
              ) : 'Save API Keys'}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-dark-800/50 rounded-lg">
          <h3 className="text-sm font-semibold text-dark-300 mb-2">How to get API keys:</h3>
          <ul className="text-sm text-dark-400 space-y-1">
            <li>• <strong>Anthropic:</strong> console.anthropic.com/settings/keys</li>
            <li>• <strong>Google:</strong> aistudio.google.com/apikey</li>
            <li>• <strong>Typefully:</strong> typefully.com/settings/api</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SettingsView
