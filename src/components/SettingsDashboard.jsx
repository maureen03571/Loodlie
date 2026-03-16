import { useState } from 'react'
import { useApp } from '../App'

export default function SettingsDashboard() {
  const { theme, setTheme, user, aiConfig, setAiConfig, setActivePage } = useApp()
  const [saveStatus, setSaveStatus] = useState(null)
  const [testStatus, setTestStatus] = useState({ state: 'idle', message: '' })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleSave = () => {
    setSaveStatus('success')
    setTimeout(() => setSaveStatus(null), 3000)
  }

  const resetConfig = () => {
    if (window.confirm('Reset AI configuration to stable defaults? This will clear your personal key.')) {
      localStorage.removeItem('app_ai_config')
      setAiConfig({
        baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
        apiKey: import.meta.env.VITE_AI_KEY || '', 
        model: 'openrouter/auto'
      })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 2000)
    }
  }

  const testConnection = async () => {
    if (!aiConfig.apiKey) {
      setTestStatus({ state: 'error', message: 'Please enter an API Key first.' })
      return
    }
    
    setTestStatus({ state: 'loading', message: 'Testing connection...' })
    
    try {
      const response = await fetch(aiConfig.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [{ role: 'user', content: 'Say "Ready"' }],
          max_tokens: 5
        })
      })

      if (response.ok) {
        setTestStatus({ state: 'success', message: 'Connected successfully! AI is reachable.' })
      } else {
        const err = await response.json().catch(() => ({}))
        setTestStatus({ state: 'error', message: `API Error: ${response.status} - ${err.error?.message || 'Unauthorized'}` })
      }
    } catch (err) {
      setTestStatus({ 
        state: 'error', 
        message: 'Network/CORS Error: The browser blocked the request. Try using OpenRouter or check your internet.' 
      })
    }
  }

  return (
    <div className="dashboard-wrapper">
      <div className="welcome-header">
        <div className="welcome-greeting">⚙️ Settings</div>
        <h1 className="welcome-name">Preferences</h1>
        <div className="welcome-sub">Manage your Loodlie experience</div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h2 className="card-title" style={{ marginBottom: '24px' }}>Appearance</h2>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">App Theme</div>
            <div className="setting-desc">Switch between Dark and Light mode.</div>
          </div>
          <div className={`aesthetic-toggle ${theme === 'light' ? 'light-mode' : 'dark-mode'}`} onClick={toggleTheme}>
            <div className="toggle-track">
              <div className="toggle-thumb">
                {theme === 'light' ? '☀️' : '🌙'}
              </div>
            </div>
          </div>
        </div>

        <div className="section-divider" style={{ margin: '32px 0 16px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="card-title" style={{ margin: 0 }}>Personal AI</h2>
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-blue)', 
              fontSize: '12px', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {showAdvanced ? 'Hide Advanced Settings' : 'Advanced Configuration'}
          </button>
        </div>

        {!showAdvanced ? (
          <div className="login-hint" style={{ background: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
            <span style={{ color: '#22c55e', marginRight: '8px' }}>✅</span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Loodlie AI is active and configured by your developer. No setup required!
            </span>
          </div>
        ) : (
          <>
            <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <label className="form-label">API Base URL</label>
              <input 
                type="text" 
                className="form-input" 
                value={aiConfig.baseUrl} 
                onChange={e => setAiConfig(prev => ({...prev, baseUrl: e.target.value}))} 
                placeholder="https://openrouter.ai/api/v1/chat/completions"
              />
              <div className="setting-desc" style={{ marginTop: '8px' }}>Standard OpenAI completions endpoint. (e.g. OpenRouter, DeepSeek, OpenAI)</div>
            </div>

            <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>API Key</span>
                {!aiConfig.apiKey && import.meta.env.VITE_AI_KEY && (
                  <span style={{ fontSize: '10px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                    System Default Active ✅
                  </span>
                )}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: '11px', color: 'var(--accent-blue)', textDecoration: 'none' }}
                >
                  Get a Free Key ↗
                </a>
              </label>
              <input 
                type="password" 
                className="form-input" 
                value={aiConfig.apiKey} 
                onChange={e => setAiConfig(prev => ({...prev, apiKey: e.target.value}))} 
                placeholder="sk-or-v1-..."
              />
              <div className="setting-desc" style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '11px', lineHeight: '1.4' }}>
                <p>⚠️ <strong>Important:</strong> If you push a key to GitHub, it will be <strong>revoked automatically</strong>. Use the <code>.env</code> file or Vercel Secrets to stay secure.</p>
                <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Status:</span> {aiConfig.apiKey ? "using personal key" : (import.meta.env.VITE_AI_KEY ? "using system default" : "no key configured")}
                </div>
              </div>
            </div>

            <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <label className="form-label">Model Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={aiConfig.model} 
                onChange={e => setAiConfig(prev => ({...prev, model: e.target.value}))} 
                placeholder="google/gemini-2.0-flash-001"
              />
              <div className="setting-desc" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>The specific AI model to query.</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>Quick Select:</span>
                  <button onClick={() => setAiConfig(p => ({...p, model: 'openrouter/auto'}))} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--accent-blue)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', color: 'var(--accent-blue)' }}>✨ Auto (Best)</button>
                  <button onClick={() => setAiConfig(p => ({...p, model: 'google/gemini-2.0-flash-exp:free'}))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', fontSize: '10px', padding: '2px 4px', borderRadius: '4px', cursor: 'pointer' }}>Gemini</button>
                  <button onClick={() => setAiConfig(p => ({...p, model: 'meta-llama/llama-3.2-11b-vision-instruct:free'}))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', fontSize: '10px', padding: '2px 4px', borderRadius: '4px', cursor: 'pointer' }}>Llama</button>
                </div>
              </div>
            </div>

            <div className="settings-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button 
                className="btn-primary" 
                onClick={handleSave} 
                style={{ 
                  flex: 2,
                  background: saveStatus === 'success' ? '#22c55e' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' 
                }}
              >
                {saveStatus === 'success' ? '✅ Configuration Saved!' : 'Accept & Save Keys'}
              </button>
              
              <button 
                className="btn-secondary" 
                onClick={resetConfig}
                title="Reset to stable defaults"
                style={{ flex: 1, padding: '12px' }}
              >
                Reset
              </button>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button 
                className="btn-secondary" 
                onClick={testConnection}
                disabled={testStatus.state === 'loading'}
                style={{ width: '100%', borderStyle: 'dashed', color: testStatus.state === 'error' ? '#f87171' : testStatus.state === 'success' ? '#4ade80' : 'inherit' }}
              >
                {testStatus.state === 'loading' ? '⏳ Testing...' : '🔍 Test AI Connection'}
              </button>
              {testStatus.message && (
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '12px', 
                  color: testStatus.state === 'error' ? '#f87171' : testStatus.state === 'success' ? '#4ade80' : 'var(--text-secondary)',
                  padding: '8px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  border: `1px solid ${testStatus.state === 'error' ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`
                }}>
                  {testStatus.message}
                </div>
              )}
            </div>
          </>
        )}
        <div className="login-hint" style={{ marginTop: '24px', background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
          <strong style={{ color: '#f59e0b' }}>⚠️ CORS Trouble?</strong>
          <div style={{ marginTop: '8px', fontSize: '11px', lineHeight: '1.4' }}>
            Browser security (CORS) often blocks direct requests to OpenAI. To fix this:
            <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
              <li>Use <strong>OpenRouter</strong> (Recommended) which allows browser requests.</li>
              <li>If using <strong>Ollama</strong> (Local), run it with: <code style={{background: 'rgba(0,0,0,0.3)', padding: '2px 4px'}}>set OLLAMA_ORIGINS=*</code></li>
            </ul>
          </div>
        </div>

        <h2 className="card-title" style={{ marginTop: '36px', marginBottom: '24px' }}>Account Info</h2>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Display Name</div>
            <div className="setting-desc">{user?.displayName}</div>
          </div>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Username</div>
            <div className="setting-desc">@{user?.username}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
