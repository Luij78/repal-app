'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: string
  type: string
  source: string
  last_contact: string
  notes: string
  created_at: string
}

interface Task {
  id: string
  title: string
  due_date: string
  priority: string
  status: string
  related_to: string
}

interface Alert {
  id: string
  type: 'urgent' | 'warning' | 'opportunity' | 'milestone' | 'reminder'
  icon: string
  title: string
  description: string
  action: string
  link: string
  leadId?: string
  priority: number
}

export default function AlertsPage() {
  const { user } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = () => {
    if (!user) return
    setLoading(true)
    const savedLeads = localStorage.getItem(`leads_${user.id}`)
    if (savedLeads) setLeads(JSON.parse(savedLeads))
    const savedTasks = localStorage.getItem(`tasks_${user.id}`)
    if (savedTasks) setTasks(JSON.parse(savedTasks))
    setLoading(false)
  }

  const daysSinceContact = (dateStr: string) => {
    if (!dateStr) return 999
    const date = new Date(dateStr)
    const now = new Date()
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  }

  const daysSinceCreated = (dateStr: string) => {
    if (!dateStr) return 999
    const date = new Date(dateStr)
    const now = new Date()
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  }

  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = []
    const activeLeads = leads.filter(l => l.status !== 'closed' && l.status !== 'lost')

    const coldLeads = activeLeads.filter(l => daysSinceContact(l.last_contact) >= 30)
    coldLeads.forEach(lead => {
      alerts.push({ id: `cold-${lead.id}`, type: 'urgent', icon: '🚨', title: `${lead.name} is going cold!`, description: `No contact in ${daysSinceContact(lead.last_contact)} days. Reach out before they forget you.`, action: 'Contact Now', link: `/dashboard/leads?highlight=${lead.id}`, leadId: lead.id, priority: 1 })
    })

    activeLeads.forEach(lead => {
      const days = daysSinceCreated(lead.created_at)
      if (days === 90 || days === 180 || days === 365) {
        alerts.push({ id: `milestone-${lead.id}-${days}`, type: 'milestone', icon: '⏰', title: `${days}-day milestone with ${lead.name}`, description: `You've been working with ${lead.name} for ${days} days. Consider a check-in call.`, action: 'Send Message', link: `/dashboard/leads?highlight=${lead.id}`, leadId: lead.id, priority: 4 })
      }
    })

    const hotLeads = activeLeads.filter(l => l.status === 'hot' && daysSinceContact(l.last_contact) >= 3)
    hotLeads.forEach(lead => {
      alerts.push({ id: `hot-${lead.id}`, type: 'warning', icon: '⚠️', title: `Hot lead ${lead.name} needs attention`, description: `Last contact was ${daysSinceContact(lead.last_contact)} days ago. Don't let them cool off!`, action: 'Follow Up', link: `/dashboard/leads?highlight=${lead.id}`, leadId: lead.id, priority: 2 })
    })

    const followupLeads = activeLeads.filter(l => { const days = daysSinceContact(l.last_contact); return days >= 14 && days < 30 && l.status !== 'hot' })
    followupLeads.forEach(lead => {
      alerts.push({ id: `followup-${lead.id}`, type: 'reminder', icon: '📅', title: `Follow up with ${lead.name}`, description: `It's been ${daysSinceContact(lead.last_contact)} days since your last contact.`, action: 'View Lead', link: `/dashboard/leads?highlight=${lead.id}`, leadId: lead.id, priority: 5 })
    })

    const waitingLeads = activeLeads.filter(l => l.status === 'waiting' && daysSinceContact(l.last_contact) <= 7)
    if (waitingLeads.length > 0) {
      alerts.push({ id: 'waiting-leads', type: 'opportunity', icon: '💡', title: `${waitingLeads.length} lead${waitingLeads.length > 1 ? 's' : ''} waiting for response`, description: 'These leads are expecting to hear back from you soon.', action: 'View Leads', link: '/dashboard/leads?status=waiting', priority: 3 })
    }

    const newLeads = activeLeads.filter(l => { const created = new Date(l.created_at); const now = new Date(); const daysSince = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)); return daysSince <= 2 && daysSinceContact(l.last_contact) >= 1 })
    newLeads.forEach(lead => {
      alerts.push({ id: `new-${lead.id}`, type: 'warning', icon: '🆕', title: `New lead ${lead.name} needs response`, description: 'Quick responses to new leads dramatically increase conversion rates.', action: 'Respond Now', link: `/dashboard/leads?highlight=${lead.id}`, leadId: lead.id, priority: 2 })
    })

    if (coldLeads.length >= 5) {
      alerts.push({ id: 'drip-suggestion', type: 'opportunity', icon: '📧', title: 'Start a re-engagement campaign', description: `You have ${coldLeads.length} cold leads. A drip campaign could warm them up.`, action: 'Create Campaign', link: '/dashboard/drip', priority: 3 })
    }

    const today = new Date().toISOString().split('T')[0]
    const overdueTasks = tasks.filter(t => t.due_date < today && t.status !== 'completed')
    overdueTasks.forEach(task => {
      alerts.push({ id: `task-${task.id}`, type: 'urgent', icon: '❗', title: `Overdue: ${task.title}`, description: `This task was due ${Math.abs(daysSinceContact(task.due_date))} days ago.`, action: 'Complete Task', link: '/dashboard/tasker', priority: 1 })
    })

    return alerts.sort((a, b) => a.priority - b.priority)
  }

  const alerts = generateAlerts()
  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.type === filter)
  const alertCounts = { all: alerts.length, urgent: alerts.filter(a => a.type === 'urgent').length, warning: alerts.filter(a => a.type === 'warning').length, opportunity: alerts.filter(a => a.type === 'opportunity').length, milestone: alerts.filter(a => a.type === 'milestone').length, reminder: alerts.filter(a => a.type === 'reminder').length }

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50'
      case 'opportunity': return 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
      case 'milestone': return 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50'
      case 'reminder': return 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
      default: return 'bg-dark-bg/50 border-dark-border'
    }
  }

  if (loading) {
    return (<div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div><p className="text-gray-400">Analyzing your leads...</p></div></div>)
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3"><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">← Back</Link></div>
          <h1 className="font-playfair text-2xl md:text-3xl text-white mt-2">🔔 AI Alerts</h1>
          <p className="text-gray-400 mt-1">Proactive insights to help you stay on top of your leads</p>
        </div>
        <div className="text-right"><p className="text-3xl font-bold text-primary-400">{alerts.length}</p><p className="text-sm text-gray-400">Active Alerts</p></div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ key: 'all', label: 'All', icon: '📋' }, { key: 'urgent', label: 'Urgent', icon: '🚨' }, { key: 'warning', label: 'Warning', icon: '⚠️' }, { key: 'opportunity', label: 'Opportunity', icon: '💡' }, { key: 'milestone', label: 'Milestone', icon: '⏰' }, { key: 'reminder', label: 'Reminder', icon: '📅' }].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${filter === tab.key ? 'bg-primary-500 text-dark-bg font-semibold' : 'bg-dark-card text-gray-400 hover:text-white hover:bg-dark-border'}`}>
            <span>{tab.icon}</span><span>{tab.label}</span><span className={`px-1.5 py-0.5 rounded text-xs ${filter === tab.key ? 'bg-dark-bg/30' : 'bg-dark-bg'}`}>{alertCounts[tab.key as keyof typeof alertCounts]}</span>
          </button>
        ))}
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="card text-center py-12"><span className="text-4xl mb-4 block">✨</span><h3 className="text-xl font-semibold text-white mb-2">No alerts in this category</h3><p className="text-gray-400">You're all caught up! Great job staying on top of things.</p></div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <Link key={alert.id} href={alert.link} className={`block p-4 rounded-xl border transition-all hover:scale-[1.01] ${getAlertStyle(alert.type)}`}>
              <div className="flex items-start gap-4">
                <span className="text-2xl">{alert.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{alert.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${alert.type === 'urgent' ? 'bg-red-500/20 text-red-400' : alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : alert.type === 'opportunity' ? 'bg-green-500/20 text-green-400' : alert.type === 'milestone' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{alert.type}</span>
                  </div>
                  <p className="text-sm text-gray-400">{alert.description}</p>
                </div>
                <span className="text-primary-400 text-sm whitespace-nowrap flex items-center gap-1">{alert.action} →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="card text-center"><p className="text-3xl font-bold text-red-400">{alertCounts.urgent}</p><p className="text-sm text-gray-400">Urgent</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-yellow-400">{alertCounts.warning}</p><p className="text-sm text-gray-400">Warnings</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-green-400">{alertCounts.opportunity}</p><p className="text-sm text-gray-400">Opportunities</p></div>
        <div className="card text-center"><p className="text-3xl font-bold text-blue-400">{alertCounts.reminder}</p><p className="text-sm text-gray-400">Reminders</p></div>
      </div>
    </div>
  )
}
