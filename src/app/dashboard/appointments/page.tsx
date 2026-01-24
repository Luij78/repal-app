'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// Custom Calendar Date Picker Component
function DatePickerField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) setCurrentMonth(new Date(value + 'T00:00:00'))
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const prevMonth = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)) }
  const nextMonth = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)) }

  const selectDate = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange(selected.toISOString().split('T')[0])
    setIsOpen(false)
  }

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Select date'
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const renderDays = () => {
    const days = []
    const totalDays = daysInMonth(currentMonth)
    const firstDay = firstDayOfMonth(currentMonth)
    
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="w-10 h-10" />)
    
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isSelected = value === dateStr
      const isToday = dateStr === todayStr
      
      days.push(
        <button key={day} type="button" onClick={(e) => { e.stopPropagation(); selectDate(day) }}
          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all flex items-center justify-center ${
            isSelected ? 'bg-gradient-to-br from-primary-500 to-[#B8960C] text-dark-bg shadow-lg shadow-primary-500/30' 
            : isToday ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50' 
            : 'text-white hover:bg-white/10'
          }`}
        >{day}</button>
      )
    }
    return days
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
      <button type="button" onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-left flex items-center justify-between hover:border-primary-500/50 transition-colors">
        <span className={value ? 'text-white' : 'text-gray-500'}>{formatDisplayDate(value)}</span>
        <span className="text-xl">📅</span>
      </button>
      
      {isOpen && (
        <div className="absolute z-[100] mt-2 left-0 right-0">
          <div className="p-5 rounded-2xl border border-primary-500/20 shadow-2xl"
            style={{ background: 'linear-gradient(145deg, rgba(30,30,30,0.98) 0%, rgba(15,15,15,0.99) 100%)', boxShadow: '0 0 60px rgba(212,175,55,0.15), 0 25px 50px rgba(0,0,0,0.5)' }}>
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevMonth} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-lg">‹</button>
              <span className="font-playfair text-white text-lg" style={{ textShadow: '0 0 20px rgba(212,175,55,0.4)' }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
              <button type="button" onClick={nextMonth} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-lg">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (<div key={day} className="w-10 h-8 flex items-center justify-center text-xs text-primary-400 font-semibold">{day}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(todayStr); setIsOpen(false) }} className="flex-1 py-2.5 text-sm font-semibold bg-primary-500/20 text-primary-400 rounded-xl hover:bg-primary-500/30 transition-colors">Today</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false) }} className="flex-1 py-2.5 text-sm font-semibold bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-colors">Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'showing', date: '', time: '09:00', location: '', leadType: '', notes: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('repal_appointments')
    if (saved) setAppointments(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('repal_appointments', JSON.stringify(appointments))
  }, [appointments])

  const typeColors: Record<string, string> = {
    showing: '#6B8DD6', listing: '#D4AF37', closing: '#4A9B7F', meeting: '#C97B63', other: '#9B59B6'
  }

  const typeLabels: Record<string, string> = {
    showing: 'Property Showing', listing: 'Listing Appointment', closing: 'Closing', meeting: 'Client Meeting', other: 'Other'
  }

  const saveAppointment = () => {
    if (!formData.date || !formData.time) return alert('Please enter date and time')
    const newApt = { ...formData, id: Date.now(), title: typeLabels[formData.type] || formData.type }
    setAppointments([...appointments, newApt])
    setFormData({ type: 'showing', date: '', time: '09:00', location: '', leadType: '', notes: '' })
    setShowForm(false)
  }

  const deleteAppointment = (id: number) => {
    if (confirm('Delete this appointment?')) setAppointments(appointments.filter(a => a.id !== id))
  }

  const sortedAppointments = [...appointments].sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())

  const formatTime = (time: string) => {
    const [hour, min] = time.split(':')
    const h = parseInt(hour)
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    const ampm = h < 12 ? 'AM' : 'PM'
    return `${hour12}:${min} ${ampm}`
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const upcomingAppointments = sortedAppointments.filter(a => a.date >= todayStr)

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">📅 Appointments</h1>
          <p className="text-gray-400 text-sm">Schedule and manage meetings</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button className="px-4 py-2.5 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">🔔 Enable Alerts</button>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ New Appointment</button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-[#4A9B7F]/20 rounded-xl border border-[#4A9B7F] text-sm text-[#4A9B7F]">
        💡 Enable push notifications to get reminders 30 minutes before each appointment.
      </div>

      <div className="space-y-4">
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📅</span>
            <p className="text-gray-400">No upcoming appointments. Schedule one!</p>
          </div>
        ) : (
          upcomingAppointments.map(apt => {
            const aptDate = new Date(apt.date + 'T00:00:00')
            return (
              <div key={apt.id} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-5 border border-dark-border hover:border-primary-500/30 transition-all flex gap-4">
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl text-white" style={{ backgroundColor: typeColors[apt.type] || '#666' }}>
                  <span className="text-xs font-semibold uppercase">{aptDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-2xl font-bold">{aptDate.getDate()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{apt.title || typeLabels[apt.type]}</h3>
                      <p className="text-primary-400 font-semibold">{formatTime(apt.time)}</p>
                    </div>
                    <button onClick={() => deleteAppointment(apt.id)} className="text-gray-500 hover:text-[#E74C3C] transition-colors">🗑️</button>
                  </div>
                  {apt.location && <p className="text-sm text-gray-400 mt-1">📍 {apt.location}</p>}
                  {apt.notes && <p className="text-sm text-gray-500 mt-1">{apt.notes}</p>}
                </div>
              </div>
            )
          })
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-lg w-full border border-dark-border">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">Schedule Appointment</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                  <option value="showing">Property Showing</option>
                  <option value="listing">Listing Appointment</option>
                  <option value="closing">Closing</option>
                  <option value="meeting">Client Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <DatePickerField label="Date" value={formData.date} onChange={(v) => setFormData({ ...formData, date: v })} />
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Time</label>
                <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Location</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Address" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Type of Lead</label>
                <select value={formData.leadType} onChange={(e) => setFormData({ ...formData, leadType: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                  <option value="">Select type...</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="sphere">Sphere of Influence</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full min-h-[80px] px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500 resize-y" />
            </div>

            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-semibold text-gray-400 border border-dark-border rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={saveAppointment} className="px-6 py-3 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
