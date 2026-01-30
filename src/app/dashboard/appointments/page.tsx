'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Appointment {
  id: string
  user_id: string
  lead_id: string | null
  title: string
  date: string
  time: string
  location: string | null
  type: 'showing' | 'listing' | 'meeting' | 'open-house' | 'closing' | 'other'
  notes: string | null
  reminder: boolean
  created_at: string
}

export default function AppointmentsPage() {
  const { user } = useUser()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    location: '',
    type: 'showing' as Appointment['type'],
    notes: '',
    reminder: true,
  })

  const typeColors: Record<string, string> = {
    showing: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    listing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    meeting: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'open-house': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    closing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  const typeIcons: Record<string, string> = {
    showing: '🏠',
    listing: '📋',
    meeting: '💬',
    'open-house': '🏡',
    closing: '🔑',
    other: '📌',
  }

  const supabase = createClient()

  useEffect(() => {
    if (user) fetchAppointments()
  }, [user])

  const fetchAppointments = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      console.error('Error fetching appointments:', error)
    } else {
      setAppointments(data || [])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      location: '',
      type: 'showing',
      notes: '',
      reminder: true,
    })
    setEditingAppointment(null)
    setShowForm(false)
  }

  const saveAppointment = async () => {
    if (!user || !formData.title.trim()) return

    const appointmentData = {
      user_id: user.id,
      title: formData.title,
      date: formData.date,
      time: formData.time,
      location: formData.location || null,
      type: formData.type,
      notes: formData.notes || null,
      reminder: formData.reminder,
    }

    if (editingAppointment) {
      const { error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', editingAppointment.id)

      if (error) {
        console.error('Error updating appointment:', error)
      } else {
        setAppointments(appointments.map(a => 
          a.id === editingAppointment.id ? { ...a, ...appointmentData } : a
        ))
        resetForm()
      }
    } else {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single()

      if (error) {
        console.error('Error adding appointment:', error)
      } else if (data) {
        setAppointments([...appointments, data].sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date)
          return a.time.localeCompare(b.time)
        }))
        resetForm()
      }
    }
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('Delete this appointment?')) return

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting appointment:', error)
    } else {
      setAppointments(appointments.filter(a => a.id !== id))
    }
  }

  const openEditForm = (apt: Appointment) => {
    setEditingAppointment(apt)
    setFormData({
      title: apt.title,
      date: apt.date,
      time: apt.time,
      location: apt.location || '',
      type: apt.type,
      notes: apt.notes || '',
      reminder: apt.reminder,
    })
    setShowForm(true)
  }

  const formatTime = (time: string) => {
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    })
  }

  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(a => a.date === today)
  const upcomingAppointments = appointments.filter(a => a.date > today)
  const pastAppointments = appointments.filter(a => a.date < today)

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">📅 Appointments</h1>
          <p className="text-gray-400">Schedule and track your meetings</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span>+</span> Schedule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center border-primary-500/30">
          <p className="text-2xl font-bold text-primary-500">{todayAppointments.length}</p>
          <p className="text-gray-400 text-sm">Today</p>
        </div>
        <div className="card text-center border-blue-500/30">
          <p className="text-2xl font-bold text-blue-400">{upcomingAppointments.length}</p>
          <p className="text-gray-400 text-sm">Upcoming</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{appointments.length}</p>
          <p className="text-gray-400 text-sm">Total</p>
        </div>
      </div>

      {/* Today's Appointments */}
      {todayAppointments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-primary-400 mb-3">🔥 Today</h2>
          <div className="space-y-3">
            {todayAppointments.map(apt => (
              <div
                key={apt.id}
                onClick={() => openEditForm(apt)}
                className="card cursor-pointer hover:border-primary-500/50 transition-all border-primary-500/30 bg-primary-500/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{typeIcons[apt.type]}</div>
                    <div>
                      <h3 className="font-semibold text-white">{apt.title}</h3>
                      <p className="text-gray-400 text-sm flex items-center gap-2">
                        <span>🕐 {formatTime(apt.time)}</span>
                        {apt.location && <span>📍 {apt.location}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeColors[apt.type]}`}>
                      {apt.type}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteAppointment(apt.id) }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {apt.notes && (
                  <p className="text-gray-500 text-sm mt-2">{apt.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">📆 Upcoming</h2>
          <div className="space-y-3">
            {upcomingAppointments.map(apt => (
              <div
                key={apt.id}
                onClick={() => openEditForm(apt)}
                className="card cursor-pointer hover:border-primary-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-dark-border rounded-lg p-2 text-center min-w-[50px]">
                      <div className="text-xs text-gray-500">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="text-lg font-bold text-white">{new Date(apt.date).getDate()}</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{apt.title}</h3>
                      <p className="text-gray-400 text-sm flex items-center gap-2">
                        <span>🕐 {formatTime(apt.time)}</span>
                        {apt.location && <span>📍 {apt.location}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeColors[apt.type]}`}>
                      {apt.type}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteAppointment(apt.id) }}
                      className="text-gray-500 hover:text-red-400 p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-500 mb-3">Past</h2>
          <div className="space-y-2 opacity-60">
            {pastAppointments.slice(0, 5).map(apt => (
              <div
                key={apt.id}
                className="card cursor-pointer hover:border-gray-600 transition-all"
                onClick={() => openEditForm(apt)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{typeIcons[apt.type]}</div>
                    <div>
                      <h3 className="font-medium text-gray-300">{apt.title}</h3>
                      <p className="text-gray-500 text-sm">{formatDate(apt.date)} • {formatTime(apt.time)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {appointments.length === 0 && (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">📅</span>
          <p className="text-gray-400 mb-4">No appointments scheduled</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Schedule Your First Appointment
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-card">
              <h2 className="text-xl font-bold text-white">
                {editingAppointment ? '✏️ Edit Appointment' : '➕ Schedule Appointment'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., Showing with John Smith"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Appointment['type'] })}
                  className="input-field w-full"
                >
                  <option value="showing">🏠 Showing</option>
                  <option value="listing">📋 Listing Appointment</option>
                  <option value="meeting">💬 Meeting</option>
                  <option value="open-house">🏡 Open House</option>
                  <option value="closing">🔑 Closing</option>
                  <option value="other">📌 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field w-full"
                  placeholder="Address or meeting place"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={formData.reminder}
                  onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 bg-dark-bg text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="reminder" className="text-gray-400 text-sm">Set reminder</label>
              </div>
            </div>
            <div className="p-6 border-t border-dark-border flex gap-3 sticky bottom-0 bg-dark-card">
              <button onClick={resetForm} className="btn-secondary flex-1">
                Cancel
              </button>
              <button 
                onClick={saveAppointment} 
                className="btn-primary flex-1" 
                disabled={!formData.title.trim()}
              >
                {editingAppointment ? 'Save Changes' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
