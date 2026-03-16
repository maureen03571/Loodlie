import { useState, useEffect, createContext, useContext } from 'react'
// Loodlie App Core - Redeploy Trigger (Keys Secured via VITE_ Environment Variables)import LoginPage from './components/LoginPage'
import Sidebar from './components/Sidebar'
import TodoDashboard from './components/TodoDashboard'
import ShoppingDashboard from './components/ShoppingDashboard'
import GalleryDashboard from './components/GalleryDashboard'
import PersonalAIDashboard from './components/PersonalAIDashboard'
import ReceiptsDashboard from './components/ReceiptsDashboard'
import SettingsDashboard from './components/SettingsDashboard'

// ===== App Context =====
export const AppContext = createContext(null)

const APP_NAME = 'Loodlie'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekKey() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - day)
  return monday.toISOString().split('T')[0]
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

// ===== Developer AI Defaults =====
// These are loaded from .env during development or set in deployment settings (e.g. Vercel)
const DEV_DEFAULT_URL = import.meta.env.VITE_AI_URL || 'https://openrouter.ai/api/v1/chat/completions'
const DEV_DEFAULT_KEY = import.meta.env.VITE_AI_KEY || '' 
const DEV_DEFAULT_MODEL = import.meta.env.VITE_AI_MODEL || 'openrouter/auto'

