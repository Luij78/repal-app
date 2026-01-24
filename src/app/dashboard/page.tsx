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
      return dueDate && dueDate < today && !isCompleted
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
                <p className="text-xs text-gray-400">Today&apos;s Appts</p>
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
                <p className="text-green-400 font-medium">You&apos;re all caught up!</p>
                <p className="text-gray-400 text-sm">No urgent items. Great job staying on top of things!</p>
              </div>
            )}

            {/* Today's Schedule Preview */}
            {getTodayAppointments().length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                  <span>📅</span> Today&apos;s Schedule
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
