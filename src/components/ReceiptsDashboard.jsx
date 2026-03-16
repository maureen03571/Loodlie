import { useState } from 'react'
import { useApp } from '../App'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function ReceiptsDashboard() {
  const { receipts, addReceipt, deleteReceipt } = useApp()
  const [itemName, setItemName] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('$')
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0])

  const handleAdd = (e) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount);
    if (!itemName.trim() || !amount.trim() || isNaN(parsedAmount)) return
    
    const newReceipt = {
      id: Date.now(),
      name: itemName.trim(),
      amount: parsedAmount,
      date: dateStr,
      currency: currency
    }

    addReceipt(newReceipt)
    setItemName('')
    setAmount('')
  }

  // Calculate monthly totals per currency
  const monthlyTotals = receipts.reduce((acc, receipt) => {
    const d = new Date(receipt.date)
    const monthYear = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
    const curr = receipt.currency || '$'
    
    if (!acc[monthYear]) {
      acc[monthYear] = {}
    }
    acc[monthYear][curr] = (acc[monthYear][curr] || 0) + receipt.amount
    return acc
  }, {})

  // Sort months descending
  const sortedMonths = Object.keys(monthlyTotals).sort((a,b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <div className="dashboard-wrapper">
      <div className="welcome-header">
        <div className="welcome-greeting">🧾 Receipts</div>
        <h1 className="welcome-name">My Shopping Receipts</h1>
        <div className="welcome-sub">Track your expenses and view monthly totals</div>
      </div>

      <div className="receipts-layout">
        <div className="receipts-main">
          <div className="card">
            <h2 className="card-title">Add New Receipt</h2>
            <form className="receipts-form" onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Item</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Groceries" 
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: '0 0 80px' }}>
                  <label className="form-label">Currency</label>
                  <select 
                    className="form-input" 
                    value={currency} 
                    onChange={e => setCurrency(e.target.value)}
                    style={{ padding: '13px 8px' }}
                  >
                    <option value="$">$ USD</option>
                    <option value="€">€ EUR</option>
                    <option value="£">£ GBP</option>
                    <option value="¥">¥ JPY</option>
                    <option value="KSh">KSh KES</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Amount</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="form-input" 
                    placeholder={`e.g. 45.50`} 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={!itemName.trim() || !amount.trim() || isNaN(amount)}>
                + Add Receipt
              </button>
            </form>
          </div>

          <div className="card" style={{ marginTop: '24px' }}>
            <h2 className="card-title" style={{ marginBottom: '16px' }}>Recent Receipts</h2>
            <div className="receipt-paper">
              <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px dashed var(--border)', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '18px', letterSpacing: '1px' }}>--- MY RECEIPT ---</h3>
              </div>
              
              <div className="receipts-list" style={{ padding: '0 8px' }}>
                {receipts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-text">No items found.</div>
                  </div>
                ) : (
                  receipts.slice().reverse().map(receipt => (
                    <div key={receipt.id} className="receipt-item" style={{ background: 'transparent', borderBottom: '1px dashed var(--border)', borderRadius: 0, padding: '12px 0' }}>
                      <div className="receipt-info">
                        <div className="receipt-name" style={{ fontSize: '14px' }}>{receipt.name}</div>
                        <div className="receipt-date">{new Date(receipt.date).toLocaleDateString()}</div>
                      </div>
                      <div className="receipt-amount" style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{receipt.currency || '$'}{receipt.amount.toFixed(2)}</div>
                      <button className="receipt-delete" onClick={() => deleteReceipt(receipt.id)}>✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="receipts-sidebar">
          <div className="card highlight-card">
            <h2 className="card-title">Monthly Spending</h2>
            <div className="monthly-totals">
              {sortedMonths.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-text">No data to display.</div>
                </div>
              ) : (
                sortedMonths.map(month => (
                  <div key={month} className="month-stat" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="month-name" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{month}</div>
                    {Object.entries(monthlyTotals[month]).map(([curr, total]) => (
                      <div key={curr} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <span>{curr === '$' ? 'USD' : curr === '€' ? 'EUR' : curr === '£' ? 'GBP' : curr === '¥' ? 'JPY' : 'KES'}</span>
                        <span style={{ fontWeight: '600' }}>{curr}{total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
