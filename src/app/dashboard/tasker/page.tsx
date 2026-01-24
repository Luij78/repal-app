'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// Custom Calendar Date Picker Component
function DatePickerField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) setCurrentMonth(new Date(value + 'T00:00:00'))
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const prevMonth = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)) }
  const nextMonth = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)) }

  const selectDate = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange(selected.toISOString().split('T')[0])
    setIsOpen(false)
  }

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Select date'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const renderDays = () => {
    const days = []
    const totalDays = daysInMonth(currentMonth)
    const firstDay = firstDayOfMonth(currentMonth)
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="w-10 h-10" />)
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isSelected = value === dateStr
      const isToday = dateStr === todayStr
      days.push(
        <button key={day} type="button" onClick={(e) => { e.stopPropagation(); selectDate(day) }}
          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all flex items-center justify-center ${isSelected ? 'bg-gradient-to-br from-primary-500 to-[#B8960C] text-dark-bg shadow-lg shadow-primary-500/30' : isToday ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50' : 'text-white hover:bg-white/10'}`}
        >{day}</button>
      )
    }
    return days
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-left flex items-center justify-between hover:border-primary-500/50 transition-colors">
        <span className={value ? 'text-white' : 'text-gray-500'}>{formatDisplayDate(value)}</span>
        <span className="text-xl">📅</span>
      </button>
      {isOpen && (
        <div className="absolute z-[100] mt-2 left-0 right-0">
          <div className="p-5 rounded-2xl border border-primary-500/20 shadow-2xl" style={{ background: 'linear-gradient(145deg, rgba(30,30,30,0.98) 0%, rgba(15,15,15,0.99) 100%)', boxShadow: '0 0 60px rgba(212,175,55,0.15), 0 25px 50px rgba(0,0,0,0.5)' }}>
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevMonth} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-lg">‹</button>
              <span className="font-playfair text-white text-lg" style={{ textShadow: '0 0 20px rgba(212,175,55,0.4)' }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
              <button type="button" onClick={nextMonth} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-lg">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">{dayNames.map(day => (<div key={day} className="w-10 h-8 flex items-center justify-center text-xs text-primary-400 font-semibold">{day}</div>))}</div>
            <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(todayStr); setIsOpen(false) }} className="flex-1 py-2.5 text-sm font-semibold bg-primary-500/20 text-primary-400 rounded-xl">Today</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false) }} className="flex-1 py-2.5 text-sm font-semibold bg-white/5 text-gray-400 rounded-xl">Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TaskerPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [formData, setFormData] = useState({ title: '', category: 'general', priority: 'medium', dueDate: '', notes: '' })

  const categories = [
    { id: 'general', name: 'General', icon: '📋' },
    { id: 'lead', name: 'Lead Follow-up', icon: '👤' },
    { id: 'listing', name: 'Listing', icon: '🏠' },
    { id: 'closing', name: 'Closing', icon: '🔑' },
    { id: 'marketing', name: 'Marketing', icon: '📢' },
    { id: 'admin', name: 'Admin', icon: '📁' }
  ]

  const priorityColors: Record<string, string> = { high: '#C97B63', medium: '#D4AF37', low: '#4A9B7F' }

  useEffect(() => {
    const saved = localStorage.getItem('repal_tasks')
    if (saved) setTasks(JSON.parse(saved))
  }, [])

  useEffect(() => { localStorage.setItem('repal_tasks', JSON.stringify(tasks)) }, [tasks])

  const todayStr = new Date().toISOString().split('T')[0]
  const stats = {
    pending: tasks.filter(t => !t.completed).length,
    today: tasks.filter(t => t.dueDate === todayStr && !t.completed).length,
    overdue: tasks.filter(t => t.dueDate < todayStr && !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  }

  const saveTask = () => {
    if (!formData.title) return alert('Please enter a task title')
    setTasks([...tasks, { ...formData, id: Date.now(), completed: false, createdAt: new Date().toISOString() }])
    setFormData({ title: '', category: 'general', priority: 'medium', dueDate: '', notes: '' })
    setShowForm(false)
  }

  const toggleTask = (id: number) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  const deleteTask = (id: number) => { if (confirm('Delete this task?')) setTasks(tasks.filter(t => t.id !== id)) }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed
    if (filter === 'today') return t.dueDate === todayStr && !t.completed
    if (filter === 'overdue') return t.dueDate < todayStr && !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">✅ Task Manager</h1>
          <p className="text-gray-400 text-sm">Stay organized and on track</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ Add Task</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{ label: 'Pending', value: stats.pending, color: '#6B8DD6' }, { label: 'Due Today', value: stats.today, color: '#D4AF37' }, { label: 'Overdue', value: stats.overdue, color: '#E74C3C' }, { label: 'Completed', value: stats.completed, color: '#4A9B7F' }].map(s => (
          <div key={s.label} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
            <span className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</span>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {stats.overdue > 0 && (
        <div className="mb-6 p-4 bg-[#E74C3C]/20 rounded-xl border border-[#E74C3C] text-sm text-[#E74C3C]">
          ⚠️ You have {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''}!
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'today', 'overdue', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${filter === f ? 'bg-primary-500 text-dark-bg' : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16"><span className="text-5xl mb-4 block">✅</span><p className="text-gray-400">No tasks found.</p></div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border hover:border-primary-500/30 transition-all ${task.completed ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4">
                <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-[#4A9B7F] border-[#4A9B7F]' : 'border-gray-500 hover:border-primary-500'}`}>
                  {task.completed && <span className="text-white text-sm">✓</span>}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>{task.title}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: priorityColors[task.priority] }}>{task.priority}</span>
                    <span className="text-sm">{categories.find(c => c.id === task.category)?.icon}</span>
                  </div>
                  {task.dueDate && <p className={`text-xs mt-1 ${task.dueDate < todayStr && !task.completed ? 'text-[#E74C3C]' : 'text-gray-500'}`}>📅 {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>}
                </div>
                <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-[#E74C3C] transition-colors">🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-lg w-full border border-dark-border">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">Add Task</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Task Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
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
              <DatePickerField label="Due Date" value={formData.dueDate} onChange={(v) => setFormData({ ...formData, dueDate: v })} />
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full min-h-[80px] px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500 resize-y" />
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-semibold text-gray-400 border border-dark-border rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={saveTask} className="px-6 py-3 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">Save Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
