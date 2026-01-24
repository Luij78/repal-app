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

interface Alert {
  id: string
  type: 'urgent' | 'warning' | 'opportunity' | 'reminder' | 'milestone'
  icon: string
  title: string
  description: string
  leadId?: string
  leadName?: string
  action: string
  actionLink: string
  createdAt: string
  dismissed: boolean
  priority: number
}

export default function AlertsPage() {
  const { user } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'urgent' | 'opportunity' | 'dismissed'>('all')
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = () => {
    if (!user) return
    setLoading(true)

    // Load leads
    const savedLeads = localStorage.getItem(`leads_${user.id}`)
    const leadsData = savedLeads ? JSON.parse(savedLeads) : []
    setLeads(leadsData)

    // Load dismissed alerts
    const savedDismissed = localStorage.getItem(`dismissed_alerts_${user.id}`)
    const dismissedData = savedDismissed ? JSON.parse(savedDismissed) : []
    setDismissedAlerts(dismissedData)

    // Generate alerts based on leads
    const generatedAlerts = generateAlerts(leadsData, dismissedData)
    setAlerts(generatedAlerts)
    
    setLoading(false)
  }

  const daysSince = (dateStr: string) => {
    if (!dateStr) return 999
    const date = new Date(dateStr)
    const now = new Date()
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  }

  const generateAlerts = (leadsData: Lead[], dismissed: string[]): Alert[] => {
    const alerts: Alert[] = []
    const now = new Date()

    leadsData.forEach(lead => {
      const daysSinceContact = daysSince(lead.last_contact)
      const daysSinceCreated = daysSince(lead.created_at)

      // 🚨 URGENT: Leads going cold (30+ days no contact)
      if (daysSinceContact >= 30 && lead.status !== 'closed' && lead.status !== 'lost') {
        alerts.push({
          id: `cold-${lead.id}`,
          type: 'urgent',
          icon: '🚨',
          title: `${lead.name} is going cold!`,
          description: `No contact in ${daysSinceContact} days. This lead may be lost if you don't reach out soon.`,
          leadId: lead.id,
          leadName: lead.name,
          action: 'Contact Now',
          actionLink: '/dashboard/leads',
          createdAt: now.toISOString(),
          dismissed: dismissed.includes(`cold-${lead.id}`),
          priority: 1
        })
      }

      // ⏰ MILESTONE: 90-day mark approaching
      if (daysSinceCreated >= 85 && daysSinceCreated <= 95 && lead.status !== 'closed' && lead.status !== 'lost') {
        alerts.push({
          id: `90day-${lead.id}`,
          type: 'milestone',
          icon: '⏰',
          title: `90-Day Mark: ${lead.name}`,
          description: `This lead's 90-day anniversary is ${daysSinceCreated === 90 ? 'today' : daysSinceCreated < 90 ? `in ${90 - daysSinceCreated} days` : `${daysSinceCreated - 90} days ago`}. Critical time for re-engagement!`,
          leadId: lead.id,
          leadName: lead.name,
          action: 'Review Lead',
          actionLink: '/dashboard/leads',
          createdAt: now.toISOString(),
          dismissed: dismissed.includes(`90day-${lead.id}`),
          priority: 2
        })
      }

      // ⚠️ WARNING: Needs follow-up (14-29 days)
      if (daysSinceContact >= 14 && daysSinceContact < 30 && lead.status !== 'closed' && lead.status !== 'lost') {
        alerts.push({
          id: `followup-${lead.id}`,
          type: 'warning',
          icon: '⚠️',
          title: `Follow up with ${lead.name}`,
          description: `Last contact was ${daysSinceContact} days ago. Time for a check-in to keep them engaged.`,
          leadId: lead.id,
          leadName: lead.name,
          action: 'Send Message',
          actionLink: '/dashboard/leads',
          createdAt: now.toISOString(),
          dismissed: dismissed.includes(`followup-${lead.id}`),
          priority: 3
        })
      }

      // 🔥 HOT LEAD: Hot leads need immediate attention
      if (lead.status === 'hot' && daysSinceContact >= 3) {
        alerts.push({
          id: `hot-${lead.id}`,
          type: 'urgent',
          icon: '🔥',
          title: `Hot lead ${lead.name} needs attention!`,
          description: `This is a hot lead but hasn't been contacted in ${daysSinceContact} days. Don't let them slip away!`,
          leadId: lead.id,
          leadName: lead.name,
          action: 'Contact Now',
          actionLink: '/dashboard/leads',
          createdAt: now.toISOString(),
          dismissed: dismissed.includes(`hot-${lead.id}`),
          priority: 1
        })
      }

      // 💡 OPPORTUNITY: Waiting leads (may be rate-sensitive)
      if (lead.status === 'waiting' && daysSinceContact >= 7) {
        alerts.push({
          id: `waiting-${lead.id}`,
          type: 'opportunity',
          icon: '💡',
          title: `Update ${lead.name} on market conditions`,
          description: `This lead is waiting - they may be monitoring rates or inventory. Share a market update to stay top of mind.`,
          leadId: lead.id,
          leadName: lead.name,
          action: 'Send Update',
          actionLink: '/dashboard/drip',
          createdAt: now.toISOString(),
          dismissed: dismissed.includes(`waiting-${lead.id}`),
          priority: 4
        })
      }

      // 🏡 OPPORTUNITY: 55+ buyers - community updates
      if (lead.type === 'buyer_55' && daysSinceContact >= 14) {
        alerts.push({
          id: `senior-${lead.id}`,
          type: 'opportunity',
          icon: '🏡',
          title: `Share 55+ options with ${lead.name}`,
          description: `Active adult communities often have new incentives. A quick update could reignite their interest.`,
          leadId: lead.id,
          leadName: lead.name,
          action: 'View Communities',
          actionLink: '/dashboard/leads',
          createdAt: now.toISOString(),
          dismissed: dismissed.includes(`senior-${lead.id}`),
          priority: 5
        })
      }

      // 💼 OPPORTUNITY: Investors - ROI updates
      if (lead.type === 'investor' && daysSinceContact >= 21) {
        alerts.push({
          id: `investor-${lead.id}`,
          type: 'opportunity',
          icon: '💼',
          title: `Investment update for ${lead.name}`,
          description: `Investors appreciate market analysis. Share new opportunities or cap rate updates.`,
          leadId: lead.id,
          leadName: lead.name,
          action: 'Send Analysis',
          actionLink: '/dashboard/investment-calculator',
          createdAt: now.toISOString(),
          dismissed: dismissed.includes(`investor-${lead.id}`),
          priority: 5
        })
      }

      // 📅 REMINDER: New leads need quick response
      if (daysSinceCreated <= 2 && daysSinceContact >= 1 && lead.status !== 'closed') {
        alerts.push({
          id: `newlead-${lead.id}`,
          type: 'reminder',
          icon: '📅',
          title: `New lead ${lead.name} awaiting response`,
          description: `Quick response time is crucial! This lead came in ${daysSinceCreated === 0 ? 'today' : daysSinceCreated === 1 ? 'yesterday' : `${daysSinceCreated} days ago`}.`,
          leadId: lead.id,
          leadName: lead.name,
          action: 'Respond Now',
          actionLink: '/dashboard/leads',
          createdAt: now.toISOString(),
          dismissed: dismissed.includes(`newlead-${lead.id}`),
          priority: 1
        })
      }
    })

    // 📧 OPPORTUNITY: Bulk alerts for drip campaigns
    const coldLeads = leadsData.filter(l => l.status === 'cold')
    if (coldLeads.length >= 5) {
      alerts.push({
        id: `drip-cold-${now.getTime()}`,
        type: 'opportunity',
        icon: '📧',
        title: `${coldLeads.length} cold leads ready for re-engagement`,
        description: `A well-crafted market update newsletter could warm up these leads. Consider sending a drip campaign.`,
        action: 'Create Newsletter',
        actionLink: '/dashboard/drip',
        createdAt: now.toISOString(),
        dismissed: dismissed.includes(`drip-cold-${now.getTime()}`),
        priority: 6
      })
    }

    // Sort by priority and dismissed status
    return alerts.sort((a, b) => {
      if (a.dismissed && !b.dismissed) return 1
      if (!a.dismissed && b.dismissed) return -1
      return a.priority - b.priority
    })
  }

  const dismissAlert = (alertId: string) => {
    const updated = [...dismissedAlerts, alertId]
    setDismissedAlerts(updated)
    if (user) {
      localStorage.setItem(`dismissed_alerts_${user.id}`, JSON.stringify(updated))
    }
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, dismissed: true } : a))
  }

  const restoreAlert = (alertId: string) => {
    const updated = dismissedAlerts.filter(id => id !== alertId)
    setDismissedAlerts(updated)
    if (user) {
      localStorage.setItem(`dismissed_alerts_${user.id}`, JSON.stringify(updated))
    }
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, dismissed: false } : a))
  }

  const clearAllDismissed = () => {
    setDismissedAlerts([])
    if (user) {
      localStorage.setItem(`dismissed_alerts_${user.id}`, JSON.stringify([]))
    }
    setAlerts(alerts.map(a => ({ ...a, dismissed: false })))
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return !alert.dismissed
    if (filter === 'urgent') return !alert.dismissed && (alert.type === 'urgent' || alert.type === 'warning')
    if (filter === 'opportunity') return !alert.dismissed && alert.type === 'opportunity'
    if (filter === 'dismissed') return alert.dismissed
    return true
  })

  const alertCounts = {
    all: alerts.filter(a => !a.dismissed).length,
    urgent: alerts.filter(a => !a.dismissed && (a.type === 'urgent' || a.type === 'warning')).length,
    opportunity: alerts.filter(a => !a.dismissed && a.type === 'opportunity').length,
    dismissed: alerts.filter(a => a.dismissed).length
  }

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50'
      case 'opportunity':
        return 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
      case 'milestone':
        return 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50'
      case 'reminder':
        return 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
      default:
        return 'bg-dark-bg border-dark-border'
    }
  }

  const getActionButtonStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-500 hover:bg-red-600'
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-black'
      case 'opportunity':
        return 'bg-green-500 hover:bg-green-600'
      case 'milestone':
        return 'bg-purple-500 hover:bg-purple-600'
      case 'reminder':
        return 'bg-blue-500 hover:bg-blue-600'
      default:
        return 'bg-primary-500 hover:bg-primary-600'
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🔔 AI Alerts
            {alertCounts.urgent > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-sm rounded-full">
                {alertCounts.urgent} urgent
              </span>
            )}
          </h1>
          <p className="text-gray-400">Proactive insights to help you stay on top of your leads</p>
        </div>
        <Link href="/dashboard" className="text-primary-400 hover:underline text-sm">
          ← Back to Dashboard
        </Link>
      </div>

      {/* AI Insight Card */}
      <div className="card mb-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-primary-500/10 border-primary-500/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">AI is monitoring your leads</h3>
            <p className="text-gray-400 text-sm">
              {alerts.filter(a => !a.dismissed).length === 0 
                ? "Great job! You're all caught up. I'll alert you when leads need attention."
                : `I found ${alerts.filter(a => !a.dismissed).length} items that need your attention. ${alertCounts.urgent > 0 ? `${alertCounts.urgent} are urgent!` : ''}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'all' 
              ? 'bg-primary-500 text-white' 
              : 'bg-dark-card text-gray-400 hover:text-white'
          }`}
        >
          All ({alertCounts.all})
        </button>
        <button
          onClick={() => setFilter('urgent')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'urgent' 
              ? 'bg-red-500 text-white' 
              : 'bg-dark-card text-gray-400 hover:text-white'
          }`}
        >
          🚨 Urgent ({alertCounts.urgent})
        </button>
        <button
          onClick={() => setFilter('opportunity')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'opportunity' 
              ? 'bg-green-500 text-white' 
              : 'bg-dark-card text-gray-400 hover:text-white'
          }`}
        >
          💡 Opportunities ({alertCounts.opportunity})
        </button>
        <button
          onClick={() => setFilter('dismissed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'dismissed' 
              ? 'bg-gray-500 text-white' 
              : 'bg-dark-card text-gray-400 hover:text-white'
          }`}
        >
          ✓ Dismissed ({alertCounts.dismissed})
        </button>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">
            {filter === 'dismissed' ? '📭' : '✨'}
          </span>
          <p className="text-gray-400 mb-2">
            {filter === 'all' && "You're all caught up!"}
            {filter === 'urgent' && "No urgent alerts right now"}
            {filter === 'opportunity' && "No opportunities detected"}
            {filter === 'dismissed' && "No dismissed alerts"}
          </p>
          <p className="text-gray-500 text-sm">
            {filter === 'all' && "AI is monitoring your leads. Check back later or add more leads."}
            {filter === 'urgent' && "Great job staying on top of your leads!"}
            {filter === 'opportunity' && "Keep engaging with leads to unlock opportunities."}
            {filter === 'dismissed' && "Dismissed alerts will appear here."}
          </p>
          {filter === 'all' && leads.length === 0 && (
            <Link href="/dashboard/leads" className="btn-primary inline-block mt-4">
              Add Your First Lead
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filter === 'dismissed' && alertCounts.dismissed > 0 && (
            <div className="flex justify-end mb-2">
              <button
                onClick={clearAllDismissed}
                className="text-sm text-gray-400 hover:text-white"
              >
                Restore All
              </button>
            </div>
          )}
          
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`card border transition-all ${getAlertStyle(alert.type)} ${alert.dismissed ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{alert.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white">{alert.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{alert.description}</p>
                    </div>
                    {!alert.dismissed && (
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-gray-500 hover:text-white text-sm flex-shrink-0"
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    {!alert.dismissed ? (
                      <Link
                        href={alert.actionLink}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${getActionButtonStyle(alert.type)}`}
                      >
                        {alert.action}
                      </Link>
                    ) : (
                      <button
                        onClick={() => restoreAlert(alert.id)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-dark-border text-white hover:bg-primary-500/20"
                      >
                        Restore Alert
                      </button>
                    )}
                    {alert.leadName && (
                      <span className="text-xs text-gray-500">
                        Lead: {alert.leadName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-400">{alertCounts.urgent}</p>
          <p className="text-gray-400 text-sm">Need Attention</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-400">{alertCounts.opportunity}</p>
          <p className="text-gray-400 text-sm">Opportunities</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-400">{leads.length}</p>
          <p className="text-gray-400 text-sm">Total Leads</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-400">{alertCounts.dismissed}</p>
          <p className="text-gray-400 text-sm">Dismissed</p>
        </div>
      </div>
    </div>
  )
}
