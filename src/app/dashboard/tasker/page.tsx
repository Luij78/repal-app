'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed'
  category: string | null
  lead_id: string | null
  completed_at: string | null
  created_at: string
}

interface LeadName {
  id: string
  first_name: string
  last_name: string
}

const categories = [
  { value: 'followup', label: '📞 Follow-up', color: '#4A9B7F' },
  { value: 'showing', label: '🏠 Showing', color: '#6B8DD6' },
  { value: 'paperwork', label: '📄 Paperwork', color: '#9B59B6' },
  { value: 'marketing', label: '📢 Marketing', color: '#E67E22' },
  { value: 'closing', label: '🔑 Closing', color: '#D4AF37' },
  { value: 'general', label: '📌 General', color: '#666' }
]

export default function TaskerPage() {
  const { user } = useUser()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [leadNames, setLeadNames] = useState<Record<string, LeadName>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState('active')
  const [filterCategory, setFilterCategory] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium' as Task['priority'],
    category: 'general'
  })

  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (user) fetchTasks()
  }, [user])

  const fetchTasks = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      setTasks(data || [])
      
      // Fetch lead names for tasks linked to leads
      const leadIds = Array.from(new Set((data || []).filter(t => t.lead_id).map(t => t.lead_id!)))
      if (leadIds.length > 0) {
        const { data: leadsData } = await supabase
          .from('leads')
          .select('id, first_name, last_name')
          .in('id', leadIds)
        
        if (leadsData) {
          const namesMap: Record<string, LeadName> = {}
          leadsData.forEach((l: LeadName) => { namesMap[l.id] = l })
          setLeadNames(namesMap)
        }
      }
    }
    setLoading(false)
  }

  const getCategoryInfo = (cat: string | null) => categories.find(c => c.value === cat) || categories[categories.length - 1]

  const getPriorityColor = (p: string) => {
    if (p === 'high') return '#C97B63'
    if (p === 'medium') return '#D4AF37'
    return '#666'
  }

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && task.status === 'pending') ||
      (filterStatus === 'completed' && task.status === 'completed')
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory
    return matchesStatus && matchesCategory
  }).sort((a, b) => {
    if (a.status !== b.status) return a.status === 'completed' ? 1 : -1
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return (a.due_date || '9999').localeCompare(b.due_date || '9999')
  })

  const overdueCount = tasks.filter(t => t.status === 'pending' && t.due_date && t.due_date < today).length
  const todayCount = tasks.filter(t => t.status === 'pending' && t.due_date === today).length
  const activeCount = tasks.filter(t => t.status === 'pending').length

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      due_date: new Date().toISOString().split('T')[0],
      priority: 'medium',
      category: 'general'
    })
    setShowForm(false)
    setEditingTask(null)
  }

  const openEditForm = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title || '',
      description: task.description || '',
      due_date: task.due_date || new Date().toISOString().split('T')[0],
      priority: task.priority,
      category: task.category || 'general'
    })
    setShowForm(true)
  }

  const saveTask = async () => {
    if (!user || !formData.title.trim()) return

    const taskData = {
      user_id: user.id,
      title: formData.title,
      description: formData.description || null,
      due_date: formData.due_date || null,
      priority: formData.priority,
      category: formData.category,
      status: 'pending' as const
    }

    if (editingTask) {
      const { error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', editingTask.id)

      if (error) {
        console.error('Error updating task:', error)
      } else {
        setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t))
        resetForm()
      }
    } else {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single()

      if (error) {
        console.error('Error adding task:', error)
      } else if (data) {
        setTasks([data, ...tasks])
        resetForm()
      }
    }
  }

  const toggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, completed_at: completedAt })
      .eq('id', task.id)

    if (error) {
      console.error('Error updating task:', error)
    } else {
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus, completed_at: completedAt } : t
      ))
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error)
    } else {
      setTasks(tasks.filter(t => t.id !== taskId))
    }
  }

  const getDueDateColor = (dueDate: string | null) => {
    if (!dueDate) return 'text-gray-500'
    if (dueDate < today) return 'text-red-400'
    if (dueDate === today) return 'text-yellow-400'
    return 'text-gray-400'
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No due date'
    const date = new Date(dateStr + 'T00:00:00')
    if (dateStr === today) return 'Today'
    if (dateStr < today) {
      const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      return `${days}d overdue`
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">✓ Tasker</h1>
          <p className="text-gray-400">Track your to-dos and follow-ups</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{activeCount}</p>
          <p className="text-gray-400 text-sm">Active Tasks</p>
        </div>
        <div className="card text-center border-red-500/30">
          <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
          <p className="text-gray-400 text-sm">Overdue</p>
        </div>
        <div className="card text-center border-yellow-500/30">
          <p className="text-2xl font-bold text-yellow-400">{todayCount}</p>
          <p className="text-gray-400 text-sm">Due Today</p>
        </div>
        <div className="card text-center border-green-500/30">
          <p className="text-2xl font-bold text-green-400">{tasks.filter(t => t.status === 'completed').length}</p>
          <p className="text-gray-400 text-sm">Completed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field"
        >
          <option value="all">All Tasks</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-field"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <h3 className="text-red-400 font-semibold mb-2">🚨 {overdueCount} Overdue Task{overdueCount > 1 ? 's' : ''}</h3>
          <p className="text-gray-400 text-sm">These need your attention!</p>
        </div>
      )}

      {/* Tasks List */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">✓</span>
          <p className="text-gray-400 mb-4">
            {filterStatus !== 'all' || filterCategory !== 'all' ? 'No tasks match your filters' : 'No tasks yet'}
          </p>
          {filterStatus === 'all' && filterCategory === 'all' && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Add Your First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const catInfo = getCategoryInfo(task.category)
            const isCompleted = task.status === 'completed'
            const isOverdue = !isCompleted && task.due_date && task.due_date < today
            
            return (
              <div
                key={task.id}
                className={`card flex items-start gap-4 transition-all ${isCompleted ? 'opacity-60' : ''} ${isOverdue ? 'border-red-500/50' : ''}`}
              >
                <button
                  onClick={() => toggleComplete(task)}
                  className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-colors ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-500 hover:border-primary-500'
                  }`}
                >
                  {isCompleted && '✓'}
                </button>
                
                <div 
                  className={`flex-1 min-w-0 ${task.lead_id ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (task.lead_id) {
                      router.push(`/dashboard/leads?lead=${task.lead_id}`)
                    }
                  }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-white'} ${task.lead_id ? 'hover:text-primary-400 transition-colors' : ''}`}>
                      {task.title}
                    </h3>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${catInfo.color}20`, color: catInfo.color }}
                    >
                      {catInfo.label}
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${getPriorityColor(task.priority)}20`, color: getPriorityColor(task.priority) }}
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                  {task.lead_id && leadNames[task.lead_id] && (
                    <p className="text-primary-400 text-sm mt-1 flex items-center gap-1">
                      <span>👤</span> {leadNames[task.lead_id].first_name} {leadNames[task.lead_id].last_name}
                      <span className="text-gray-600 text-xs ml-1">→ tap to open lead</span>
                    </p>
                  )}
                  {task.description && (
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{task.description}</p>
                  )}
                  <p className={`text-sm mt-1 ${getDueDateColor(task.due_date)}`}>
                    📅 {formatDate(task.due_date)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditForm(task)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingTask ? 'Edit Task' : 'Add Task'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field w-full"
                  placeholder="Follow up with client..."
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Add details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                    className="input-field w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field w-full"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-dark-border flex gap-3">
              <button onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
              <button 
                onClick={saveTask} 
                className="btn-primary flex-1"
                disabled={!formData.title.trim()}
              >
                {editingTask ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