function getValidUrl(url) {
  let u = (url || '').trim()
  if (!u) return DEV_DEFAULT_URL
  // Auto-fix common OpenRouter mistakes
  if (u.includes('openrouter.ai') && !u.endsWith('/chat/completions')) {
    return 'https://openrouter.ai/api/v1/chat/completions'
  }
  return u
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('app_user')
    return saved ? JSON.parse(saved) : null
  })

  const [activePage, setActivePage] = useState('todo')

  // ===== User Data Scoping Helpers =====
  const getStorageKey = (baseKey) => user ? `${baseKey}_${user.username}` : baseKey

  // ===== Theme =====
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'dark'
  })

  // Apply theme to document element
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('theme-light')
    } else {
      document.body.classList.remove('theme-light')
    }
  }, [theme])

  // ===== AI Configuration =====
  const [aiConfig, setAiConfig] = useState(() => {
    const saved = localStorage.getItem('app_ai_config')
    const config = saved ? JSON.parse(saved) : {}
    
    // Prioritize localStorage if it's not empty, otherwise fallback to Env
    const localKey = (config.apiKey || '').trim()
    const finalKey = localKey || DEV_DEFAULT_KEY
    
    return {
      baseUrl: getValidUrl(config.baseUrl),
      apiKey: finalKey.trim(),
      model: (config.model || DEV_DEFAULT_MODEL).trim()
    }
  })

  // ===== Registered Users DB =====
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('app_users_db')
    return saved ? JSON.parse(saved) : []
  })

  // ===== Data State =====
  const [tasks, setTasks] = useState([])
  const [activityLog, setActivityLog] = useState({})
  const [shoppingItems, setShoppingItems] = useState({})
  const [receipts, setReceipts] = useState([])
  const [galleryPhotos, setGalleryPhotos] = useState({ camera: [], whatsapp: [], screenshots: [], pinterest: [], instagram: [], facebook: [], other: [] })

  // Reload data when user changes
  useEffect(() => {
    if (!user) return
    const uTasks = localStorage.getItem(getStorageKey('app_tasks'))
    setTasks(uTasks ? JSON.parse(uTasks) : [])

    const uActivity = localStorage.getItem(getStorageKey('app_activity'))
    setActivityLog(uActivity ? JSON.parse(uActivity) : {})

    const uShopping = localStorage.getItem(getStorageKey('app_shopping'))
    setShoppingItems(uShopping ? JSON.parse(uShopping) : {})

    const uReceipts = localStorage.getItem(getStorageKey('app_receipts'))
    setReceipts(uReceipts ? JSON.parse(uReceipts) : [])

    const uGallery = localStorage.getItem(getStorageKey('app_gallery'))
    setGalleryPhotos(uGallery ? JSON.parse(uGallery) : { camera: [], whatsapp: [], screenshots: [], pinterest: [], instagram: [], facebook: [], other: [] })
  }, [user])

  // Persist everything
  useEffect(() => {
    if (user) localStorage.setItem(getStorageKey('app_tasks'), JSON.stringify(tasks))
  }, [tasks, user])

  useEffect(() => {
    if (user) localStorage.setItem(getStorageKey('app_activity'), JSON.stringify(activityLog))
  }, [activityLog, user])

  useEffect(() => {
    if (user) localStorage.setItem(getStorageKey('app_shopping'), JSON.stringify(shoppingItems))
  }, [shoppingItems, user])

  useEffect(() => {
    if (user) localStorage.setItem(getStorageKey('app_gallery'), JSON.stringify(galleryPhotos))
  }, [galleryPhotos, user])

  useEffect(() => {
    if (user) localStorage.setItem(getStorageKey('app_receipts'), JSON.stringify(receipts))
  }, [receipts, user])

  useEffect(() => {
    localStorage.setItem('app_ai_config', JSON.stringify({
      ...aiConfig,
      apiKey: aiConfig.apiKey.trim()
    }))
  }, [aiConfig])

  useEffect(() => {
    localStorage.setItem('app_theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('app_users_db', JSON.stringify(registeredUsers))
  }, [registeredUsers])

  useEffect(() => {
    if (user) localStorage.setItem('app_user', JSON.stringify(user))
    else localStorage.removeItem('app_user')
  }, [user])

  // ===== Auth =====
  const login = (username, password) => {
    // Check registered users
    const foundReg = registeredUsers.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    )
    if (foundReg) {
      setUser(foundReg)
      return true
    }
    return false
  }

  const signup = (displayName, username, password) => {
    // Check if user exists
    if (registeredUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Username already exists.' }
    }
    const newUser = { displayName, username, password }
    setRegisteredUsers(prev => [...prev, newUser])
    setUser(newUser)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    setActivePage('todo')
  }

  // ===== Task Operations =====
  const addTask = (text) => {
    const newTask = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setTasks(prev => [newTask, ...prev])
  }

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const wasCompleted = t.completed
        const updated = { ...t, completed: !wasCompleted, completedAt: !wasCompleted ? new Date().toISOString() : null }
        // Record activity when completing
        if (!wasCompleted) {
          const today = getTodayKey()
          setActivityLog(log => ({
            ...log,
            [today]: (log[today] || 0) + 1
          }))
        } else {
          // Un-completing: decrement
          const completedDay = t.completedAt ? t.completedAt.split('T')[0] : getTodayKey()
          setActivityLog(log => ({
            ...log,
            [completedDay]: Math.max(0, (log[completedDay] || 1) - 1)
          }))
        }
        return updated
      }
      return t
    }))
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  // ===== Shopping Operations =====
  const addShoppingItem = (category, name) => {
    const item = {
      id: crypto.randomUUID(),
      name,
      bought: false,
      addedAt: new Date().toISOString(),
    }
    setShoppingItems(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), item]
    }))
  }

  const toggleShoppingItem = (category, id) => {
    setShoppingItems(prev => ({
      ...prev,
      [category]: prev[category].map(it =>
        it.id === id ? { ...it, bought: !it.bought } : it
      )
    }))
  }

  const deleteShoppingItem = (category, id) => {
    setShoppingItems(prev => ({
      ...prev,
      [category]: prev[category].filter(it => it.id !== id)
    }))
  }

  // ===== Gallery Operations =====
  const addGalleryPhoto = (source, dataUrl) => {
    const photo = {
      id: crypto.randomUUID(),
      src: dataUrl,
      source,
      addedAt: new Date().toISOString(),
    }
    setGalleryPhotos(prev => ({
      ...prev,
      [source]: [photo, ...(prev[source] || [])]
    }))
  }

  const deleteGalleryPhoto = (source, id) => {
    setGalleryPhotos(prev => ({
      ...prev,
      [source]: prev[source].filter(p => p.id !== id)
    }))
  }

  // ===== Weekly Chart Data =====
  const getWeeklyData = () => {
    const today = new Date()
    const data = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const dayName = DAYS_OF_WEEK[d.getDay()]
      data.push({
        day: dayName,
        date: key,
        tasks: activityLog[key] || 0,
        isToday: i === 0,
      })
    }
    return data
  }

  // ===== Receipts Operations =====
  const addReceipt = (newReceipt) => {
    setReceipts(prev => [...prev, newReceipt])
  }
  const deleteReceipt = (id) => {
    setReceipts(prev => prev.filter(r => r.id !== id))
  }

  const ctx = {
    user, login, signup, logout,
    theme, setTheme,
    aiConfig, setAiConfig,
    tasks, addTask, toggleTask, deleteTask,
    shoppingItems, addShoppingItem, toggleShoppingItem, deleteShoppingItem,
    receipts, addReceipt, deleteReceipt,
    galleryPhotos, addGalleryPhoto, deleteGalleryPhoto,
    getWeeklyData, activityLog,
    activePage, setActivePage,
    DAYS_OF_WEEK,
  }

  if (!user) return <AppContext.Provider value={ctx}><LoginPage /></AppContext.Provider>

  return (
    <AppContext.Provider value={ctx}>
      <div className={`app-layout ${theme === 'light' ? 'theme-light' : ''}`}>
        <Sidebar />
        <main className="main-content">
          {activePage === 'todo' && <TodoDashboard />}
          {activePage === 'shopping' && <ShoppingDashboard />}
          {activePage === 'gallery' && <GalleryDashboard />}
          {activePage === 'ai' && <PersonalAIDashboard />}
          {activePage === 'receipts' && <ReceiptsDashboard />}
          {activePage === 'settings' && <SettingsDashboard />}
        </main>
      </div>
    </AppContext.Provider>
  )
}


export function useApp() {
  return useContext(AppContext)
}
