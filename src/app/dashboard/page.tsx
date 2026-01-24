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
  due_date: string
  priority: string
  status: string
  related_to: string
}

interface DigestInsight {
  type: 'priority' | 'suggestion' | 'alert' | 'opportunity'
  icon: string
  title: string
  description: string
  action?: string
  link?: string
}

// Tools & Calculators tiles (from HTML prototype)
const defaultTiles = [
  { id: 'tasker', title: 'Tasker', icon: '✓', desc: 'Track tasks & to-dos', color: '#27AE60', href: '/dashboard/tasker' },
  { id: 'investment', title: 'Investment Calculator', icon: '📊', desc: 'Analyze ROI, cash flow & cap rates', color: '#D4AF37', href: '/dashboard/investment-calculator' },
  { id: 'mortgage', title: 'Mortgage Calculator', icon: '🏦', desc: 'Monthly payment estimator', color: '#2563EB', href: '/dashboard/mortgage-calculator' },
  { id: 'expenses', title: 'Expense Tracker', icon: '🧾', desc: 'Track tax-deductible expenses', color: '#E74C3C', href: '/dashboard/expenses' },
  { id: 'mileage', title: 'Mileage Tracker', icon: '🚗', desc: 'Log business miles driven', color: '#3498DB', href: '/dashboard/mileage' },
  { id: 'coach', title: 'Coach', icon: '🎯', desc: 'Your path to real estate success', color: '#8B5CF6', href: '/dashboard/coach' },
  { id: 'leads', title: 'Lead Manager', icon: '👥', desc: 'Organize contacts & notes', color: '#4A9B7F', href: '/dashboard/leads' },
  { id: 'appointments', title: 'Appointments', icon: '📅', desc: 'Schedule & track meetings', color: '#6B8DD6', href: '/dashboard/appointments' },
  { id: 'openhouse', title: 'Open House Sign-In', icon: '🏡', desc: 'Digital sign-in & QR codes', color: '#FF6B6B', href: '/dashboard/openhouse' },
  { id: 'transactions', title: 'Transaction Tracker', icon: '📋', desc: 'Manage deals to closing', color: '#45B7D1', href: '/dashboard/transactions' },
  { id: 'buyercosts', title: 'Buyer Closing Costs', icon: '💵', desc: 'Estimate cash to close', color: '#96CEB4', href: '/dashboard/buyercosts' },
  { id: 'dates', title: 'Important Dates', icon: '🎂', desc: 'Birthdays & anniversaries', color: '#FF85A2', href: '/dashboard/dates' },
  { id: 'seller', title: 'Seller Net Sheet', icon: '🏠', desc: 'Calculate seller proceeds', color: '#C97B63', href: '/dashboard/seller' },
  { id: 'commercial', title: 'Triple Net (NNN)', icon: '🏢', desc: 'Commercial lease calculator', color: '#9B59B6', href: '/dashboard/commercial' },
  { id: 'templates', title: 'Quick Replies', icon: '⚡', desc: 'One-tap message templates', color: '#F39C12', href: '/dashboard/templates' },
  { id: 'drip', title: 'Drip Campaign', icon: '📧', desc: 'AI newsletters for cold leads', color: '#4ECDC4', href: '/dashboard/drip' },
  { id: 'integrations', title: 'Lead Sources', icon: '🔗', desc: 'IDX/MLS, Zillow, Realtor.com & more', color: '#9B59B6', href: '/dashboard/integrations' },
  { id: 'profile', title: 'My Profile', icon: '👤', desc: 'Signature & business card', color: '#E91E63', href: '/dashboard/profile' },
]

