'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const sampleTasks = [
  // Overdue tasks
  { id: 1, title: 'Follow up with Susan Clark', description: 'Zillow lead from 4 months ago - try re-engaging with new listings', dueDate: '2026-01-18', priority: 'high', category: 'followup', completed: false, createdAt: '2026-01-10' },
  { id: 2, title: 'Send CMA to Emily Davis', description: 'She requested market analysis for her Lake Mary townhome', dueDate: '2026-01-20', priority: 'medium', category: 'paperwork', completed: false, createdAt: '2026-01-15' },
  // Due today
  { id: 3, title: 'Confirm showing with Marcus Johnson', description: 'Call to confirm 2pm showing appointment', dueDate: '2026-01-24', priority: 'high', category: 'showing', completed: false, createdAt: '2026-01-20' },
  { id: 4, title: 'Prepare listing presentation', description: 'Sarah Chen meeting - finalize CMA and marketing plan', dueDate: '2026-01-24', priority: 'high', category: 'paperwork', completed: false, createdAt: '2026-01-19' },
  { id: 5, title: 'Call Raymond Green', description: '1031 exchange - need to discuss property options urgently', dueDate: '2026-01-24', priority: 'high', category: 'followup', completed: false, createdAt: '2026-01-21' },
  // Upcoming tasks
  { id: 6, title: 'Schedule VA loan consultation', description: 'Connect Frank & Helen King with VA lender', dueDate: '2026-01-26', priority: 'high', category: 'followup', completed: false, createdAt: '2026-01-20' },
  { id: 7, title: 'Send investor newsletter', description: 'Monthly market update for investor leads', dueDate: '2026-01-25', priority: 'medium', category: 'marketing', completed: false, createdAt: '2026-01-15' },
  { id: 8, title: 'Order closing gift', description: 'Williams family closing on Jan 30 - order gift basket', dueDate: '2026-01-27', priority: 'low', category: 'closing', completed: false, createdAt: '2026-01-18' },
  { id: 9, title: 'Follow up with FSBO Carol Scott', description: 'She was ready to sign listing agreement - confirm appointment', dueDate: '2026-01-24', priority: 'high', category: 'followup', completed: false, createdAt: '2026-01-19' },
  { id: 10, title: 'Research 55+ communities', description: 'Compile list for Robert & Linda Williams - Solivita, Del Webb, etc.', dueDate: '2026-01-26', priority: 'medium', category: 'general', completed: false, createdAt: '2026-01-20' },
  { id: 11, title: 'Update MLS listings', description: 'Add new photos to active listings', dueDate: '2026-01-28', priority: 'medium', category: 'paperwork', completed: false, createdAt: '2026-01-22' },
  { id: 12, title: 'Call Elizabeth Turner', description: 'Travel nurse - confirm pre-approval with Navy Federal', dueDate: '2026-01-25', priority: 'high', category: 'followup', completed: false, createdAt: '2026-01-20' },
  // Completed tasks
  { id: 13, title: 'Set up MLS search for Jennifer Thompson', description: 'Oviedo/Winter Springs, 4BR, good schools, under $320K', dueDate: '2026-01-19', priority: 'high', category: 'general', completed: true, completedAt: '2026-01-19', createdAt: '2026-01-17' },
  { id: 14, title: 'Send pre-approval referral to Kevin Brown', description: 'Connected with mortgage lender', dueDate: '2026-01-20', priority: 'medium', category: 'followup', completed: true, completedAt: '2026-01-20', createdAt: '2026-01-18' },
  { id: 15, title: 'Call institutional investor Raymond Green', description: 'Initial consultation about multi-family properties', dueDate: '2026-01-21', priority: 'high', category: 'followup', completed: true, completedAt: '2026-01-21', createdAt: '2026-01-20' }
]

const categories = [
  { value: 'followup', label: '📞 Follow-up', color: '#4A9B7F' },
  { value: 'showing', label: '🏠 Showing', color: '#6B8DD6' },
  { value: 'paperwork', label: '📄 Paperwork', color: '#9B59B6' },
  { value: 'marketing', label: '📢 Marketing', color: '#E67E22' },
  { value: 'closing', label: '🔑 Closing', color: '#D4AF37' },
  { value: 'general', label: '📌 General', color: '#666' }
]

