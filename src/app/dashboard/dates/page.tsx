'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ImportantDatesPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [filter, setFilter] = useState('upcoming')

  useEffect(() => {
    const saved = localStorage.getItem('repal_leads')
    if (saved) setLeads(JSON.parse(saved))
  }, [])

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const getUpcomingDates = () => {
    const dates: any[] = []
    
    leads.forEach(lead => {
      if (lead.birthday) {
        const bday = new Date(lead.birthday + 'T00:00:00')
        const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
        const nextYear = new Date(today.getFullYear() + 1, bday.getMonth(), bday.getDate())
        const upcomingBday = thisYear >= today ? thisYear : nextYear
        const daysUntil = Math.ceil((upcomingBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        dates.push({
          id: `bday-${lead.id}`,
          leadId: lead.id,
          name: lead.name,
          type: 'birthday',
          icon: '🎂',
          date: upcomingBday,
          daysUntil,
          email: lead.email,
          phone: lead.phone
        })
      }
      
      if (lead.homeAnniversary) {
        const anniv = new Date(lead.homeAnniversary + 'T00:00:00')
        const thisYear = new Date(today.getFullYear(), anniv.getMonth(), anniv.getDate())
        const nextYear = new Date(today.getFullYear() + 1, anniv.getMonth(), anniv.getDate())
        const upcomingAnniv = thisYear >= today ? thisYear : nextYear
        const daysUntil = Math.ceil((upcomingAnniv.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const years = today.getFullYear() - anniv.getFullYear() + (upcomingAnniv > thisYear ? 1 : 0)
        
        dates.push({
          id: `anniv-${lead.id}`,
          leadId: lead.id,
          name: lead.name,
          type: 'anniversary',
          icon: '🏠',
          date: upcomingAnniv,
          daysUntil,
          years,
          email: lead.email,
          phone: lead.phone
        })
      }
    })
    
    return dates.sort((a, b) => a.daysUntil - b.daysUntil)
  }

  const allDates = getUpcomingDates()
  const thisWeek = allDates.filter(d => d.daysUntil <= 7)
  const thisMonth = allDates.filter(d => d.daysUntil <= 30)

  const filteredDates = filter === 'week' ? thisWeek : filter === 'month' ? thisMonth : allDates

  const getDaysUntilColor = (days: number) => {
    if (days === 0) return '#E74C3C'
    if (days <= 3) return '#F39C12'
    if (days <= 7) return '#D4AF37'
    return '#4A9B7F'
  }

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">🎂 Important Dates</h1>
          <p className="text-gray-400 text-sm">Never miss a birthday or home anniversary</p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center cursor-pointer hover:border-primary-500/30 transition-all" onClick={() => setFilter('week')}>
          <span className="text-2xl font-bold text-[#F39C12]">{thisWeek.length}</span>
          <p className="text-xs text-gray-400 mt-1">This Week</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center cursor-pointer hover:border-primary-500/30 transition-all" onClick={() => setFilter('month')}>
          <span className="text-2xl font-bold text-primary-400">{thisMonth.length}</span>
          <p className="text-xs text-gray-400 mt-1">This Month</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center cursor-pointer hover:border-primary-500/30 transition-all" onClick={() => setFilter('upcoming')}>
          <span className="text-2xl font-bold text-[#4A9B7F]">{allDates.length}</span>
          <p className="text-xs text-gray-400 mt-1">All Upcoming</p>
        </div>
      </div>

      {/* Alert for This Week */}
      {thisWeek.length > 0 && filter !== 'week' && (
        <div className="mb-6 p-4 bg-[#F39C12]/10 rounded-xl border border-[#F39C12]/30">
          <h3 className="text-[#F39C12] font-semibold mb-2">⚡ {thisWeek.length} Coming Up This Week!</h3>
          <div className="flex gap-2 flex-wrap">
            {thisWeek.slice(0, 3).map(d => (
              <span key={d.id} className="px-3 py-1 bg-[#F39C12]/20 text-[#F39C12] rounded-lg text-sm">
                {d.icon} {d.name.split(' ')[0]} • {d.daysUntil === 0 ? 'Today!' : `${d.daysUntil}d`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ key: 'upcoming', label: 'All Upcoming' }, { key: 'week', label: 'This Week' }, { key: 'month', label: 'This Month' }].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === f.key ? 'bg-primary-500 text-dark-bg' : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Dates List */}
      <div className="space-y-3">
        {filteredDates.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🎂</span>
            <p className="text-gray-400">No upcoming dates. Add birthdays and anniversaries to your leads!</p>
            <Link href="/dashboard/leads" className="inline-block mt-4 px-4 py-2 bg-primary-500 text-dark-bg rounded-lg text-sm font-semibold hover:bg-primary-400 transition-colors">
              Go to Leads →
            </Link>
          </div>
        ) : (
          filteredDates.map(d => (
            <div key={d.id} className="flex items-center gap-4 bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border hover:border-primary-500/30 transition-all">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: d.type === 'birthday' ? '#9B59B6' + '30' : '#4A9B7F' + '30' }}>
                {d.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-medium text-white">{d.name}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold capitalize" style={{ backgroundColor: d.type === 'birthday' ? '#9B59B6' : '#4A9B7F', color: '#fff' }}>
                    {d.type === 'birthday' ? 'Birthday' : `${d.years} Year${d.years > 1 ? 's' : ''}`}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {d.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>

              {/* Days Until */}
              <div className="text-center flex-shrink-0">
                <span className="text-xl font-bold" style={{ color: getDaysUntilColor(d.daysUntil) }}>
                  {d.daysUntil === 0 ? '🎉' : d.daysUntil}
                </span>
                <p className="text-xs text-gray-500">{d.daysUntil === 0 ? 'Today!' : d.daysUntil === 1 ? 'Tomorrow' : 'days'}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                {d.phone && <a href={`sms:${d.phone}`} className="w-10 h-10 rounded-lg bg-[#4ECDC4]/20 flex items-center justify-center text-lg hover:bg-[#4ECDC4]/30 transition-colors">💬</a>}
                {d.email && <a href={`mailto:${d.email}?subject=Happy ${d.type === 'birthday' ? 'Birthday' : 'Home Anniversary'}!`} className="w-10 h-10 rounded-lg bg-[#6B8DD6]/20 flex items-center justify-center text-lg hover:bg-[#6B8DD6]/30 transition-colors">✉️</a>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
