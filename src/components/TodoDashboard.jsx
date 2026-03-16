import { useState } from 'react'
import { useApp } from '../App'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <div className="label">{label}</div>
        <div className="value">{payload[0].value} task{payload[0].value !== 1 ? 's' : ''}</div>
      </div>
    )
  }
  return null
}

export default function TodoDashboard() {
  const { user, tasks, addTask, toggleTask, deleteTask, getWeeklyData, activityLog } = useApp()
  const [inputVal, setInputVal] = useState('')

  const weekData = getWeeklyData()

  const handleAdd = (e) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    addTask(inputVal.trim())
    setInputVal('')
  }

  // ==== Review Stats ====
  // Most active day (last 7 days)
  const sortedDays = [...weekData].sort((a, b) => b.tasks - a.tasks)
  const mostActiveDay = sortedDays[0]
  const leastActiveDay = sortedDays[sortedDays.length - 1]

  // Most completed task text (just count tasks with same text)
  const taskTextCount = {}
  tasks.filter(t => t.completed).forEach(t => {
    taskTextCount[t.text] = (taskTextCount[t.text] || 0) + 1
  })
  const topTaskEntry = Object.entries(taskTextCount).sort((a, b) => b[1] - a[1])[0]

  const totalCompleted = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0

  // Greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening'

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const todayTasks = activityLog[new Date().toISOString().split('T')[0]] || 0
  const pendingTasks = tasks.filter(t => !t.completed).length

  return (
    <div className="dashboard-wrapper">
      {/* Welcome Header */}
      <div className="welcome-header">
        <div className="welcome-greeting">{greeting}</div>
        <h1 className="welcome-name">Welcome back, {user?.displayName?.split(' ')[0]}! 🎯</h1>
        <div className="welcome-sub">{todayStr} · Stay focused and keep going</div>
        <div className="welcome-stats">
          <div className="stat-chip">
            ✅ <span>{totalCompleted}</span> completed
          </div>
          <div className="stat-chip">
            ⏳ <span>{pendingTasks}</span> pending
          </div>
          <div className="stat-chip">
            🔥 <span>{todayTasks}</span> done today
          </div>
          <div className="stat-chip">
            📊 <span>{completionRate}%</span> rate
          </div>
        </div>
      </div>

      <div className="dashboard-grid todo-grid">
        {/* Task Input + List */}
        <div className="card" style={{ gridColumn: '1', gridRow: '1' }}>
          <div className="card-title">📝 My Tasks</div>
          <div className="card-desc">Add tasks and check them off when done</div>

          <form id="add-task-form" className="add-task-form" onSubmit={handleAdd}>
            <input
              id="task-input"
              className="add-task-input"
              type="text"
              placeholder="What do you need to do?"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
            />
            <button id="add-task-btn" className="btn-add" type="submit">
              ＋ Add
            </button>
          </form>

          <div className="task-list" id="task-list">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">No tasks yet. Add one above!</div>
              </div>
            ) : (
              tasks.map(task => (
                <div
                  key={task.id}
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                >
                  <button
                    className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  />
                  <span className="task-text">{task.text}</span>
                  <span className="task-time">
                    {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    className="task-delete"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Delete task"
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Review */}
        <div className="card" style={{ gridColumn: '2', gridRow: '1' }}>
          <div className="card-title">📈 Weekly Review</div>
          <div className="card-desc">Your activity breakdown for this week</div>

          <div className="review-grid">
            <div className="review-card">
              <div className="review-label">🏆 Most Active Day</div>
              <div className="review-value">
                {mostActiveDay?.tasks > 0 ? mostActiveDay?.day : '—'}
              </div>
              <div className="review-sub">
                {mostActiveDay?.tasks > 0 ? `${mostActiveDay.tasks} task${mostActiveDay.tasks !== 1 ? 's' : ''} done` : 'No activity yet'}
              </div>
              {mostActiveDay?.tasks > 0 && <div className="review-badge badge-green">🔥 Best day</div>}
            </div>

            <div className="review-card">
              <div className="review-label">😴 Least Active Day</div>
              <div className="review-value">
                {weekData.some(d => d.tasks > 0) ? leastActiveDay?.day : '—'}
              </div>
              <div className="review-sub">
                {weekData.some(d => d.tasks > 0)
                  ? `${leastActiveDay.tasks} task${leastActiveDay.tasks !== 1 ? 's' : ''} done`
                  : 'No data yet'}
              </div>
              {weekData.some(d => d.tasks > 0) && <div className="review-badge badge-orange">💤 Quiet day</div>}
            </div>

            <div className="review-card">
              <div className="review-label">⭐ Top Task</div>
              <div className="review-value" style={{ fontSize: '14px', lineHeight: 1.3 }}>
                {topTaskEntry ? topTaskEntry[0] : '—'}
              </div>
              <div className="review-sub">
                {topTaskEntry ? `Completed ${topTaskEntry[1]}×` : 'No completed tasks yet'}
              </div>
              {topTaskEntry && <div className="review-badge badge-purple">✨ Most done</div>}
            </div>
          </div>

          {/* Quick stats */}
          <div style={{
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}>
            <div style={{
              padding: '12px',
              background: 'rgba(168,85,247,0.08)',
              border: '1px solid rgba(168,85,247,0.2)',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-purple)' }}>
                {totalCompleted}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Completed</div>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-blue)' }}>
                {completionRate}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Bar Chart - full width */}
        <div className="card chart-card">
          <div className="card-title">📊 Activity This Week</div>
          <div className="card-desc">Tasks completed per day over the last 7 days</div>

          {weekData.every(d => d.tasks === 0) ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-text">Complete some tasks to see your activity graph!</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={weekData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="tasks" radius={[8, 8, 0, 0]}>
                  {weekData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.isToday
                          ? 'url(#todayGrad)'
                          : entry.tasks === Math.max(...weekData.map(d => d.tasks)) && entry.tasks > 0
                            ? 'url(#topGrad)'
                            : 'rgba(168,85,247,0.4)'
                      }
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}

          <div style={{
            display: 'flex', gap: '16px', marginTop: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(#a855f7, #3b82f6)' }} />
              Today
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(#14b8a6, #3b82f6)' }} />
              Best day
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(168,85,247,0.4)' }} />
              Other days
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
