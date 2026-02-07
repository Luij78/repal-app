'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'

interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: string
  type: string
  source: string
  priority: number | null
  follow_up_date: string | null
  notes: string | null
  created_at: string
}

interface Appointment {
  id: string
  title: string
  date: string
  time: string
  location: string | null
  type: string
  notes: string | null
}

interface Task {
  id: string
  title: string
  due_date: string | null
  priority: string
  status: string
  description: string | null
}

interface DigestInsight {
  type: 'priority' | 'suggestion' | 'alert' | 'opportunity'
  icon: string
  title: string
  description: string
  action?: string
  link?: string
}

const allTools = [
  { id: 'tasker', title: 'Tasker', icon: '✓', desc: 'Track tasks & to-dos', color: '#27AE60', href: '/dashboard/tasker' },
  { id: 'investment', title: 'Investment Calculator', icon: '📊', desc: 'Analyze ROI, cash flow & cap rates', color: '#D4AF37', href: '/dashboard/investment-calculator', group: 'calculators' },
  { id: 'mortgage', title: 'Mortgage Calculator', icon: '🏦', desc: 'Monthly payment estimator', color: '#2563EB', href: '/dashboard/mortgage-calculator', group: 'calculators' },
  { id: 'expenses', title: 'Expense Tracker', icon: '🧾', desc: 'Track tax-deductible expenses', color: '#E74C3C', href: '/dashboard/expenses', group: 'trackers' },
  { id: 'mileage', title: 'Mileage Tracker', icon: '🚗', desc: 'Log business miles driven', color: '#3498DB', href: '/dashboard/mileage', group: 'trackers' },
  { id: 'coach', title: 'Coach', icon: '🎯', desc: 'Your path to real estate success', color: '#8B5CF6', href: '/dashboard/coach' },
  { id: 'leads', title: 'Lead Manager', icon: '👥', desc: 'Organize contacts & notes', color: '#4A9B7F', href: '/dashboard/leads', group: 'crm' },
  { id: 'appointments', title: 'Appointments', icon: '📅', desc: 'Schedule & track meetings', color: '#6B8DD6', href: '/dashboard/appointments', group: 'crm' },
  { id: 'openhouse', title: 'Open House Sign-In', icon: '🏡', desc: 'Digital sign-in & QR codes', color: '#FF6B6B', href: '/dashboard/openhouse', group: 'crm' },
  { id: 'transactions', title: 'Transaction Tracker', icon: '📋', desc: 'Manage deals to closing', color: '#45B7D1', href: '/dashboard/transactions', group: 'trackers' },
  { id: 'buyercosts', title: 'Buyer Closing Costs', icon: '💵', desc: 'Estimate cash to close', color: '#96CEB4', href: '/dashboard/buyercosts', group: 'calculators' },
  { id: 'dates', title: 'Important Dates', icon: '🎂', desc: 'Birthdays & anniversaries', color: '#FF85A2', href: '/dashboard/dates', group: 'crm' },
  { id: 'seller', title: 'Seller Net Sheet', icon: '🏠', desc: 'Calculate seller proceeds', color: '#C97B63', href: '/dashboard/seller', group: 'calculators' },
  { id: 'commercial', title: 'Triple Net (NNN)', icon: '🏢', desc: 'Commercial lease calculator', color: '#9B59B6', href: '/dashboard/commercial', group: 'calculators' },
  { id: 'templates', title: 'Quick Replies', icon: '⚡', desc: 'One-tap message templates', color: '#F39C12', href: '/dashboard/templates', group: 'comms' },
  { id: 'drip', title: 'Drip Campaign', icon: '📧', desc: 'AI newsletters for cold leads', color: '#4ECDC4', href: '/dashboard/drip', group: 'comms' },
  { id: 'integrations', title: 'Lead Sources', icon: '🔗', desc: 'IDX/MLS, Zillow, Realtor.com & more', color: '#9B59B6', href: '/dashboard/integrations' },
  { id: 'profile', title: 'My Profile', icon: '👤', desc: 'Signature & business card', color: '#E91E63', href: '/dashboard/profile' },
]

