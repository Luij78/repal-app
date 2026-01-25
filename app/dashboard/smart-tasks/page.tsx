'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

interface Lead { id: string; name: string; email: string; phone: string; status: string; type: string; source: string; last_contact: string; notes: string; created_at: string }
interface Task { id: string; title: string; due_date: string; priority: string; status: string; related_to: string }
interface SmartTask { id: string; icon: string; title: string; description: string; category: 'follow-up' | 'outreach' | 'admin' | 'marketing'; priority: 'high' | 'medium' | 'low'; suggestedDue: string; relatedLeadId?: string; relatedLeadName?: string }

export default function SmartTasksPage() {
  const { user } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [addedTasks, setAddedTasks] = useState<string[]>([])

  useEffect(() => {
    if (user) loadData()
    const saved = localStorage.getItem('repal_added_smart_tasks')
    if (saved) setAddedTasks(JSON.parse(saved))
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

  const getFutureDate = (daysAhead: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysAhead)
    return date.toISOString().split('T')[0]
  }

  const generateSmartTasks = (): SmartTask[] => {
    const smartTasks: SmartTask[] = []
    const activeLeads = leads.filter(l => l.status !== 'closed' && l.status !== 'lost')

    const coldLeads = activeLeads.filter(l => daysSinceContact(l.last_contact) >= 30)
    coldLeads.slice(0, 3).forEach(lead => {
      smartTasks.push({ id: `followup-cold-${lead.id}`, icon: '📞', title: `Call ${lead.name}`, description: `Re-engage this lead who hasn't been contacted in ${daysSinceContact(lead.last_contact)} days`, category: 'follow-up', priority: 'high', suggestedDue: getFutureDate(1), relatedLeadId: lead.id, relatedLeadName: lead.name })
    })

    const hotLeads = activeLeads.filter(l => l.status === 'hot' && daysSinceContact(l.last_contact) >= 2)
    hotLeads.forEach(lead => {
      smartTasks.push({ id: `followup-hot-${lead.id}`, icon: '🔥', title: `Follow up with hot lead ${lead.name}`, description: 'Keep momentum going with this hot prospect', category: 'follow-up', priority: 'high', suggestedDue: getFutureDate(0), relatedLeadId: lead.id, relatedLeadName: lead.name })
    })

    const newLeads = activeLeads.filter(l => { const created = new Date(l.created_at); const now = new Date(); const daysSince = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)); return daysSince <= 3 && daysSinceContact(l.last_contact) >= 1 })
    newLeads.forEach(lead => {
      smartTasks.push({ id: `welcome-${lead.id}`, icon: '👋', title: `Send welcome message to ${lead.name}`, description: 'First impressions matter - reach out to your new lead', category: 'outreach', priority: 'high', suggestedDue: getFutureDate(0), relatedLeadId: lead.id, relatedLeadName: lead.name })
    })

    const investorLeads = activeLeads.filter(l => l.type === 'investor')
    if (investorLeads.length >= 2) {
      smartTasks.push({ id: 'market-update', icon: '📊', title: 'Send weekly market update', description: `Keep your ${investorLeads.length} investors informed with market insights`, category: 'marketing', priority: 'medium', suggestedDue: getFutureDate(2) })
    }

    if (coldLeads.length >= 5) {
      smartTasks.push({ id: 'drip-campaign', icon: '📧', title: 'Create re-engagement drip campaign', description: `${coldLeads.length} cold leads could benefit from an automated nurture sequence`, category: 'marketing', priority: 'medium', suggestedDue: getFutureDate(3) })
    }

    if (activeLeads.length >= 20) {
      smartTasks.push({ id: 'crm-cleanup', icon: '🧹', title: 'Review and clean up CRM', description: 'Check for duplicate contacts and update outdated information', category: 'admin', priority: 'low', suggestedDue: getFutureDate(7) })
    }

    const waitingLeads = activeLeads.filter(l => l.status === 'waiting')
    waitingLeads.slice(0, 2).forEach(lead => {
      smartTasks.push({ id: `waiting-${lead.id}`, icon: '⏳', title: `Check on ${lead.name}'s decision`, description: 'This lead is waiting - a gentle nudge might help', category: 'follow-up', priority: 'medium', suggestedDue: getFutureDate(2), relatedLeadId: lead.id, relatedLeadName: lead.name })
    })

    return smartTasks.filter(t => !addedTasks.includes(t.id))
  }

  const addTaskToTasker = (smartTask: SmartTask) => {
    if (!user) return
    const newTask: Task = { id: `task_${Date.now()}`, title: smartTask.title, due_date: smartTask.suggestedDue, priority: smartTask.priority, status: 'pending', related_to: smartTask.relatedLeadName || '' }
    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    localStorage.setItem(`tasks_${user.id}`, JSON.stringify(updatedTasks))
    const newAddedTasks = [...addedTasks, smartTask.id]
    setAddedTasks(newAddedTasks)
    localStorage.setItem('repal_added_smart_tasks', JSON.stringify(newAddedTasks))
  }

  const smartTasks = generateSmartTasks()
  const getCategoryStyle = (category: string) => { switch (category) { case 'follow-up': return 'bg-blue-500/20 text-blue-400'; case 'outreach': return 'bg-green-500/20 text-green-400'; case 'admin': return 'bg-gray-500/20 text-gray-400'; case 'marketing': return 'bg-purple-500/20 text-purple-400'; default: return 'bg-dark-bg text-gray-400' } }
  const getPriorityStyle = (priority: string) => { switch (priority) { case 'high': return 'bg-red-500/20 text-red-400'; case 'medium': return 'bg-yellow-500/20 text-yellow-400'; case 'low': return 'bg-green-500/20 text-green-400'; default: return 'bg-dark-bg text-gray-400' } }

  if (loading) { return (<div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div><p className="text-gray-400">Generating smart tasks...</p></div></div>) }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3"><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">← Back</Link></div>
          <h1 className="font-playfair text-2xl md:text-3xl text-white mt-2">🧠 Smart Tasks</h1>
          <p className="text-gray-400 mt-1">AI-suggested tasks based on your lead activity</p>
        </div>
        <div className="text-right"><p className="text-3xl font-bold text-green-400">{smartTasks.length}</p><p className="text-sm text-gray-400">Suggested Tasks</p></div>
      </div>

      <div className="card bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
        <div className="flex items-start gap-3"><span className="text-2xl">💡</span><div><h3 className="font-semibold text-white mb-1">How Smart Tasks Work</h3><p className="text-sm text-gray-400">We analyze your leads and suggest tasks to help you stay productive. Click "Add to Tasker" to add any suggestion to your task list.</p></div></div>
      </div>

      {smartTasks.length === 0 ? (
        <div className="card text-center py-12"><span className="text-4xl mb-4 block">🎉</span><h3 className="text-xl font-semibold text-white mb-2">No new suggestions</h3><p className="text-gray-400">You've added all suggested tasks. Check back later for more!</p><Link href="/dashboard/tasker" className="inline-block mt-4 px-4 py-2 bg-primary-500 text-dark-bg rounded-lg font-semibold hover:bg-primary-400 transition-colors">View Your Tasks →</Link></div>
      ) : (
        <div className="space-y-3">
          {smartTasks.map(task => (
            <div key={task.id} className="card hover:border-primary-500/30 transition-all">
              <div className="flex items-start gap-4">
                <span className="text-2xl">{task.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap"><h3 className="font-semibold text-white">{task.title}</h3><span className={`px-2 py-0.5 rounded text-xs capitalize ${getCategoryStyle(task.category)}`}>{task.category}</span><span className={`px-2 py-0.5 rounded text-xs capitalize ${getPriorityStyle(task.priority)}`}>{task.priority}</span></div>
                  <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500"><span>📅 Suggested: {new Date(task.suggestedDue).toLocaleDateString()}</span>{task.relatedLeadName && (<span>👤 {task.relatedLeadName}</span>)}</div>
                </div>
                <button onClick={() => addTaskToTasker(task)} className="px-4 py-2 bg-primary-500 text-dark-bg rounded-lg font-semibold hover:bg-primary-400 transition-colors text-sm whitespace-nowrap">Add to Tasker</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-8"><Link href="/dashboard/tasker" className="text-primary-400 hover:text-primary-300 transition-colors">View all your tasks in Tasker →</Link></div>
    </div>
  )
}
