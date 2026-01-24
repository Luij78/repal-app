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
  budget?: string
  timeline?: string
}

interface Task {
  id: string
  title: string
  description: string
  due_date: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed'
  lead_id?: string
  lead_name?: string
  created_at: string
}

interface SuggestedTask {
  id: string
  title: string
  description: string
  reason: string
  priority: 'low' | 'medium' | 'high'
  leadId?: string
  leadName?: string
  type: 'follow_up' | 'rate_alert' | 'milestone' | 'engagement' | 'nurture'
  icon: string
  dueInDays: number
}

export default function SmartTasksPage() {
  const { user } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptedIds, setAcceptedIds] = useState<string[]>([])
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = () => {
    if (!user) return
    setLoading(true)

    // Load leads
    const savedLeads = localStorage.getItem(`leads_${user.id}`)
    const leadsData = savedLeads ? JSON.parse(savedLeads) : []
    setLeads(leadsData)

    // Load existing tasks
    const savedTasks = localStorage.getItem(`tasks_${user.id}`)
    const tasksData = savedTasks ? JSON.parse(savedTasks) : []
    setTasks(tasksData)

    // Load dismissed suggestions
    const savedDismissed = localStorage.getItem(`dismissed_suggestions_${user.id}`)
    const dismissedData = savedDismissed ? JSON.parse(savedDismissed) : []
    setDismissedIds(dismissedData)

    // Generate suggestions
    const suggestions = generateSuggestions(leadsData, tasksData, dismissedData)
    setSuggestedTasks(suggestions)

    setLoading(false)
  }

  const daysSince = (dateStr: string) => {
    if (!dateStr) return 999
    const date = new Date(dateStr)
    const now = new Date()
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  }

  const generateSuggestions = (leadsData: Lead[], existingTasks: Task[], dismissed: string[]): SuggestedTask[] => {
    const suggestions: SuggestedTask[] = []

    leadsData.forEach(lead => {
      const daysSinceContact = daysSince(lead.last_contact)
      const daysSinceCreated = daysSince(lead.created_at)

      // Check if task already exists for this lead
      const hasRecentTask = existingTasks.some(t => 
        t.lead_id === lead.id && 
        t.status === 'pending' &&
        daysSince(t.created_at) < 7
      )

      if (hasRecentTask) return

      // 🔥 Hot leads - immediate follow up
      if (lead.status === 'hot' && daysSinceContact >= 2) {
        suggestions.push({
          id: `hot-${lead.id}`,
          title: `Call ${lead.name} - Hot Lead!`,
          description: `Hot lead hasn't been contacted in ${daysSinceContact} days. Strike while the iron is hot!`,
          reason: 'Hot leads need frequent contact to close',
          priority: 'high',
          leadId: lead.id,
          leadName: lead.name,
          type: 'follow_up',
          icon: '🔥',
          dueInDays: 0
        })
      }

      // ⏰ 14-day follow up
      if (daysSinceContact >= 14 && daysSinceContact < 21 && lead.status !== 'closed' && lead.status !== 'lost') {
        suggestions.push({
          id: `followup14-${lead.id}`,
          title: `Check in with ${lead.name}`,
          description: `It's been ${daysSinceContact} days since your last contact. A quick check-in keeps you top of mind.`,
          reason: '14-day follow-up prevents leads from going cold',
          priority: 'medium',
          leadId: lead.id,
          leadName: lead.name,
          type: 'follow_up',
          icon: '📞',
          dueInDays: 1
        })
      }

      // 🚨 21-day urgent follow up
      if (daysSinceContact >= 21 && daysSinceContact < 30 && lead.status !== 'closed' && lead.status !== 'lost') {
        suggestions.push({
          id: `followup21-${lead.id}`,
          title: `Urgent: Re-engage ${lead.name}`,
          description: `${daysSinceContact} days without contact - this lead is at risk of going cold!`,
          reason: 'Leads without contact for 21+ days often disengage',
          priority: 'high',
          leadId: lead.id,
          leadName: lead.name,
          type: 'follow_up',
          icon: '🚨',
          dueInDays: 0
        })
      }

      // ⏰ 90-day milestone
      if (daysSinceCreated >= 85 && daysSinceCreated <= 95 && lead.status !== 'closed' && lead.status !== 'lost') {
        suggestions.push({
          id: `milestone90-${lead.id}`,
          title: `90-Day Review: ${lead.name}`,
          description: `This lead's 90-day mark is approaching. Perfect time for a status review and re-engagement strategy.`,
          reason: '90 days is a critical decision point for many buyers',
          priority: 'medium',
          leadId: lead.id,
          leadName: lead.name,
          type: 'milestone',
          icon: '⏰',
          dueInDays: 2
        })
      }

      // 💼 Investor leads - ROI update
      if (lead.type === 'investor' && daysSinceContact >= 14) {
        suggestions.push({
          id: `investor-${lead.id}`,
          title: `Send market analysis to ${lead.name}`,
          description: `Investors love data. Share recent cap rates, rental trends, or new opportunities.`,
          reason: 'Investors value market insights and ROI analysis',
          priority: 'medium',
          leadId: lead.id,
          leadName: lead.name,
          type: 'nurture',
          icon: '💼',
          dueInDays: 3
        })
      }

      // 🏡 55+ buyers - community updates
      if (lead.type === 'buyer_55' && daysSinceContact >= 14) {
        suggestions.push({
          id: `senior-${lead.id}`,
          title: `Share 55+ community info with ${lead.name}`,
          description: `Active adult communities often have new incentives. Check for updates to share.`,
          reason: '55+ buyers appreciate curated community options',
          priority: 'low',
          leadId: lead.id,
          leadName: lead.name,
          type: 'nurture',
          icon: '🏡',
          dueInDays: 5
        })
      }

      // 🏠 First-time buyers - education
      if (lead.type === 'first_time_buyer' && daysSinceContact >= 10) {
        suggestions.push({
          id: `ftb-${lead.id}`,
          title: `Send buyer guide to ${lead.name}`,
          description: `First-time buyers benefit from educational content about the buying process.`,
          reason: 'Education builds trust with first-time buyers',
          priority: 'low',
          leadId: lead.id,
          leadName: lead.name,
          type: 'nurture',
          icon: '📚',
          dueInDays: 3
        })
      }

      // 💰 Waiting leads - rate/market update
      if (lead.status === 'waiting' && daysSinceContact >= 7) {
        suggestions.push({
          id: `waiting-${lead.id}`,
          title: `Market update for ${lead.name}`,
          description: `This lead is waiting - likely monitoring rates or inventory. A timely update keeps you connected.`,
          reason: 'Waiting leads are rate-sensitive and appreciate market news',
          priority: 'medium',
          leadId: lead.id,
          leadName: lead.name,
          type: 'rate_alert',
          icon: '📊',
          dueInDays: 1
        })
      }

      // ❄️ Cold leads - re-engagement
      if (lead.status === 'cold' && daysSinceContact >= 30 && daysSinceContact < 60) {
        suggestions.push({
          id: `cold-${lead.id}`,
          title: `Re-engage ${lead.name}`,
          description: `This lead went cold but might still be in the market. A friendly check-in could revive their interest.`,
          reason: 'Cold leads sometimes just need a nudge to re-engage',
          priority: 'low',
          leadId: lead.id,
          leadName: lead.name,
          type: 'engagement',
          icon: '❄️',
          dueInDays: 7
        })
      }

      // 🆕 New leads - quick response
      if (daysSinceCreated <= 1 && daysSinceContact >= 1) {
        suggestions.push({
          id: `newlead-${lead.id}`,
          title: `Respond to new lead: ${lead.name}`,
          description: `New leads expect quick responses! Reach out within 24 hours for best results.`,
          reason: 'Speed to lead is critical - 78% of buyers choose the first responder',
          priority: 'high',
          leadId: lead.id,
          leadName: lead.name,
          type: 'follow_up',
          icon: '🆕',
          dueInDays: 0
        })
      }
    })

    // Filter out dismissed and sort by priority
    return suggestions
      .filter(s => !dismissed.includes(s.id))
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
  }

  const acceptSuggestion = (suggestion: SuggestedTask) => {
    if (!user) return

    // Create actual task
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + suggestion.dueInDays)

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: suggestion.title,
      description: suggestion.description,
      due_date: dueDate.toISOString().split('T')[0],
      priority: suggestion.priority,
      status: 'pending',
      lead_id: suggestion.leadId,
      lead_name: suggestion.leadName,
      created_at: new Date().toISOString()
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    localStorage.setItem(`tasks_${user.id}`, JSON.stringify(updatedTasks))

    // Mark as accepted
    setAcceptedIds([...acceptedIds, suggestion.id])

    // Remove from suggestions
    setSuggestedTasks(suggestedTasks.filter(s => s.id !== suggestion.id))

    // Show success message
    setShowSuccess(suggestion.title)
    setTimeout(() => setShowSuccess(null), 3000)
  }

  const dismissSuggestion = (suggestionId: string) => {
    if (!user) return

    const updated = [...dismissedIds, suggestionId]
    setDismissedIds(updated)
    localStorage.setItem(`dismissed_suggestions_${user.id}`, JSON.stringify(updated))

    setSuggestedTasks(suggestedTasks.filter(s => s.id !== suggestionId))
  }

  const acceptAll = () => {
    suggestedTasks.forEach(s => acceptSuggestion(s))
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'follow_up': return 'bg-blue-500/10 border-blue-500/30'
      case 'rate_alert': return 'bg-purple-500/10 border-purple-500/30'
      case 'milestone': return 'bg-orange-500/10 border-orange-500/30'
      case 'engagement': return 'bg-cyan-500/10 border-cyan-500/30'
      case 'nurture': return 'bg-green-500/10 border-green-500/30'
      default: return 'bg-dark-card'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✅ Task created: {showSuccess}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🤖 Smart Tasks
            {suggestedTasks.length > 0 && (
              <span className="px-2 py-1 bg-primary-500 text-white text-sm rounded-full">
                {suggestedTasks.length} suggestions
              </span>
            )}
          </h1>
          <p className="text-gray-400">AI-generated task suggestions based on your leads</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/tasks" className="text-primary-400 hover:underline text-sm">
            View All Tasks →
          </Link>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="card mb-6 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border-primary-500/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🧠</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">AI Task Assistant</h3>
            <p className="text-gray-400 text-sm">
              {suggestedTasks.length === 0 
                ? "No task suggestions right now. I'm monitoring your leads and will suggest tasks when action is needed."
                : `I've analyzed your ${leads.length} leads and have ${suggestedTasks.length} task suggestions. Review and accept the ones you'd like to add to your task list.`
              }
            </p>
            {suggestedTasks.length > 1 && (
              <button
                onClick={acceptAll}
                className="mt-3 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-lg transition-all"
              >
                Accept All Suggestions
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-400">{suggestedTasks.filter(s => s.priority === 'high').length}</p>
          <p className="text-gray-400 text-sm">High Priority</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-yellow-400">{suggestedTasks.filter(s => s.priority === 'medium').length}</p>
          <p className="text-gray-400 text-sm">Medium Priority</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-400">{suggestedTasks.filter(s => s.priority === 'low').length}</p>
          <p className="text-gray-400 text-sm">Low Priority</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-400">{tasks.filter(t => t.status === 'pending').length}</p>
          <p className="text-gray-400 text-sm">Active Tasks</p>
        </div>
      </div>

      {/* Suggestions List */}
      {suggestedTasks.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">✨</span>
          <p className="text-gray-400 mb-2">No task suggestions right now</p>
          <p className="text-gray-500 text-sm mb-4">
            {leads.length === 0 
              ? "Add some leads and I'll start generating smart task suggestions!"
              : "Your leads are well-maintained. Check back later for new suggestions."
            }
          </p>
          {leads.length === 0 ? (
            <Link href="/dashboard/leads" className="btn-primary inline-block">
              Add Your First Lead
            </Link>
          ) : (
            <Link href="/dashboard/tasks" className="btn-primary inline-block">
              View Your Tasks
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {suggestedTasks.map(suggestion => (
            <div
              key={suggestion.id}
              className={`card border transition-all hover:border-primary-500/50 ${getTypeStyle(suggestion.type)}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{suggestion.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{suggestion.title}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityStyle(suggestion.priority)}`}>
                          {suggestion.priority}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{suggestion.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="bg-dark-border px-2 py-1 rounded">💡 {suggestion.reason}</span>
                    {suggestion.dueInDays === 0 && <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">Due today</span>}
                    {suggestion.dueInDays === 1 && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Due tomorrow</span>}
                    {suggestion.dueInDays > 1 && <span className="bg-gray-500/20 px-2 py-1 rounded">Due in {suggestion.dueInDays} days</span>}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => acceptSuggestion(suggestion)}
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-lg transition-all flex items-center gap-2"
                    >
                      ✓ Create Task
                    </button>
                    <button
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="px-4 py-2 bg-dark-border hover:bg-dark-border/80 text-gray-400 text-sm rounded-lg transition-all"
                    >
                      Dismiss
                    </button>
                    {suggestion.leadName && (
                      <span className="text-xs text-gray-500 ml-auto">
                        Lead: {suggestion.leadName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-dark-border">
        <Link href="/dashboard" className="text-primary-400 hover:underline text-sm">
          ← Back to Dashboard
        </Link>
        <Link href="/dashboard/alerts" className="text-primary-400 hover:underline text-sm">
          View AI Alerts →
        </Link>
      </div>
    </div>
  )
}
