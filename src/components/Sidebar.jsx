import { useApp } from '../App'

const NAV_ITEMS = [
  { id: 'todo', label: 'Task Dashboard', icon: '✅', desc: 'To-do & activity' },
  { id: 'shopping', label: 'Shopping List', icon: '🛒', desc: 'Groceries & more' },
  { id: 'gallery', label: 'Gallery', icon: '🖼️', desc: 'Photos & albums' },
]

export default function Sidebar() {
  const { user, activePage, setActivePage, logout, tasks, shoppingItems, galleryPhotos } = useApp()

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.completed).length

  const totalShop = Object.values(shoppingItems).flat().length
  const boughtShop = Object.values(shoppingItems).flat().filter(i => i.bought).length
  const totalPhotos = galleryPhotos ? Object.values(galleryPhotos).flat().length : 0

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <span className="monkey-icon-sm">🐒</span>
        </div>
        <span className="sidebar-brand-name">Loodlie</span>
      </div>

      {/* User info */}
      <div style={{
        margin: '0 0 20px',
        padding: '14px',
        background: 'var(--glass)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '700', color: 'white', flexShrink: 0
          }}>
            {user?.displayName?.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {user?.displayName}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              @{user?.username}
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar-section-label">Navigation</div>

      {NAV_ITEMS.map(item => (
        <div
          key={item.id}
          id={`nav-${item.id}`}
          className={`sidebar-nav-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => setActivePage(item.id)}
          role="button"
        >
          <span style={{ fontSize: '18px' }}>{item.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px' }}>{item.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
              {item.id === 'todo'
                ? `${doneTasks}/${totalTasks} done`
                : item.id === 'shopping'
                  ? `${boughtShop}/${totalShop} bought`
                  : `${totalPhotos} photo${totalPhotos !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
      ))}

      <div className="sidebar-logout">
        <button id="logout-btn" className="logout-btn" onClick={logout}>
          <span style={{ fontSize: '16px' }}>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
