'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function TaskerPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [formData, setFormData] = useState({ title: '', dueDate: '', priority: 'medium', category: 'general', notes: '' })

  useEffect(() => {
    const saved = localStorage.getItem('repal_tasks')
    if (saved) setTasks(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('repal_tasks', JSON.stringify(tasks))
  }, [tasks])

  const priorityColors: Record<string, string> = { high: '#C97B63', medium: '#D4AF37', low: '#4A9B7F' }
  const categoryIcons: Record<string, string> = { general: '📋', lead: '👥', listing: '🏠', closing: '📝', marketing: '📢', admin: '⚙️' }

  const today = new Date().toISOString().split('T')[0]

  const saveTask = () => {
    if (!formData.title) return alert('Please enter a task title')
    setTasks([...tasks, { ...formData, id: Date.now(), completed: false, createdAt: new Date().toISOString() }])
    setFormData({ title: '', dueDate: '', priority: 'medium', category: 'general', notes: '' })
    setShowForm(false)
  }

  const toggleComplete = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id: number) => {
    if (confirm('Delete this task?')) setTasks(tasks.filter(t => t.id !== id))
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    if (filter === 'overdue') return !task.completed && task.dueDate && task.dueDate < today
    if (filter === 'today') return task.dueDate === today
    return true
  })

  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today)
  const dueTodayTasks = tasks.filter(t => !t.completed && t.dueDate === today)
  const pendingTasks = tasks.filter(t => !t.completed)

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">✓ Tasker</h1>
          <p className="text-gray-400 text-sm">Manage your daily tasks and to-dos</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ Add Task</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-[#27AE60]">{pendingTasks.length}</span>
          <p className="text-xs text-gray-400 mt-1">Pending</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-[#F39C12]">{dueTodayTasks.length}</span>
          <p className="text-xs text-gray-400 mt-1">Due Today</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-[#E74C3C]">{overdueTasks.length}</span>
          <p className="text-xs text-gray-400 mt-1">Overdue</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-gray-400">{tasks.filter(t => t.completed).length}</span>
          <p className="text-xs text-gray-400 mt-1">Completed</p>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueTasks.length > 0 && (
        <div className="mb-6 p-4 bg-[#E74C3C]/10 rounded-xl border border-[#E74C3C]/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚠️</span>
            <h3 className="text-[#E74C3C] font-semibold">{overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}</h3>
          </div>
          <div className="space-y-1">
            {overdueTasks.slice(0, 3).map(task => (
              <p key={task.id} className="text-sm text-gray-400">• {task.title}</p>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'today', 'overdue', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${filter === f ? 'bg-primary-500 text-dark-bg' : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'}`}>
            {f === 'overdue' ? `Overdue (${overdueTasks.length})` : f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">✓</span>
            <p className="text-gray-400">{filter === 'completed' ? 'No completed tasks yet' : 'No tasks. Add your first!'}</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isOverdue = !task.completed && task.dueDate && task.dueDate < today
            const isDueToday = task.dueDate === today
            
            return (
              <div key={task.id} className={`flex items-start gap-4 bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border transition-all ${task.completed ? 'opacity-60 border-dark-border' : isOverdue ? 'border-[#E74C3C]/50' : 'border-dark-border hover:border-primary-500/30'}`}>
                {/* Checkbox */}
                <button onClick={() => toggleComplete(task.id)} className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${task.completed ? 'bg-[#27AE60] border-[#27AE60] text-white' : 'border-gray-600 hover:border-primary-500'}`}>
                  {task.completed && '✓'}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-lg">{categoryIcons[task.category] || '📋'}</span>
                    <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: priorityColors[task.priority] }}>{task.priority}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    {task.dueDate && (
                      <span className={isOverdue ? 'text-[#E74C3C]' : isDueToday ? 'text-[#F39C12]' : ''}>
                        📅 {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {isOverdue && ' (Overdue)'}
                        {isDueToday && ' (Today)'}
                      </span>
                    )}
                    <span className="capitalize">{task.category}</span>
                  </div>
                  {task.notes && <p className="text-sm text-gray-500 mt-2">{task.notes}</p>}
                </div>

                {/* Delete */}
                <button onClick={() => deleteTask(task.id)} className="text-xl text-gray-600 hover:text-[#E74C3C] transition-colors">🗑️</button>
              </div>
            )
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-lg w-full border border-dark-border">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">Add New Task</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Task Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="What needs to be done?" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                  <option value="general">📋 General</option>
                  <option value="lead">👥 Lead Follow-up</option>
                  <option value="listing">🏠 Listing</option>
                  <option value="closing">📝 Closing</option>
                  <option value="marketing">📢 Marketing</option>
                  <option value="admin">⚙️ Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional details..." className="w-full min-h-[80px] px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500 resize-y" />
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-semibold text-gray-400 border border-dark-border rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={saveTask} className="px-6 py-3 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