const groupTiles = {
  calculators: { id: 'group-calculators', title: 'Calculators', icon: '🧮', desc: 'Investment, Mortgage, Buyer, Seller & Commercial', color: '#D4AF37', tools: ['investment', 'mortgage', 'buyercosts', 'seller', 'commercial'] },
  trackers: { id: 'group-trackers', title: 'Trackers', icon: '📋', desc: 'Expenses, Mileage & Transactions', color: '#E74C3C', tools: ['expenses', 'mileage', 'transactions'] },
  crm: { id: 'group-crm', title: 'CRM Tools', icon: '👥', desc: 'Leads, Appointments, Open House & Dates', color: '#4A9B7F', tools: ['leads', 'appointments', 'openhouse', 'dates'] },
  comms: { id: 'group-comms', title: 'Communications', icon: '💬', desc: 'Quick Replies & Drip Campaigns', color: '#4ECDC4', tools: ['templates', 'drip'] },
}

export default function DashboardPage() {
  const { user } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [digestExpanded, setDigestExpanded] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [customizeMode, setCustomizeMode] = useState(false)
  const [tileOrder, setTileOrder] = useState<string[]>([])
  const [hiddenTiles, setHiddenTiles] = useState<string[]>([])
  const [enabledGroups, setEnabledGroups] = useState<string[]>([])
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [draggedTile, setDraggedTile] = useState<string | null>(null)
  const [dragOverTile, setDragOverTile] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    if (user) loadData()
    const savedOrder = localStorage.getItem('repal_tile_order')
    const savedHidden = localStorage.getItem('repal_hidden_tiles')
    const savedGroups = localStorage.getItem('repal_enabled_groups')
    if (savedOrder) setTileOrder(JSON.parse(savedOrder))
    else setTileOrder(allTools.map(t => t.id))
    if (savedHidden) setHiddenTiles(JSON.parse(savedHidden))
    if (savedGroups) setEnabledGroups(JSON.parse(savedGroups))
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [user])

  useEffect(() => {
    if (tileOrder.length > 0) localStorage.setItem('repal_tile_order', JSON.stringify(tileOrder))
  }, [tileOrder])
  
  useEffect(() => {
    localStorage.setItem('repal_hidden_tiles', JSON.stringify(hiddenTiles))
  }, [hiddenTiles])
  
  useEffect(() => {
    localStorage.setItem('repal_enabled_groups', JSON.stringify(enabledGroups))
  }, [enabledGroups])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    
    // Fetch leads from Supabase
    const { data: leadsData } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
    if (leadsData) setLeads(leadsData)
    
    // Fetch appointments from Supabase
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
    if (appointmentsData) setAppointments(appointmentsData)
    
    // Fetch tasks from Supabase
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
    if (tasksData) setTasks(tasksData)
    
    setLoading(false)
  }

  const handleDragStart = (e: React.DragEvent, tileId: string) => {
    setDraggedTile(tileId)
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleDragOver = (e: React.DragEvent, tileId: string) => {
    e.preventDefault()
    if (tileId !== draggedTile) setDragOverTile(tileId)
  }
  const handleDragLeave = () => setDragOverTile(null)
  const handleDrop = (e: React.DragEvent, targetTileId: string) => {
    e.preventDefault()
    if (draggedTile && targetTileId && draggedTile !== targetTileId) {
      const newOrder = [...tileOrder]
      const draggedIdx = newOrder.indexOf(draggedTile)
      const targetIdx = newOrder.indexOf(targetTileId)
      newOrder.splice(draggedIdx, 1)
      newOrder.splice(targetIdx, 0, draggedTile)
      setTileOrder(newOrder)
    }
    setDraggedTile(null)
    setDragOverTile(null)
  }
  const handleDragEnd = () => { setDraggedTile(null); setDragOverTile(null) }

  const toggleHideTile = (tileId: string) => {
    if (hiddenTiles.includes(tileId)) setHiddenTiles(hiddenTiles.filter(id => id !== tileId))
    else setHiddenTiles([...hiddenTiles, tileId])
  }

  const toggleGroup = (groupKey: string) => {
    if (enabledGroups.includes(groupKey)) setEnabledGroups(enabledGroups.filter(g => g !== groupKey))
    else setEnabledGroups([...enabledGroups, groupKey])
  }

  const resetTiles = () => {
    setTileOrder(allTools.map(t => t.id))
    setHiddenTiles([])
    setEnabledGroups([])
    localStorage.removeItem('repal_tile_order')
    localStorage.removeItem('repal_hidden_tiles')
    localStorage.removeItem('repal_enabled_groups')
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return '🌅 Good Morning'
    if (hour < 17) return '☀️ Good Afternoon'
    return '🌙 Good Evening'
  }

  const today = new Date().toISOString().split('T')[0]

  const getTodayAppointments = () => {
    return appointments.filter(apt => apt.date === today)
  }

  const getLeadsNeedingFollowup = () => {
    // Leads with follow_up_date today or in the past, not closed/lost
    return leads.filter(lead => {
      if (!lead.follow_up_date) return false
      return lead.follow_up_date <= today && lead.status !== 'closed' && lead.status !== 'lost'
    }).sort((a, b) => (a.follow_up_date || '').localeCompare(b.follow_up_date || ''))
  }

  const getHotLeads = () => {
    return leads.filter(lead => (lead.priority || 5) <= 3 && lead.status !== 'closed' && lead.status !== 'lost')
  }

  const getOverdueTasks = () => {
    return tasks.filter(task => task.due_date && task.due_date < today && task.status !== 'completed')
  }

  const generateInsights = (): DigestInsight[] => {
    const insights: DigestInsight[] = []
    const overdueTasks = getOverdueTasks()
    if (overdueTasks.length > 0) {
      insights.push({ type: 'alert', icon: '🚨', title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`, description: overdueTasks.length === 1 ? `"${overdueTasks[0].title}" needs attention` : `Including "${overdueTasks[0].title}" - tackle these first`, action: 'View Tasks', link: '/dashboard/tasker' })
    }
    const todayApts = getTodayAppointments()
    if (todayApts.length > 0) {
      insights.push({ type: 'priority', icon: '📅', title: `${todayApts.length} Appointment${todayApts.length > 1 ? 's' : ''} Today`, description: todayApts.map(apt => `${apt.time} - ${apt.title}`).join(' • '), action: 'View Schedule', link: '/dashboard/appointments' })
    }
    const needFollowup = getLeadsNeedingFollowup()
    if (needFollowup.length > 0) {
      insights.push({ type: 'suggestion', icon: '📞', title: `${needFollowup.length} Lead${needFollowup.length > 1 ? 's' : ''} Need Follow-up`, description: `${needFollowup[0].name} - scheduled for ${needFollowup[0].follow_up_date}`, action: 'View Leads', link: '/dashboard/leads' })
    }
    const hotLeads = getHotLeads()
    if (hotLeads.length > 0) {
      insights.push({ type: 'opportunity', icon: '🔥', title: `${hotLeads.length} Hot Lead${hotLeads.length > 1 ? 's' : ''}`, description: `${hotLeads[0].name} is priority ${hotLeads[0].priority} - reach out today!`, action: 'View Leads', link: '/dashboard/leads' })
    }
    const coldLeads = leads.filter(l => (l.priority || 5) >= 7 && l.status !== 'closed' && l.status !== 'lost')
    if (coldLeads.length >= 5) {
      insights.push({ type: 'opportunity', icon: '📧', title: `${coldLeads.length} Cold Leads to Re-engage`, description: 'A market update newsletter could warm up these leads', action: 'Create Newsletter', link: '/dashboard/drip' })
    }
    return insights
  }

  const insights = generateInsights()
  const stats = { todayAppointments: getTodayAppointments().length, needFollowup: getLeadsNeedingFollowup().length, overdueTasks: getOverdueTasks().length, hotLeads: getHotLeads().length }
  const urgentAlerts = stats.overdueTasks + stats.needFollowup

  const getVisibleTiles = () => {
    const tiles: any[] = []
    const groupedToolIds = new Set<string>()
    enabledGroups.forEach(groupKey => {
      const group = groupTiles[groupKey as keyof typeof groupTiles]
      if (group) {
        group.tools.forEach(id => groupedToolIds.add(id))
        tiles.push({ ...group, isGroup: true, groupKey })
      }
    })
    tileOrder.forEach(id => {
      if (!groupedToolIds.has(id) && !hiddenTiles.includes(id)) {
        const tool = allTools.find(t => t.id === id)
        if (tool) tiles.push({ ...tool, isGroup: false })
      }
    })
    return tiles
  }

  const visibleTiles = getVisibleTiles()

  if (!mounted || loading) {
    return (<div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div><p className="text-gray-400">Loading your dashboard...</p></div></div>)
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="card bg-gradient-to-br from-dark-card to-dark-bg border-primary-500/30 cursor-pointer" onClick={() => setDigestExpanded(!digestExpanded)}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0"><span className="text-xl md:text-2xl">🤖</span></div>
              <div className="min-w-0">
                <h2 className="font-playfair text-base md:text-lg text-primary-400">AI Daily Digest</h2>
                <p className="text-xs md:text-sm text-gray-400 truncate">{getGreeting()}, Agent! Here&apos;s your daily briefing.</p>
              </div>
            </div>
            <span className="text-gray-400 flex-shrink-0 ml-2">{digestExpanded ? '▲' : '▼'}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/dashboard/alerts" onClick={(e) => e.stopPropagation()} className="relative flex items-center gap-1 text-xs bg-primary-500/20 hover:bg-primary-500/30 px-2.5 py-1.5 rounded-full transition-all"><span>🔔</span><span className="text-primary-400">AI Alerts</span>{urgentAlerts > 0 && (<span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{urgentAlerts}</span>)}</Link>
            <Link href="/dashboard/smart-tasks" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-xs bg-green-500/20 hover:bg-green-500/30 px-2.5 py-1.5 rounded-full transition-all"><span>🧠</span><span className="text-green-400">Smart Tasks</span></Link>
          </div>
        </div>
        {digestExpanded && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-dark-bg/50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-white">{stats.todayAppointments}</p><p className="text-xs text-gray-400">Today's Appts</p></div>
              <Link href="/dashboard/leads?filter=followup" onClick={(e) => e.stopPropagation()} className="bg-dark-bg/50 rounded-lg p-3 text-center hover:bg-dark-bg/80 transition-colors"><p className="text-2xl font-bold text-yellow-400">{stats.needFollowup}</p><p className="text-xs text-gray-400">Need Follow-up</p></Link>
              <Link href="/dashboard/tasker" onClick={(e) => e.stopPropagation()} className="bg-dark-bg/50 rounded-lg p-3 text-center hover:bg-dark-bg/80 transition-colors"><p className="text-2xl font-bold text-red-400">{stats.overdueTasks}</p><p className="text-xs text-gray-400">Overdue Tasks</p></Link>
              <Link href="/dashboard/leads?filter=hot" onClick={(e) => e.stopPropagation()} className="bg-dark-bg/50 rounded-lg p-3 text-center hover:bg-dark-bg/80 transition-colors"><p className="text-2xl font-bold text-green-400">{stats.hotLeads}</p><p className="text-xs text-gray-400">Hot Leads</p></Link>
            </div>
            {insights.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2"><span>💡</span> AI Suggestions</h3>
                <div className="flex flex-col gap-2">
                  {insights.map((insight, index) => (
                    <Link key={index} href={insight.link || '#'} onClick={(e) => e.stopPropagation()} className={`flex items-center gap-3 p-3 rounded-lg transition-all w-full ${insight.type === 'alert' ? 'bg-red-500/10 border border-red-500/30 hover:border-red-500/50' : insight.type === 'priority' ? 'bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50' : insight.type === 'opportunity' ? 'bg-green-500/10 border border-green-500/30 hover:border-green-500/50' : 'bg-dark-bg/50 border border-dark-border hover:border-primary-500/50'}`}>
                      <span className="text-xl flex-shrink-0">{insight.icon}</span>
                      <div className="flex-1 min-w-0"><p className="font-medium text-white text-sm">{insight.title}</p><p className="text-xs text-gray-400 truncate">{insight.description}</p></div>
                      {insight.action && <span className="text-xs text-primary-400 whitespace-nowrap flex-shrink-0">{insight.action} →</span>}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center"><span className="text-2xl mb-2 block">✨</span><p className="text-green-400 font-medium">You're all caught up!</p><p className="text-gray-400 text-sm">No urgent items. Great job staying on top of things!</p></div>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-playfair text-xl md:text-2xl text-white">Tools & Calculators</h2>
          <div className="flex items-center gap-2">
            {customizeMode ? (
              <><button onClick={resetTiles} className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">Reset</button><button onClick={() => setCustomizeMode(false)} className="px-3 py-1.5 text-sm bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors font-semibold">Done</button></>
            ) : (
              <button onClick={() => setCustomizeMode(true)} className="px-3 py-1.5 text-sm bg-dark-card text-gray-400 rounded-lg hover:bg-dark-border hover:text-white transition-colors flex items-center gap-1.5"><span>⚙️</span> Customize</button>
            )}
          </div>
        </div>

        {customizeMode && (
          <div className="mb-6 p-4 bg-dark-card rounded-xl border border-dark-border space-y-4">
            <p className="text-sm text-gray-400">🎯 Drag tiles to rearrange • Click ✕ to hide • Toggle groups below</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(groupTiles).map(([key, group]) => (
                <button key={key} onClick={() => toggleGroup(key)} className={`p-3 rounded-lg border text-left transition-all ${enabledGroups.includes(key) ? 'bg-primary-500/20 border-primary-500' : 'bg-dark-bg border-dark-border hover:border-gray-600'}`}>
                  <div className="flex items-center gap-2 mb-1"><span>{group.icon}</span><span className={`text-sm font-semibold ${enabledGroups.includes(key) ? 'text-primary-400' : 'text-white'}`}>{group.title}</span></div>
                  <p className="text-xs text-gray-500">{group.tools.length} tools</p>
                </button>
              ))}
            </div>
            {hiddenTiles.length > 0 && (
              <div><p className="text-xs text-gray-500 mb-2">Hidden tiles:</p><div className="flex flex-wrap gap-2">{hiddenTiles.map(id => { const tool = allTools.find(t => t.id === id); return tool ? (<button key={id} onClick={() => toggleHideTile(id)} className="px-3 py-1.5 text-sm bg-dark-bg rounded-lg border border-dark-border hover:border-primary-500 flex items-center gap-1.5 transition-colors"><span>+</span> <span>{tool.icon}</span> <span className="text-gray-400">{tool.title}</span></button>) : null })}</div></div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visibleTiles.map((tile) => (
            tile.isGroup ? (
              <div key={tile.id} className="relative">
                <div onClick={() => setExpandedGroup(expandedGroup === tile.groupKey ? null : tile.groupKey)} className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer ${expandedGroup === tile.groupKey ? 'ring-2 ring-primary-500' : 'hover:-translate-y-2 hover:shadow-2xl'}`} style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #1F1F1F 100%)', border: '1px solid #2A2A2A' }}>
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: tile.color }} />
                  {customizeMode && (<button onClick={(e) => { e.stopPropagation(); toggleGroup(tile.groupKey); }} className="absolute top-3 right-3 w-6 h-6 bg-red-500/20 hover:bg-red-500/40 rounded-full flex items-center justify-center text-red-400 text-sm transition-colors">✕</button>)}
                  <span className="text-3xl mb-3 block">{tile.icon}</span>
                  <h3 className="font-playfair text-lg mb-2 text-white">{tile.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed pr-6">{tile.desc}</p>
                  <span className="absolute bottom-5 right-5 text-primary-500 text-xl">{expandedGroup === tile.groupKey ? '▲' : '▼'}</span>
                </div>
                {expandedGroup === tile.groupKey && (
                  <div className="mt-2 p-3 bg-dark-card rounded-xl border border-primary-500/30 space-y-2">
                    {tile.tools.map((toolId: string) => { const tool = allTools.find(t => t.id === toolId); return tool ? (<Link key={toolId} href={tool.href} className="flex items-center gap-3 p-3 rounded-lg bg-dark-bg hover:bg-dark-border transition-colors"><span className="text-xl">{tool.icon}</span><div className="flex-1"><p className="text-white text-sm font-medium">{tool.title}</p><p className="text-xs text-gray-500">{tool.desc}</p></div><span className="text-primary-500">→</span></Link>) : null })}
                  </div>
                )}
              </div>
            ) : (
              <div key={tile.id} draggable={customizeMode} onDragStart={(e) => handleDragStart(e, tile.id)} onDragOver={(e) => handleDragOver(e, tile.id)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, tile.id)} onDragEnd={handleDragEnd} className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${customizeMode ? 'cursor-grab active:cursor-grabbing' : 'hover:-translate-y-2 hover:shadow-2xl'}`} style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #1F1F1F 100%)', border: dragOverTile === tile.id ? '2px dashed #D4AF37' : '1px solid #2A2A2A', opacity: draggedTile === tile.id ? 0.5 : 1, transform: dragOverTile === tile.id ? 'scale(1.02)' : undefined }}>
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: tile.color }} />
                {customizeMode && (<button onClick={() => toggleHideTile(tile.id)} className="absolute top-3 right-3 w-6 h-6 bg-red-500/20 hover:bg-red-500/40 rounded-full flex items-center justify-center text-red-400 text-sm transition-colors z-10">✕</button>)}
                <Link href={tile.href} className={customizeMode ? 'pointer-events-none' : ''}>
                  <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{tile.icon}</span>
                  <h3 className="font-playfair text-lg mb-2 text-white group-hover:text-primary-400 transition-colors">{tile.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed pr-6">{tile.desc}</p>
                  {!customizeMode && <span className="absolute bottom-5 right-5 text-primary-500 text-xl opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>}
                </Link>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )
}