export default function DashboardPage() {
  const { user } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [digestExpanded, setDigestExpanded] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [tileOrder, setTileOrder] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      loadData()
    }
    
    // Load tile order
    const savedOrder = localStorage.getItem('repal_tile_order')
    if (savedOrder) {
      setTileOrder(JSON.parse(savedOrder))
    } else {
      setTileOrder(defaultTiles.map(t => t.id))
    }
    
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [user])

  const loadData = () => {
    if (!user) return
    setLoading(true)
    
    const savedLeads = localStorage.getItem(`leads_${user.id}`)
    if (savedLeads) setLeads(JSON.parse(savedLeads))
    
    const savedAppointments = localStorage.getItem(`appointments_${user.id}`)
    if (savedAppointments) setAppointments(JSON.parse(savedAppointments))
    
    const savedTasks = localStorage.getItem(`tasks_${user.id}`)
    if (savedTasks) setTasks(JSON.parse(savedTasks))
    
    setLoading(false)
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return '🌅 Good Morning'
    if (hour < 17) return '☀️ Good Afternoon'
    return '🌙 Good Evening'
  }

  const daysSinceContact = (dateStr: string) => {
    if (!dateStr) return 999
    const date = new Date(dateStr)
    const now = new Date()
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => apt.date === today)
  }

  const getLeadsNeedingFollowup = () => {
    return leads.filter(lead => {
      const days = daysSinceContact(lead.last_contact)
      return days >= 14 && lead.status !== 'closed' && lead.status !== 'lost'
    }).sort((a, b) => daysSinceContact(b.last_contact) - daysSinceContact(a.last_contact))
  }

  const getOverdueTasks = () => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.filter(task => task.due_date < today && task.status !== 'completed')
  }

  const generateInsights = (): DigestInsight[] => {
    const insights: DigestInsight[] = []
    
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
        link: '/dashboard/tasker'
      })
    }

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

    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 7)
    const newLeads = leads.filter(l => new Date(l.created_at) >= thisWeek)
    if (newLeads.length > 0) {
      insights.push({
        type: 'opportunity',
        icon: '🌟',
        title: `${newLeads.length} New Lead${newLeads.length > 1 ? 's' : ''} This Week`,
        description: 'Strike while the iron is hot!',
        action: 'View New Leads',
        link: '/dashboard/leads'
      })
    }

    return insights
  }

  const insights = generateInsights()

  const stats = {
    todayAppointments: getTodayAppointments().length,
    needFollowup: getLeadsNeedingFollowup().length,
    overdueTasks: getOverdueTasks().length,
    hotLeads: leads.filter(l => l.status === 'hot').length
  }

  // Get ordered tiles
  const orderedTiles = tileOrder
    .map(id => defaultTiles.find(t => t.id === id))
    .filter(Boolean) as typeof defaultTiles
  
  defaultTiles.forEach(t => {
    if (!tileOrder.includes(t.id)) {
      orderedTiles.push(t)
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* ========================================== */}
      {/* AI DAILY DIGEST                           */}
      {/* ========================================== */}
      <div 
        className="card bg-gradient-to-br from-dark-card to-dark-bg border-primary-500/30 cursor-pointer"
        onClick={() => setDigestExpanded(!digestExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="font-playfair text-lg text-primary-400">AI Daily Digest</h2>
              <p className="text-sm text-gray-400">
                {getGreeting()}, {user?.firstName || 'Agent'}! Here's your daily briefing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/dashboard/alerts"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs bg-primary-500/20 hover:bg-primary-500/30 px-2 py-1 rounded-full transition-all"
            >
              <span>🔔</span>
              <span className="text-primary-400">AI Alerts</span>
              {(stats.overdueTasks + stats.needFollowup) > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5">
                  {stats.overdueTasks + stats.needFollowup}
                </span>
              )}
            </Link>
            <Link 
              href="/dashboard/smart-tasks"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs bg-green-500/20 hover:bg-green-500/30 px-2 py-1 rounded-full transition-all"
            >
              <span>🧠</span>
              <span className="text-green-400">Smart Tasks</span>
            </Link>
            <span className="text-gray-400">{digestExpanded ? '▲' : '▼'}</span>
          </div>
        </div>

        {digestExpanded && (
          <div className="mt-6 space-y-4">
            {/* Quick Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-dark-bg/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-white">{stats.todayAppointments}</p>
                <p className="text-xs text-gray-400">Today's Appts</p>
              </div>
              <div className="bg-dark-bg/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-400">{stats.needFollowup}</p>
                <p className="text-xs text-gray-400">Need Follow-up</p>
              </div>
              <div className="bg-dark-bg/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-400">{stats.overdueTasks}</p>
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
                      onClick={(e) => e.stopPropagation()}
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

      {/* ========================================== */}
      {/* TOOLS & CALCULATORS - PROTOTYPE TILES     */}
      {/* ========================================== */}
      <div>
        <h2 className="font-playfair text-xl md:text-2xl mb-6 text-white flex items-center gap-3">
          Tools & Calculators 
          <span className="text-xs font-normal text-gray-500">
            Drag to rearrange
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {orderedTiles.map((tile, idx) => (
            <Link 
              key={tile.id}
              href={tile.href}
              className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #1A1A1A 0%, #1F1F1F 100%)',
                border: '1px solid #2A2A2A',
                animation: `fadeInUp 0.5s ease forwards`,
                animationDelay: `${idx * 0.05}s`,
                opacity: 0
              }}
            >
              {/* Top colored accent bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: tile.color }}
              />
              
              {/* Icon */}
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">
                {tile.icon}
              </span>
              
              {/* Title */}
              <h3 className="font-playfair text-lg mb-2 text-white group-hover:text-primary-400 transition-colors">
                {tile.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-400 leading-relaxed pr-6">
                {tile.desc}
              </p>
              
              {/* Arrow */}
              <span className="absolute bottom-5 right-5 text-primary-500 text-xl opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Keyframe animation for tiles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
