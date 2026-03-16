import { useState, useRef, useEffect } from 'react'
import { useApp } from '../App'

export default function PersonalAIDashboard() {
  const { user, aiConfig } = useApp()
  const [messages, setMessages] = useState([
    { id: 1, text: `Hello ${user?.displayName || 'there'}! I am your personal Loodlie AI. How can I assist you today?`, sender: 'ai', timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputVal.trim()) return

    const userMsg = {
      id: Date.now(),
      text: inputVal.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }

    setMessages(prev => [...prev, userMsg])
    setInputVal('')
    setIsTyping(true)

    try {
      if (!aiConfig.apiKey) {
        throw new Error("API Key configuration is missing. Please configure it in Settings.")
      }
      
      const requestBody = {
        model: aiConfig.model || 'google/gemini-2.0-flash-001',
        messages: [
          { role: "system", content: "You are Loodlie, a helpful and concise productivity assistant inside a dashboard app." },
          ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
          { role: "user", content: inputVal.trim() }
        ],
      }

      console.group("🚀 Loodlie AI Request")
      console.log("Endpoint:", aiConfig.baseUrl)
      console.log("Model:", requestBody.model)
      console.log("Key Configured:", aiConfig.apiKey ? `${aiConfig.apiKey.slice(0, 10)}...` : "Using Developer Default")
      console.groupEnd()

      // Ensure we hit a valid endpoint path if it's missing
      let fetchUrl = aiConfig.baseUrl || 'https://openrouter.ai/api/v1/chat/completions'
      if (fetchUrl.includes('openrouter.ai') && !fetchUrl.endsWith('/chat/completions')) {
        fetchUrl = 'https://openrouter.ai/api/v1/chat/completions'
      }

      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.apiKey.trim()}`,
          'X-Title': 'Loodlie Dashboard',
          'HTTP-Referer': window.location.href,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          const text = await response.text();
          errorData = { error: { message: text || `HTTP ${response.status}` } };
        }
        console.error("AI API Error Response:", errorData)
        
        // Preserve the full error object for diagnostics
        const errMsg = errorData?.error?.message || JSON.stringify(errorData) || `API Error: ${response.status}`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      const aiResponseText = data.choices?.[0]?.message?.content || "Sorry, I received an empty response.";
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }])

    } catch (err) {
      console.error("🔴 Loodlie AI Fetch Error:", err)
      let errorText = `⚠️ Error: ${err.message}`
      
      if (err.message.includes("User not found")) {
        errorText = "⚠️ AI Key Revoked. \n\nMy built-in developer key was automatically disabled by OpenRouter because it was pushed to a public GitHub repository. \n\nTo fix this, you must enter your own private API key in Settings."
      } else if (err instanceof TypeError && err.message === "Failed to fetch") {
        errorText = "⚠️ Connection Blocked (CORS/Network). \n\nThis usually means your browser or an ad-blocker is blocking the request, or the API provider has strict security. \n\nTroubleshooting:\n1. Open Browser Console (F12) to see details.\n2. Ensure you are on a stable connection."
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: errorText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const clearChat = () => {
    if (window.confirm("Clear all messages?")) {
      setMessages([
        { id: 1, text: `Hello ${user?.displayName || 'there'}! I am your personal Loodlie AI. How can I assist you today?`, sender: 'ai', timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
      ])
    }
  }

  return (
    <div className="dashboard-wrapper chat-wrapper">
      <div className="modern-chat-container card">
        {/* Chat Header */}
        <div className="modern-chat-header">
          <div className="chat-header-avatar">🤖</div>
          <div className="chat-header-info">
            <h2>Loodlie AI</h2>
            <span className="status-online">● Online</span>
          </div>
          <div className="chat-header-actions" style={{ display: 'flex', gap: '8px' }}>
            <button onClick={clearChat} title="Clear Chat" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.6 }}>🗑️</button>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Using: {aiConfig.baseUrl?.includes('openrouter') ? 'OpenRouter' : 'Custom API'}</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="modern-chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`modern-message-wrapper ${msg.sender === 'user' ? 'sent' : 'received'}`}>
              {msg.sender === 'ai' && <div className="message-avatar">🤖</div>}
              <div className="modern-message-content">
                <div className="modern-chat-bubble" style={{ 
                  whiteSpace: 'pre-wrap',
                  border: msg.sender === 'ai' && msg.text.includes('⚠️') ? '1px solid rgba(248,113,113,0.4)' : 'none',
                  background: msg.sender === 'ai' && msg.text.includes('⚠️') ? 'rgba(248,113,113,0.05)' : undefined,
                  fontSize: msg.sender === 'ai' && msg.text.includes('⚠️') ? '13px' : 'inherit'
                }}>
                  {msg.text}
                  {msg.sender === 'ai' && msg.text.includes('⚠️') && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button 
                        onClick={() => setActivePage('settings')}
                        style={{ 
                          flex: 1,
                          padding: '8px', 
                          borderRadius: '6px', 
                          background: 'rgba(255,255,255,0.1)', 
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Settings ⚙️
                      </button>
                      <button 
                        onClick={() => window.location.reload()}
                        style={{ 
                          flex: 1,
                          padding: '8px', 
                          borderRadius: '6px', 
                          background: 'rgba(255,255,255,0.1)', 
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Reload App 🔄
                      </button>
                    </div>
                  )}
                </div>
                <div className="modern-message-timestamp">{msg.timestamp}</div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="modern-message-wrapper received">
              <div className="message-avatar">🤖</div>
              <div className="modern-message-content">
                <div className="modern-chat-bubble typing-bubble">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="modern-chat-input-container">
          <form className="modern-chat-form" onSubmit={handleSend}>
            <input
              type="text"
              className="modern-chat-input"
              placeholder="Message..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
            />
            <button type="submit" className="modern-chat-send-btn" disabled={!inputVal.trim() || isTyping}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
                <path d="M22 2L11 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
