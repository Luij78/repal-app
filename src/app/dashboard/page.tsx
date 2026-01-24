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

interface Appointment {
  id: string
  title: string
  client_name: string
  date: string
  time: string
  location: string
  type: string
  notes: string
}

interface Task {
  id: string
  title: string
  due_date?: string
  dueDate?: string
  priority: string
  status?: string
  completed?: boolean
  related_to?: string
}

interface DigestInsight {
  type: 'priority' | 'suggestion' | 'alert' | 'opportunity'
  icon: string
  title: string
  description: string
  action?: string
  link?: string
}

export default function DashboardPage() {
  const { user } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [digestExpanded, setDigestExpanded] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (user) {
      loadData()
    }
    
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [user])

  const loadData = () => {
    if (!user) return
    setLoading(true)
    
    // Load leads (use repal_ prefix to match individual pages)
    const savedLeads = localStorage.getItem('repal_leads')
    if (savedLeads) setLeads(JSON.parse(savedLeads))
    
    // Load appointments
    const savedAppointments = localStorage.getItem('repal_appointments')
    if (savedAppointments) setAppointments(JSON.parse(savedAppointments))
    
    // Load tasks
    const savedTasks = localStorage.getItem('repal_tasks')
    if (savedTasks) setTasks(JSON.parse(savedTasks))
    
    setLoading(false)
  }

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return '🌅 Good Morning'
    if (hour < 17) return '☀️ Good Afternoon'
    return '🌙 Good Evening'
  }

  // Calculate days since last contact
  const daysSinceContact = (dateStr: string) => {
    if (!dateStr) return 999
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  // Get today's appointments
  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => apt.date === today)
  }

  // Get upcoming appointments (next 7 days)
  const getUpcomingAppointments = () => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate >= today && aptDate <= nextWeek
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Get leads needing follow-up (no contact in 14+ days)
  const getLeadsNeedingFollowup = () => {
    return leads.filter(lead => {
      const days = daysSinceContact(lead.last_contact)
      return days >= 14 && lead.status !== 'closed' && lead.status !== 'lost'
    }).sort((a, b) => daysSinceContact(b.last_contact) - daysSinceContact(a.last_contact))
  }

  // Get overdue tasks
  const getOverdueTasks = () => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter(task => {
      const dueDate = task.due_date || task.dueDate
      const isCompleted = task.status === 'completed' || task.completed === true
      return dueDate < today && !isCompleted
    })
  }

  // Get tasks due today
  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter(task => {
      const dueDate = task.due_date || task.dueDate
      const isCompleted = task.status === 'completed' || task.completed === true
      return dueDate === today && !isCompleted
    })
  }

  // Get leads by status
  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status)
  }

  // Generate AI Insights
  const generateInsights = (): DigestInsight[] => {
    const insights: DigestInsight[] = []
    
    // Priority: Overdue tasks
    const overdueTasks = getOverdueTasks()
    if (overdueTasks.length > 0) {
      insights.push({
        type: 'alert',
        icon: '🚨',
        title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`,
        description: overdueTasks.length === 1 
          ? `"${overdueTasks[0].title}" needs attention`
          : `Including "${overdueTasks[0].title}" - tackle these first`,
        action: 'View Tasks',
        link: '/dashboard/tasks'
      })
    }

    // Priority: Today's appointments
    const todayApts = getTodayAppointments()
    if (todayApts.length > 0) {
      insights.push({
        type: 'priority',
        icon: '📅',
        title: `${todayApts.length} Appointment${todayApts.length > 1 ? 's' : ''} Today`,
        description: todayApts.map(apt => `${apt.time} - ${apt.client_name}`).join(' • '),
        action: 'View Schedule',
        link: '/dashboard/appointments'
      })
    }

    // Suggestion: Leads needing follow-up
    const needFollowup = getLeadsNeedingFollowup()
    if (needFollowup.length > 0) {
      const urgent = needFollowup.filter(l => daysSinceContact(l.last_contact) >= 30)
      if (urgent.length > 0) {
        insights.push({
          type: 'alert',
          icon: '⚠️',
          title: `${urgent.length} Lead${urgent.length > 1 ? 's' : ''} Going Cold`,
          description: `${urgent[0].name} hasn't been contacted in ${daysSinceContact(urgent[0].last_contact)} days`,
          action: 'Contact Now',
          link: '/dashboard/leads'
        })
      } else {
        insights.push({
          type: 'suggestion',
          icon: '📞',
          title: `${needFollowup.length} Lead${needFollowup.length > 1 ? 's' : ''} Need Follow-up`,
          description: `${needFollowup[0].name} - last contact ${daysSinceContact(needFollowup[0].last_contact)} days ago`,
          action: 'View Leads',
          link: '/dashboard/leads'
        })
      }
    }

    // Opportunity: Waiting leads (could be rate-sensitive)
    const waitingLeads = getLeadsByStatus('waiting')
    if (waitingLeads.length > 0) {
      insights.push({
        type: 'opportunity',
        icon: '💡',
        title: `${waitingLeads.length} Lead${waitingLeads.length > 1 ? 's' : ''} Waiting`,
        description: 'These leads may be waiting for better rates or conditions - check in with market updates',
        action: 'Send Newsletter',
        link: '/dashboard/drip'
      })
    }

    // Opportunity: Cold leads for drip campaign
    const coldLeads = getLeadsByStatus('cold')
    if (coldLeads.length >= 5) {
      insights.push({
        type: 'opportunity',
        icon: '📧',
        title: `${coldLeads.length} Cold Leads to Re-engage`,
        description: 'A market update newsletter could warm up these leads',
        action: 'Create Newsletter',
        link: '/dashboard/drip'
      })
    }

    // Suggestion: Investors in database
    const investors = leads.filter(l => l.type === 'investor')
    if (investors.length > 0) {
      const recentInvestors = investors.filter(l => daysSinceContact(l.last_contact) >= 21)
      if (recentInvestors.length > 0) {
        insights.push({
          type: 'suggestion',
          icon: '💼',
          title: `${recentInvestors.length} Investor${recentInvestors.length > 1 ? 's' : ''} to Update`,
          description: 'Share new investment opportunities or market analysis',
          action: 'View Investors',
          link: '/dashboard/leads'
        })
      }
    }

    // Suggestion: 55+ buyers
    const seniorBuyers = leads.filter(l => l.type === 'buyer_55')
    if (seniorBuyers.length > 0) {
      const needsContact = seniorBuyers.filter(l => daysSinceContact(l.last_contact) >= 14)
      if (needsContact.length > 0) {
        insights.push({
          type: 'suggestion',
          icon: '🏡',
          title: `${needsContact.length} 55+ Buyer${needsContact.length > 1 ? 's' : ''} to Check In`,
          description: 'Share new community options or incentives',
          action: 'View Leads',
          link: '/dashboard/leads'
        })
      }
    }

    // If no appointments this week, suggest prospecting
    const upcomingApts = getUpcomingAppointments()
    if (upcomingApts.length === 0 && leads.length > 0) {
      insights.push({
        type: 'suggestion',
        icon: '🎯',
        title: 'No Appointments This Week',
        description: 'Time to reach out and book some showings!',
        action: 'View Leads',
        link: '/dashboard/leads'
      })
    }

    // Milestone alerts
    leads.forEach(lead => {
      const days = daysSinceContact(lead.created_at)
      if (days === 90 || days === 89 || days === 91) {
        insights.push({
          type: 'alert',
          icon: '⏰',
          title: `90-Day Mark: ${lead.name}`,
          description: "This lead's 90-day anniversary is here - critical follow-up time",
          action: 'Contact Now',
          link: '/dashboard/leads'
        })
      }
    })

    // Limit to top 6 insights
    return insights.slice(0, 6)
  }

  const insights = generateInsights()

  // Quick stats
  const stats = {
    totalLeads: leads.length,
    activeLeads: leads.filter(l => !['closed', 'lost'].includes(l.status)).length,
    todayAppointments: getTodayAppointments().length,
    pendingTasks: tasks.filter(t => !(t.status === 'completed' || t.completed === true)).length,
    hotLeads: leads.filter(l => l.status === 'hot').length,
    coldLeads: leads.filter(l => l.status === 'cold').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Calculate urgent alerts count
  const getUrgentAlertsCount = () => {
    let count = 0
    leads.forEach(lead => {
      const days = daysSinceContact(lead.last_contact)
      if (days >= 30 && lead.status !== 'closed' && lead.status !== 'lost') count++
      if (lead.status === 'hot' && days >= 3) count++
    })
    return count
  }

  const urgentAlerts = getUrgentAlertsCount()

  return (
    <div className="animate-fade-in space-y-6">
      {/* AI Daily Digest */}
      <div className="card bg-gradient-to-br from-primary-500/10 via-blue-500/5 to-purple-500/10 border-primary-500/30">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setDigestExpanded(!digestExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {getGreeting()}, {user?.firstName || 'there'}!
              </h2>
              <p className="text-gray-400 text-sm">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/dashboard/alerts"
              onClick={(e) => e.stopPropagation()}
              className="relative flex items-center gap-1 text-xs bg-primary-500/20 hover:bg-primary-500/30 px-2 py-1 rounded-full transition-all"
            >
              <span>🔔</span>
              <span className="text-primary-400">AI Alerts</span>
              {urgentAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {urgentAlerts}
                </span>
              )}
            </Link>
            <span className="text-gray-400">{digestExpanded ? '▲' : '▼'}</span>
          </div>
        </div>

        {digestExpanded && (
          <div className="mt-6 space-y-4">
            {/* Quick Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-dark-bg/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-white">{stats.todayAppointments}</p>
                <p className="text-xs text-gray-400">Today's Appts</p>
              </div>
              <div className="bg-dark-bg/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-400">{getLeadsNeedingFollowup().length}</p>
                <p className="text-xs text-gray-400">Need Follow-up</p>
              </div>
              <div className="bg-dark-bg/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-400">{getOverdueTasks().length}</p>
                <p className="text-xs text-gray-400">Overdue Tasks</p>
              </div>
              <div className="bg-dark-bg/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-400">{stats.hotLeads}</p>
                <p className="text-xs text-gray-400">Hot Leads</p>
              </div>
            </div>

            {/* AI Insights */}
            {insights.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                  <span>💡</span> AI Suggestions
                </h3>
                <div className="grid gap-2">
                  {insights.map((insight, index) => (
                    <Link 
                      key={index}
                      href={insight.link || '#'}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all hover:scale-[1.01] ${
                        insight.type === 'alert' 
                          ? 'bg-red-500/10 border border-red-500/30 hover:border-red-500/50'
                          : insight.type === 'priority'
                          ? 'bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50'
                          : insight.type === 'opportunity'
                          ? 'bg-green-500/10 border border-green-500/30 hover:border-green-500/50'
                          : 'bg-dark-bg/50 border border-dark-border hover:border-primary-500/50'
                      }`}
                    >
                      <span className="text-xl">{insight.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm">{insight.title}</p>
                        <p className="text-xs text-gray-400 truncate">{insight.description}</p>
                      </div>
                      {insight.action && (
                        <span className="text-xs text-primary-400 whitespace-nowrap">
                          {insight.action} →
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <span className="text-2xl mb-2 block">✨</span>
                <p className="text-green-400 font-medium">You're all caught up!</p>
                <p className="text-gray-400 text-sm">No urgent items. Great job staying on top of things!</p>
              </div>
            )}

            {/* Today's Schedule Preview */}
            {getTodayAppointments().length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                  <span>📅</span> Today's Schedule
                </h3>
                <div className="space-y-2">
                  {getTodayAppointments().map(apt => (
                    <div key={apt.id} className="flex items-center gap-3 bg-dark-bg/50 rounded-lg p-3">
                      <div className="text-center min-w-[50px]">
                        <p className="text-sm font-bold text-white">{apt.time}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{apt.title}</p>
                        <p className="text-xs text-gray-400">{apt.client_name} • {apt.location || 'No location'}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        {apt.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/dashboard/leads" className="card hover:border-primary-500/50 transition-all text-center group">
          <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">👥</span>
          <p className="font-semibold text-white">Leads</p>
          <p className="text-xs text-gray-400">{stats.activeLeads} active</p>
        </Link>
        <Link href="/dashboard/appointments" className="card hover:border-primary-500/50 transition-all text-center group">
          <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">📅</span>
          <p className="font-semibold text-white">Appointments</p>
          <p className="text-xs text-gray-400">{getUpcomingAppointments().length} upcoming</p>
        </Link>
        <Link href="/dashboard/tasks" className="card hover:border-primary-500/50 transition-all text-center group">
          <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">✅</span>
          <p className="font-semibold text-white">Tasks</p>
          <p className="text-xs text-gray-400">{stats.pendingTasks} pending</p>
        </Link>
        <Link href="/dashboard/drip" className="card hover:border-primary-500/50 transition-all text-center group">
          <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">📧</span>
          <p className="font-semibold text-white">Drip Campaigns</p>
          <p className="text-xs text-gray-400">Re-engage leads</p>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Leads</p>
              <p className="text-2xl font-bold text-white">{stats.totalLeads}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Hot Leads</p>
              <p className="text-2xl font-bold text-green-400">{stats.hotLeads}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Cold Leads</p>
              <p className="text-2xl font-bold text-blue-400">{stats.coldLeads}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-2xl">❄️</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">This Week</p>
              <p className="text-2xl font-bold text-purple-400">{getUpcomingAppointments().length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span>📅</span> Upcoming Appointments
            </h3>
            <Link href="/dashboard/appointments" className="text-primary-400 text-sm hover:underline">
              View All →
            </Link>
          </div>
          {getUpcomingAppointments().length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <span className="text-3xl mb-2 block">📭</span>
              <p>No upcoming appointments</p>
              <Link href="/dashboard/appointments" className="text-primary-400 text-sm hover:underline">
                Schedule one →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {getUpcomingAppointments().slice(0, 4).map(apt => (
                <div key={apt.id} className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg">
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs text-gray-400">
                      {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm font-bold text-white">{apt.time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{apt.title}</p>
                    <p className="text-xs text-gray-400 truncate">{apt.client_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span>👥</span> Recent Leads
            </h3>
            <Link href="/dashboard/leads" className="text-primary-400 text-sm hover:underline">
              View All →
            </Link>
          </div>
          {leads.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <span className="text-3xl mb-2 block">👤</span>
              <p>No leads yet</p>
              <Link href="/dashboard/leads" className="text-primary-400 text-sm hover:underline">
                Add your first lead →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.slice(0, 4).map(lead => (
                <div key={lead.id} className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-400">
                      {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{lead.name}</p>
                    <p className="text-xs text-gray-400 truncate">{lead.type || 'Lead'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    lead.status === 'hot' ? 'bg-green-500/20 text-green-400' :
                    lead.status === 'cold' ? 'bg-blue-500/20 text-blue-400' :
                    lead.status === 'warm' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span>🧰</span> Quick Tools
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <Link href="/dashboard/calculator" className="p-4 bg-dark-bg rounded-lg text-center hover:bg-primary-500/10 transition-all group">
            <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🧮</span>
            <p className="text-xs text-gray-400">Mortgage Calc</p>
          </Link>
          <Link href="/dashboard/investment-calculator" className="p-4 bg-dark-bg rounded-lg text-center hover:bg-primary-500/10 transition-all group">
            <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">📈</span>
            <p className="text-xs text-gray-400">Investment Calc</p>
          </Link>
          <Link href="/dashboard/seller-net-sheet" className="p-4 bg-dark-bg rounded-lg text-center hover:bg-primary-500/10 transition-all group">
            <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">💰</span>
            <p className="text-xs text-gray-400">Seller Net</p>
          </Link>
          <Link href="/dashboard/buyer-costs" className="p-4 bg-dark-bg rounded-lg text-center hover:bg-primary-500/10 transition-all group">
            <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🏠</span>
            <p className="text-xs text-gray-400">Buyer Costs</p>
          </Link>
          <Link href="/dashboard/coach" className="p-4 bg-dark-bg rounded-lg text-center hover:bg-primary-500/10 transition-all group">
            <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🤖</span>
            <p className="text-xs text-gray-400">AI Coach</p>
          </Link>
          <Link href="/dashboard/quick-replies" className="p-4 bg-dark-bg rounded-lg text-center hover:bg-primary-500/10 transition-all group">
            <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">⚡</span>
            <p className="text-xs text-gray-400">Quick Replies</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
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
