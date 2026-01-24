'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// Custom Calendar Date Picker Component
function DatePickerField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (value) setCurrentMonth(new Date(value + 'T00:00:00')) }, [])
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false) }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const prevMonth = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)) }
  const nextMonth = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)) }
  const selectDate = (day: number) => { onChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0]); setIsOpen(false) }
  const formatDisplayDate = (dateStr: string) => !dateStr ? 'Select date' : new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const todayStr = new Date().toISOString().split('T')[0]

  const renderDays = () => {
    const days = []
    for (let i = 0; i < firstDayOfMonth(currentMonth); i++) days.push(<div key={`empty-${i}`} className="w-10 h-10" />)
    for (let day = 1; day <= daysInMonth(currentMonth); day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push(
        <button key={day} type="button" onClick={(e) => { e.stopPropagation(); selectDate(day) }}
          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all flex items-center justify-center ${value === dateStr ? 'bg-gradient-to-br from-primary-500 to-[#B8960C] text-dark-bg shadow-lg' : dateStr === todayStr ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50' : 'text-white hover:bg-white/10'}`}
        >{day}</button>
      )
    }
    return days
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-left flex items-center justify-between hover:border-primary-500/50">
        <span className={value ? 'text-white' : 'text-gray-500'}>{formatDisplayDate(value)}</span><span className="text-xl">📅</span>
      </button>
      {isOpen && (
        <div className="absolute z-[100] mt-2 left-0 right-0">
          <div className="p-5 rounded-2xl border border-primary-500/20 shadow-2xl" style={{ background: 'linear-gradient(145deg, rgba(30,30,30,0.98) 0%, rgba(15,15,15,0.99) 100%)' }}>
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevMonth} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/70 text-lg">‹</button>
              <span className="font-playfair text-white text-lg">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
              <button type="button" onClick={nextMonth} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/70 text-lg">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">{dayNames.map(d => <div key={d} className="w-10 h-8 flex items-center justify-center text-xs text-primary-400 font-semibold">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(todayStr); setIsOpen(false) }} className="flex-1 py-2.5 text-sm font-semibold bg-primary-500/20 text-primary-400 rounded-xl">Today</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false) }} className="flex-1 py-2.5 text-sm font-semibold bg-white/5 text-gray-400 rounded-xl">Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OpenHousePage() {
  const [propertyAddress, setPropertyAddress] = useState('')
  const [openHouseDate, setOpenHouseDate] = useState('')
  const [visitors, setVisitors] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', hasAgent: false, agentName: '', source: '', notes: '' })

  const sourceOptions = ['Zillow', 'Realtor.com', 'Sign', 'Drive By', 'Referral', 'Social Media', 'Other']

  useEffect(() => {
    const savedAddress = localStorage.getItem('repal_openhouse_address')
    const savedDate = localStorage.getItem('repal_openhouse_date')
    const savedVisitors = localStorage.getItem('repal_openhouse_visitors')
    if (savedAddress) setPropertyAddress(savedAddress)
    if (savedDate) setOpenHouseDate(savedDate)
    if (savedVisitors) setVisitors(JSON.parse(savedVisitors))
  }, [])

  useEffect(() => {
    localStorage.setItem('repal_openhouse_address', propertyAddress)
    localStorage.setItem('repal_openhouse_date', openHouseDate)
    localStorage.setItem('repal_openhouse_visitors', JSON.stringify(visitors))
  }, [propertyAddress, openHouseDate, visitors])

  const saveVisitor = () => {
    if (!formData.name) return alert('Please enter visitor name')
    setVisitors([...visitors, { ...formData, id: Date.now(), signInTime: new Date().toISOString() }])
    setFormData({ name: '', email: '', phone: '', hasAgent: false, agentName: '', source: '', notes: '' })
    setShowForm(false)
  }

  const deleteVisitor = (id: number) => { if (confirm('Remove this visitor?')) setVisitors(visitors.filter(v => v.id !== id)) }
  const clearAll = () => { if (confirm('Clear all visitors? This cannot be undone.')) setVisitors([]) }

  const exportToLeads = () => {
    const unrepresented = visitors.filter(v => !v.hasAgent)
    if (unrepresented.length === 0) return alert('No unrepresented visitors to export')
    const existingLeads = JSON.parse(localStorage.getItem('repal_leads') || '[]')
    const newLeads = unrepresented.map(v => ({
      id: Date.now() + Math.random(),
      name: v.name, email: v.email, phone: v.phone,
      type: 'buyer', status: 'new', priority: 5,
      notes: `From Open House at ${propertyAddress} on ${openHouseDate}\nSource: ${v.source || 'Open House'}\n${v.notes || ''}`,
      createdAt: new Date().toISOString()
    }))
    localStorage.setItem('repal_leads', JSON.stringify([...existingLeads, ...newLeads]))
    alert(`${newLeads.length} leads exported!`)
  }

  const unrepresentedCount = visitors.filter(v => !v.hasAgent).length

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">🏡 Open House Sign-In</h1>
          <p className="text-gray-400 text-sm">Digital visitor registration</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ Add Visitor</button>
        </div>
      </div>

      {/* Property Info */}
      <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-5 border border-dark-border mb-6">
        <h3 className="text-primary-400 font-semibold mb-4 text-sm">🏠 Property Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Property Address</label>
            <input type="text" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} placeholder="123 Main St, City, ST 12345" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
          </div>
          <DatePickerField label="Open House Date" value={openHouseDate} onChange={setOpenHouseDate} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-white">{visitors.length}</span>
          <p className="text-xs text-gray-400 mt-1">Total Visitors</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-[#4A9B7F]">{unrepresentedCount}</span>
          <p className="text-xs text-gray-400 mt-1">Unrepresented</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-[#6B8DD6]">{visitors.length - unrepresentedCount}</span>
          <p className="text-xs text-gray-400 mt-1">With Agent</p>
        </div>
      </div>

      {/* Action Buttons */}
      {visitors.length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          <button onClick={exportToLeads} className="px-4 py-2.5 text-sm font-semibold bg-[#4A9B7F] text-white rounded-lg hover:bg-[#3d8268] transition-colors">
            📤 Export {unrepresentedCount} to Leads
          </button>
          <button onClick={clearAll} className="px-4 py-2.5 text-sm font-semibold bg-[#E74C3C]/20 text-[#E74C3C] rounded-lg hover:bg-[#E74C3C]/30 transition-colors">
            🗑️ Clear All
          </button>
        </div>
      )}

      {/* Visitor List */}
      <div className="space-y-3">
        {visitors.length === 0 ? (
          <div className="text-center py-16"><span className="text-5xl mb-4 block">🏡</span><p className="text-gray-400">No visitors yet. Start signing in guests!</p></div>
        ) : (
          visitors.map(visitor => (
            <div key={visitor.id} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border hover:border-primary-500/30 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{visitor.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${visitor.hasAgent ? 'bg-[#6B8DD6] text-white' : 'bg-[#4A9B7F] text-white'}`}>
                      {visitor.hasAgent ? 'Has Agent' : 'Unrepresented'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                    {visitor.phone && <span>📱 {visitor.phone}</span>}
                    {visitor.email && <span>✉️ {visitor.email}</span>}
                    {visitor.source && <span>📍 {visitor.source}</span>}
                  </div>
                  {visitor.hasAgent && visitor.agentName && <p className="text-xs text-gray-500 mt-1">Agent: {visitor.agentName}</p>}
                  <p className="text-xs text-gray-600 mt-1">Signed in: {new Date(visitor.signInTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                </div>
                <button onClick={() => deleteVisitor(visitor.id)} className="text-gray-500 hover:text-[#E74C3C]">🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Visitor Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-lg w-full border border-dark-border">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">Visitor Sign-In</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">How did you hear about us?</label>
                <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                  <option value="">Select...</option>
                  {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="hasAgent" checked={formData.hasAgent} onChange={(e) => setFormData({ ...formData, hasAgent: e.target.checked })} className="w-5 h-5 rounded" />
                <label htmlFor="hasAgent" className="text-sm text-gray-400">Currently working with an agent?</label>
              </div>
              {formData.hasAgent && (
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Agent Name</label>
                  <input type="text" value={formData.agentName} onChange={(e) => setFormData({ ...formData, agentName: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-semibold text-gray-400 border border-dark-border rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={saveVisitor} className="px-6 py-3 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">Sign In</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
