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

export default function MileagePage() {
  const [trips, setTrips] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [formData, setFormData] = useState({ purpose: 'showing', date: '', startLocation: '', endLocation: '', miles: '', notes: '' })

  const IRS_RATE = 0.67 // 2024 IRS rate

  const tripTypes = [
    { id: 'showing', name: 'Property Showing', icon: '🏠' },
    { id: 'listing', name: 'Listing Appointment', icon: '🏷️' },
    { id: 'closing', name: 'Closing', icon: '🔑' },
    { id: 'meeting', name: 'Client Meeting', icon: '🤝' },
    { id: 'networking', name: 'Networking Event', icon: '👥' },
    { id: 'training', name: 'Training/Education', icon: '📚' },
    { id: 'office', name: 'Office Visit', icon: '🏢' },
    { id: 'other', name: 'Other Business', icon: '📋' }
  ]

  useEffect(() => { const saved = localStorage.getItem('repal_mileage'); if (saved) setTrips(JSON.parse(saved)) }, [])
  useEffect(() => { localStorage.setItem('repal_mileage', JSON.stringify(trips)) }, [trips])

  const saveTrip = () => {
    if (!formData.miles || !formData.date) return alert('Please enter miles and date')
    setTrips([...trips, { ...formData, id: Date.now(), miles: parseFloat(formData.miles) }])
    setFormData({ purpose: 'showing', date: '', startLocation: '', endLocation: '', miles: '', notes: '' })
    setShowForm(false)
  }

  const deleteTrip = (id: number) => { if (confirm('Delete this trip?')) setTrips(trips.filter(t => t.id !== id)) }

  const filteredTrips = trips.filter(t => t.date && new Date(t.date).getFullYear().toString() === filterYear)
  const totalMiles = filteredTrips.reduce((sum, t) => sum + (t.miles || 0), 0)
  const totalDeduction = totalMiles * IRS_RATE

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">🚗 Mileage Tracker</h1>
          <p className="text-gray-400 text-sm">Track business miles for tax deductions</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ Log Trip</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-white">{totalMiles.toLocaleString()}</span>
          <p className="text-xs text-gray-400 mt-1">Total Miles</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-[#4A9B7F]">${totalDeduction.toLocaleString()}</span>
          <p className="text-xs text-gray-400 mt-1">Tax Deduction</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-primary-400">{filteredTrips.length}</span>
          <p className="text-xs text-gray-400 mt-1">Trips Logged</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30 text-sm text-blue-400">
        💡 2024 IRS Standard Mileage Rate: <span className="font-bold">${IRS_RATE}/mile</span>
      </div>

      <div className="flex gap-3 mb-6">
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
          {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-16"><span className="text-5xl mb-4 block">🚗</span><p className="text-gray-400">No trips logged.</p></div>
        ) : (
          filteredTrips.map(trip => (
            <div key={trip.id} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border hover:border-primary-500/30 transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tripTypes.find(t => t.id === trip.purpose)?.icon || '🚗'}</span>
                  <div>
                    <h3 className="font-medium text-white">{tripTypes.find(t => t.id === trip.purpose)?.name || trip.purpose}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{new Date(trip.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      {trip.startLocation && trip.endLocation && <span>• {trip.startLocation} → {trip.endLocation}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-lg font-bold text-white">{trip.miles} mi</span>
                    <p className="text-xs text-[#4A9B7F]">${(trip.miles * IRS_RATE).toFixed(2)}</p>
                  </div>
                  <button onClick={() => deleteTrip(trip.id)} className="text-gray-500 hover:text-[#E74C3C]">🗑️</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-lg w-full border border-dark-border">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">Log Trip</h2>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Purpose</label>
                  <select value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                    {tripTypes.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                  </select>
                </div>
                <DatePickerField label="Date *" value={formData.date} onChange={(v) => setFormData({ ...formData, date: v })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Start Location</label>
                  <input type="text" value={formData.startLocation} onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })} placeholder="Office" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">End Location</label>
                  <input type="text" value={formData.endLocation} onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })} placeholder="123 Main St" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Miles *</label>
                <input type="number" step="0.1" value={formData.miles} onChange={(e) => setFormData({ ...formData, miles: e.target.value })} placeholder="0.0" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                {formData.miles && <p className="text-sm text-[#4A9B7F] mt-2">Deduction: ${(parseFloat(formData.miles) * IRS_RATE).toFixed(2)}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Notes</label>
                <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-semibold text-gray-400 border border-dark-border rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={saveTrip} className="px-6 py-3 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">Save Trip</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
