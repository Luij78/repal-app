'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<any>(null)
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
    showing: '#6B8DD6',
    listing: '#D4AF37',
    closing: '#4A9B7F',
    meeting: '#C97B63',
    other: '#9B59B6'
  }

  const typeLabels: Record<string, string> = {
    showing: 'Property Showing',
    listing: 'Listing Appointment',
    closing: 'Closing',
    meeting: 'Client Meeting',
    other: 'Other'
  }

  const saveAppointment = () => {
    if (!formData.date || !formData.time) return alert('Please enter date and time')
    if (editingAppointment) {
      setAppointments(appointments.map(a => a.id === editingAppointment.id ? { ...formData, id: editingAppointment.id, title: typeLabels[formData.type] || formData.type } : a))
    } else {
      const newApt = { ...formData, id: Date.now(), title: typeLabels[formData.type] || formData.type }
      setAppointments([...appointments, newApt])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({ type: 'showing', date: '', time: '09:00', location: '', leadType: '', notes: '' })
    setEditingAppointment(null)
    setShowForm(false)
  }

  const openEditForm = (apt: any) => {
    setEditingAppointment(apt)
    setFormData({ type: apt.type, date: apt.date, time: apt.time, location: apt.location || '', leadType: apt.leadType || '', notes: apt.notes || '' })
    setShowForm(true)
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
  const todaysAppointments = appointments.filter(a => a.date === todayStr)
  const upcomingAppointments = sortedAppointments.filter(a => a.date >= todayStr)

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">📅 Appointments</h1>
          <p className="text-gray-400 text-sm">Schedule and manage meetings</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button className="px-4 py-2.5 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors">🔔 Enable Alerts</button>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ New Appointment</button>
        </div>
      </div>

      {/* Notification Banner */}
      <div className="mb-6 p-4 bg-[#4A9B7F]/20 rounded-xl border border-[#4A9B7F] text-sm text-[#4A9B7F]">
        🔔 Push notifications enabled - You'll receive alerts 30 minutes before appointments
      </div>

      {/* Today's Appointments Summary */}
      {todaysAppointments.length > 0 && (
        <div className="mb-6 p-4 bg-primary-500/10 rounded-xl border border-primary-500/30">
          <h3 className="text-primary-400 font-semibold mb-3">📍 Today's Schedule ({todaysAppointments.length})</h3>
          <div className="space-y-2">
            {todaysAppointments.map(apt => (
              <div key={apt.id} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: typeColors[apt.type] }} />
                <span className="text-white">{formatTime(apt.time)}</span>
                <span className="text-gray-400">{apt.title}</span>
                {apt.location && <span className="text-gray-500">• {apt.location}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointment Cards */}
      <div className="space-y-4">
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📅</span>
            <p className="text-gray-400">No appointments scheduled. Create your first!</p>
          </div>
        ) : (
          upcomingAppointments.map(apt => {
            const aptDate = new Date(apt.date + 'T00:00:00')
            const isPast = new Date(apt.date + 'T' + apt.time) < new Date()
            
            return (
              <div 
                key={apt.id} 
                onClick={() => openEditForm(apt)}
                className={`group flex gap-4 bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-5 border border-dark-border hover:border-primary-500/30 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary-500/5 relative ${isPast ? 'opacity-60' : ''}`}
              >
                {/* Date Badge */}
                <div className="min-w-[60px] h-[60px] rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: typeColors[apt.type] || '#D4AF37' }}>
                  <span className="text-[0.65rem] font-semibold uppercase">{aptDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="font-playfair text-2xl font-semibold">{aptDate.getDate()}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-playfair text-lg text-white mb-2">{apt.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span>🕐 {formatTime(apt.time)}</span>
                    {apt.location && <span>📍 {apt.location}</span>}
                    {apt.leadType && <span>👤 {apt.leadType === 'team_lead' ? 'Team Lead' : 'Sphere of Influence'}</span>}
                  </div>
                  {apt.notes && <p className="text-sm text-gray-500 mt-2">{apt.notes}</p>}
                </div>

                {/* Delete Button */}
                <button onClick={(e) => { e.stopPropagation(); deleteAppointment(apt.id) }} className="absolute top-3 right-3 text-2xl text-gray-600 hover:text-red-400 transition-colors leading-none opacity-0 group-hover:opacity-100">×</button>
              </div>
            )
          })
        )}
      </div>

      {/* Add/Edit Appointment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-lg w-full border border-dark-border">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">{editingAppointment ? '✏️ Edit Appointment' : '➕ Schedule Appointment'}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Date *</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Time *</label>
                <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Location</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Address or meeting place" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Type of Lead</label>
              <select value={formData.leadType} onChange={(e) => setFormData({ ...formData, leadType: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                <option value="">Select type...</option>
                <option value="team_lead">Team Lead</option>
                <option value="sphere">Sphere of Influence</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional details..." className="w-full min-h-[80px] px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500 resize-y" />
            </div>

            <div className="flex gap-4 justify-end">
              <button onClick={resetForm} className="px-6 py-3 text-sm font-semibold text-gray-400 border border-dark-border rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={saveAppointment} className="px-6 py-3 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">{editingAppointment ? 'Save Changes' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
