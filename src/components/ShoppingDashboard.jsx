import { useState } from 'react'
import { useApp } from '../App'

const CATEGORIES = [
  { id: 'vegetables', label: 'Vegetables', icon: '🥦', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  { id: 'fruits', label: 'Fruits', icon: '🍎', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  { id: 'dairy', label: 'Dairy & Eggs', icon: '🥛', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  { id: 'detergents', label: 'Detergents', icon: '🧼', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  { id: 'snacks', label: 'Snacks', icon: '🍿', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { id: 'meat', label: 'Meat & Fish', icon: '🥩', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  { id: 'bakery', label: 'Bakery', icon: '🍞', color: '#d97706', bg: 'rgba(217,119,6,0.15)' },
  { id: 'beverages', label: 'Beverages', icon: '🧃', color: '#14b8a6', bg: 'rgba(20,184,166,0.15)' },
  { id: 'other', label: 'Other', icon: '🛍️', color: '#8b949e', bg: 'rgba(139,148,158,0.15)' },
]

function CategoryCard({ category, items, onAdd, onToggle, onDelete }) {
  const [inputVal, setInputVal] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    onAdd(category.id, inputVal.trim())
    setInputVal('')
  }

  const bought = items.filter(i => i.bought).length
  const total = items.length

  return (
    <div className="category-card">
      <div className="category-header">
        <div className="category-title">
          <div
            className="category-icon"
            style={{ background: category.bg, border: `1px solid ${category.color}33` }}
          >
            {category.icon}
          </div>
          <span>{category.label}</span>
        </div>
        {total > 0 && (
          <span className="category-count">
            {bought}/{total} bought
          </span>
        )}
      </div>

      <div className="category-body">
        <form className="category-add-form" onSubmit={handleAdd}>
          <input
            id={`shop-input-${category.id}`}
            className="category-input"
            type="text"
            placeholder={`Add ${category.label.toLowerCase()}...`}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
          />
          <button
            id={`shop-add-${category.id}`}
            className="btn-cat-add"
            type="submit"
            style={{ background: category.bg, color: category.color, border: `1px solid ${category.color}44` }}
          >
            ＋
          </button>
        </form>

        <div className="shopping-items">
          {items.length === 0 ? (
            <div className="category-empty">Nothing added yet</div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className={`shopping-item ${item.bought ? 'bought' : ''}`}
              >
                <button
                  className={`shop-checkbox ${item.bought ? 'bought-check' : ''}`}
                  onClick={() => onToggle(category.id, item.id)}
                  aria-label={item.bought ? 'Mark as not bought' : 'Mark as bought'}
                  style={item.bought ? {} : { borderColor: category.color + '88' }}
                />
                <span className="shop-item-name">{item.name}</span>
                <button
                  className="shop-delete"
                  onClick={() => onDelete(category.id, item.id)}
                  aria-label="Remove item"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div style={{
            marginTop: '10px',
            height: '3px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(bought / total) * 100}%`,
              background: `linear-gradient(90deg, ${category.color}, ${category.color}99)`,
              borderRadius: '10px',
              transition: 'width 0.4s ease',
            }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function ShoppingDashboard() {
  const { user, shoppingItems, addShoppingItem, toggleShoppingItem, deleteShoppingItem } = useApp()

  const allItems = Object.values(shoppingItems).flat()
  const totalItems = allItems.length
  const boughtItems = allItems.filter(i => i.bought).length

  return (
    <div className="dashboard-wrapper">
      <div className="welcome-header shopping-header">
        <div className="welcome-greeting">🛒 Shopping Dashboard</div>
        <h1 className="welcome-name">Shopping List</h1>
        <div className="welcome-sub">Organize your groceries and essentials by category</div>
        <div className="welcome-stats">
          <div className="stat-chip">
            📦 <span>{totalItems}</span> total items
          </div>
          <div className="stat-chip">
            ✅ <span>{boughtItems}</span> bought
          </div>
          <div className="stat-chip">
            🛍️ <span>{totalItems - boughtItems}</span> remaining
          </div>
          {totalItems > 0 && (
            <div className="stat-chip">
              📊 <span>{Math.round((boughtItems / totalItems) * 100)}%</span> complete
            </div>
          )}
        </div>
      </div>

      <div className="categories-grid">
        {CATEGORIES.map(cat => (
          <CategoryCard
            key={cat.id}
            category={cat}
            items={shoppingItems[cat.id] || []}
            onAdd={addShoppingItem}
            onToggle={toggleShoppingItem}
            onDelete={deleteShoppingItem}
          />
        ))}
      </div>
    </div>
  )
}
