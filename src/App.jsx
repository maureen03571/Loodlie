import { useState, useEffect, createContext, useContext } from 'react'
import LoginPage from './components/LoginPage'
import Sidebar from './components/Sidebar'
import TodoDashboard from './components/TodoDashboard'
import ShoppingDashboard from './components/ShoppingDashboard'
import GalleryDashboard from './components/GalleryDashboard'

// ===== App Context =====
export const AppContext = createContext(null)

const DEMO_USERS = [
  { username: 'alex', password: 'password123', displayName: 'Alex Johnson' },
  { username: 'sam', password: 'hello123', displayName: 'Sam Williams' },
  { username: 'demo', password: 'demo', displayName: 'Demo User' },
]

export const APP_NAME = 'Loodlie'

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

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('app_user')
    return saved ? JSON.parse(saved) : null
  })

  const [activePage, setActivePage] = useState('todo')

  // ===== Tasks State =====
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('app_tasks')
    return saved ? JSON.parse(saved) : []
  })

  // ===== Activity log: { date: 'YYYY-MM-DD', count: N } =====
  const [activityLog, setActivityLog] = useState(() => {
    const saved = localStorage.getItem('app_activity')
    return saved ? JSON.parse(saved) : {}
  })

  // ===== Shopping State =====
  const [shoppingItems, setShoppingItems] = useState(() => {
    const saved = localStorage.getItem('app_shopping')
    return saved ? JSON.parse(saved) : {}
  })

  // ===== Gallery photos state (per source) =====
  const [galleryPhotos, setGalleryPhotos] = useState(() => {
    const saved = localStorage.getItem('app_gallery')
    return saved ? JSON.parse(saved) : { camera: [], whatsapp: [], screenshots: [], pinterest: [], instagram: [], facebook: [], other: [] }
  })

  // Persist everything
  useEffect(() => {
    localStorage.setItem('app_tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('app_activity', JSON.stringify(activityLog))
  }, [activityLog])

  useEffect(() => {
    localStorage.setItem('app_shopping', JSON.stringify(shoppingItems))
  }, [shoppingItems])

  useEffect(() => {
    localStorage.setItem('app_gallery', JSON.stringify(galleryPhotos))
  }, [galleryPhotos])

  useEffect(() => {
    if (user) localStorage.setItem('app_user', JSON.stringify(user))
    else localStorage.removeItem('app_user')
  }, [user])

  // ===== Auth =====
  const login = (username, password) => {
    const found = DEMO_USERS.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    )
    if (found) {
      setUser(found)
      return true
    }
    return false
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

  const ctx = {
    user, login, logout,
    tasks, addTask, toggleTask, deleteTask,
    shoppingItems, addShoppingItem, toggleShoppingItem, deleteShoppingItem,
    galleryPhotos, addGalleryPhoto, deleteGalleryPhoto,
    getWeeklyData, activityLog,
    activePage, setActivePage,
    DAYS_OF_WEEK,
  }

  if (!user) return <AppContext.Provider value={ctx}><LoginPage /></AppContext.Provider>

  return (
    <AppContext.Provider value={ctx}>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          {activePage === 'todo' && <TodoDashboard />}
          {activePage === 'shopping' && <ShoppingDashboard />}
          {activePage === 'gallery' && <GalleryDashboard />}
        </main>
      </div>
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