export default function TaskerPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('active')
  const [filterCategory, setFilterCategory] = useState('all')
  const [formData, setFormData] = useState({
    title: '', description: '', dueDate: new Date().toISOString().split('T')[0], priority: 'medium', category: 'general'
  })

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const saved = localStorage.getItem('repal_tasks')
    if (saved) {
      const parsed = JSON.parse(saved)
      setTasks(parsed.length > 0 ? parsed : sampleTasks)
    } else {
      setTasks(sampleTasks)
    }
  }, [])

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('repal_tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  const getCategoryInfo = (cat: string) => categories.find(c => c.value === cat) || categories[categories.length - 1]

  const getPriorityColor = (p: string) => {
    if (p === 'high') return '#C97B63'
    if (p === 'medium') return '#D4AF37'
    return '#666'
  }

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && !task.completed) ||
      (filterStatus === 'completed' && task.completed)
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory
    return matchesStatus && matchesCategory
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    if (priorityOrder[a.priority as keyof typeof priorityOrder] !== priorityOrder[b.priority as keyof typeof priorityOrder]) {
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
    }
    return a.dueDate.localeCompare(b.dueDate)
  })

  const overdueCount = tasks.filter(t => !t.completed && t.dueDate < today).length
  const todayCount = tasks.filter(t => !t.completed && t.dueDate === today).length

  const resetForm = () => {
    setFormData({ title: '', description: '', dueDate: new Date().toISOString().split('T')[0], priority: 'medium', category: 'general' })
    setShowForm(false)
    setEditingTask(null)
  }

  const openEditForm = (task: any) => {
    setEditingTask(task)
    setFormData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      priority: task.priority || 'medium',
      category: task.category || 'general'
    })
    setShowForm(true)
  }

  const saveTask = () => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData } : t))
    } else {
      setTasks([...tasks, { ...formData, id: Date.now(), completed: false, createdAt: new Date().toISOString().split('T')[0] }])
    }
    resetForm()
  }

  const toggleComplete = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString().split('T')[0] : null } : t))
  }

  const deleteTask = (id: number) => {
    if (confirm('Delete this task?')) setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#fff', padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard" style={{ color: '#D4AF37', fontSize: '1.5rem' }}>←</Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>✅ Tasker</h1>
            {overdueCount > 0 && <span style={{ backgroundColor: '#C97B63', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>{overdueCount} overdue</span>}
            {todayCount > 0 && <span style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>{todayCount} today</span>}
          </div>
          <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}>+ Add Task</button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff' }}>
            <option value="active">Active Tasks</option>
            <option value="completed">Completed</option>
            <option value="all">All Tasks</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff' }}>
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filteredTasks.map(task => {
            const catInfo = getCategoryInfo(task.category)
            const isOverdue = !task.completed && task.dueDate < today
            const isToday = task.dueDate === today
            
            return (
              <div key={task.id} onClick={() => openEditForm(task)} className="group" style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${isOverdue ? '#C97B63' : isToday ? '#D4AF37' : '#333'}`, display: 'flex', alignItems: 'center', gap: '1rem', opacity: task.completed ? 0.6 : 1, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={(e) => { e.currentTarget.style.borderColor = isOverdue ? '#C97B63' : isToday ? '#D4AF37' : '#333'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <input type="checkbox" checked={task.completed} onChange={(e) => { e.stopPropagation(); toggleComplete(task.id) }} onClick={(e) => e.stopPropagation()} style={{ width: '1.5rem', height: '1.5rem', accentColor: '#D4AF37', cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '600', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</span>
                    <span style={{ backgroundColor: getPriorityColor(task.priority), padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', textTransform: 'uppercase' }}>{task.priority}</span>
                    <span style={{ backgroundColor: catInfo.color, padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem' }}>{catInfo.label.split(' ')[0]}</span>
                    {isOverdue && <span style={{ backgroundColor: '#C97B63', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem' }}>OVERDUE</span>}
                    {isToday && !task.completed && <span style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem' }}>TODAY</span>}
                  </div>
                  {task.description && <div style={{ fontSize: '0.875rem', color: '#999', marginTop: '0.25rem' }}>{task.description}</div>}
                  <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }} className="delete-btn" style={{ backgroundColor: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.25rem', padding: '0.5rem', opacity: 0, transition: 'opacity 0.2s' }}>🗑️</button>
              </div>
            )
          })}
        </div>

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
            <div style={{ backgroundColor: '#2a2a2a', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{editingTask ? '✏️ Edit Task' : '➕ Add New Task'}</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input type="text" placeholder="Task Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                <textarea placeholder="Description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', resize: 'vertical' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={resetForm} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveTask} disabled={!formData.title} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#D4AF37', color: '#000', cursor: 'pointer', fontWeight: '600', opacity: formData.title ? 1 : 0.5 }}>{editingTask ? 'Save Changes' : 'Add Task'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .group:hover .delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
