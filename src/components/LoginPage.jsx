import { useState } from 'react'
import { useApp } from '../App'

export default function LoginPage() {
  const { login, signup } = useApp()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim() || (!isLoginMode && !displayName.trim())) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 600))

    if (isLoginMode) {
      const ok = login(username.trim(), password)
      if (!ok) {
        setError('Invalid username or password. Try the demo credentials below.')
      }
    } else {
      const res = signup(displayName.trim(), username.trim(), password)
      if (!res.success) {
        setError(res.message)
      }
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-glow login-glow-1" />
      <div className="login-glow login-glow-2" />
      <div className="login-glow login-glow-3" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <span className="monkey-icon" style={{ fontSize: '24px' }}>🐒</span>
          </div>
          <span className="login-logo-text">Loodlie</span>
        </div>
        <p className="login-subtitle">Your personal productivity hub</p>

        <h1 className="login-title">{isLoginMode ? 'Welcome back 👋' : 'Create Account ✨'}</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
          {isLoginMode ? 'Sign in to continue to your dashboard' : 'Join Loodlie and boost your productivity'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                id="login-displayname"
                className="form-input"
                type="text"
                placeholder="e.g. Jane Doe"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                autoFocus={!isLoginMode}
              />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="login-username"
              className="form-input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  fontSize: '16px', padding: '4px'
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            id="login-submit"
            className="btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? '⏳ Please wait...' : (isLoginMode ? '→ Sign In' : '→ Sign Up')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: '600', cursor: 'pointer', padding: 0 }}
            onClick={() => {
              setIsLoginMode(!isLoginMode)
              setError('')
            }}
          >
            {isLoginMode ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
