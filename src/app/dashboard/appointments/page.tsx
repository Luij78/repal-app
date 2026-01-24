'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const sampleAppointments = [
  { id: 1, title: 'Listing presentation - Sarah Chen', date: '2026-01-24', time: '10:00', location: '456 Dr Phillips Blvd, Orlando', type: 'listing', notes: 'Bring CMA, listing agreement, marketing plan', leadId: 2 },
  { id: 2, title: 'Showing - Marcus Johnson', date: '2026-01-25', time: '14:00', location: '789 Winter Park Ave', type: 'showing', notes: '3 homes to show: Winter Park listings', leadId: 1 },
  { id: 3, title: 'Buyer consultation - Frank & Helen King', date: '2026-01-26', time: '11:00', location: 'Office', type: 'consultation', notes: 'VA loan process, Waterford Lakes area tour', leadId: 26 },
  { id: 4, title: 'Showing - Eric & Samantha Murphy', date: '2026-01-27', time: '09:00', location: 'Lake Nona', type: 'showing', notes: '3 homes scheduled - very motivated buyers!', leadId: 50 },
  { id: 5, title: 'Inspection - 123 Closing Soon Dr', date: '2026-01-28', time: '13:00', location: '123 Closing Soon Dr, Sanford', type: 'inspection', notes: 'Meet inspector, represent seller' },
  { id: 6, title: 'Closing - Williams Family', date: '2026-01-30', time: '10:00', location: 'Title Company - Lake Mary', type: 'closing', notes: 'Bring congratulations gift!', leadId: 3 },
  { id: 7, title: '55+ Community Tour - Ruth Adams', date: '2026-01-29', time: '10:00', location: 'Solivita Clubhouse', type: 'showing', notes: 'Pickle ball courts, pool, clubhouse tour', leadId: 29 },
  { id: 8, title: 'FSBO Meeting - Carol Scott', date: '2026-01-24', time: '15:00', location: 'Baldwin Park', type: 'listing', notes: 'Sign listing agreement, discuss pricing strategy', leadId: 27 },
  { id: 9, title: '1031 Exchange Consultation - William Roberts', date: '2026-01-24', time: '16:30', location: 'Office', type: 'consultation', notes: 'URGENT - 45 day deadline approaching', leadId: 34 },
  { id: 10, title: 'Property Photos - Sarah Chen listing', date: '2026-01-25', time: '11:00', location: '456 Dr Phillips Blvd', type: 'other', notes: 'Meet photographer, ensure home is staged', leadId: 2 }
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [formData, setFormData] = useState({
    title: '', date: new Date().toISOString().split('T')[0], time: '09:00', location: '', type: 'showing', notes: '', leadId: ''
  })

  const typeColors: Record<string, string> = {
    showing: '#4A9B7F', listing: '#6B8DD6', consultation: '#9B59B6', closing: '#D4AF37', inspection: '#E67E22', other: '#666'
  }

  useEffect(() => {
    const saved = localStorage.getItem('repal_appointments')
    if (saved) {
      const parsed = JSON.parse(saved)
      setAppointments(parsed.length > 0 ? parsed : sampleAppointments)
    } else {
      setAppointments(sampleAppointments)
    }
  }, [])

  useEffect(() => {
    if (appointments.length > 0) {
      localStorage.setItem('repal_appointments', JSON.stringify(appointments))
    }
  }, [appointments])

  const resetForm = () => {
    setFormData({ title: '', date: new Date().toISOString().split('T')[0], time: '09:00', location: '', type: 'showing', notes: '', leadId: '' })
    setShowForm(false)
    setEditingAppointment(null)
  }

  const openEditForm = (apt: any) => {
    setEditingAppointment(apt)
    setFormData({
      title: apt.title || '',
      date: apt.date || new Date().toISOString().split('T')[0],
      time: apt.time || '09:00',
      location: apt.location || '',
      type: apt.type || 'showing',
      notes: apt.notes || '',
      leadId: apt.leadId?.toString() || ''
    })
    setShowForm(true)
  }

  const saveAppointment = () => {
    if (editingAppointment) {
      setAppointments(appointments.map(a => a.id === editingAppointment.id ? { ...formData, id: editingAppointment.id, leadId: formData.leadId ? parseInt(formData.leadId) : null } : a))
    } else {
      setAppointments([...appointments, { ...formData, id: Date.now(), leadId: formData.leadId ? parseInt(formData.leadId) : null }])
    }
    resetForm()
  }

  const deleteAppointment = (id: number) => {
    if (confirm('Delete this appointment?')) setAppointments(appointments.filter(a => a.id !== id))
  }

  const formatTime = (time: string) => {
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const sortedAppointments = [...appointments].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.time.localeCompare(b.time)
  })

  const upcomingAppointments = sortedAppointments.filter(apt => apt.date >= new Date().toISOString().split('T')[0])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#fff', padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard" style={{ color: '#D4AF37', fontSize: '1.5rem' }}>←</Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📅 Appointments</h1>
            <span style={{ backgroundColor: '#333', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>{upcomingAppointments.length} upcoming</span>
          </div>
          <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}>+ Schedule</button>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {sortedAppointments.map(apt => {
            const aptDate = new Date(apt.date + 'T' + apt.time)
            const isPast = aptDate < new Date()
            const isToday = apt.date === new Date().toISOString().split('T')[0]
            
            return (
              <div key={apt.id} onClick={() => openEditForm(apt)} className="group" style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${isToday ? '#D4AF37' : '#333'}`, display: 'flex', gap: '1rem', alignItems: 'center', opacity: isPast ? 0.6 : 1, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={(e) => { e.currentTarget.style.borderColor = isToday ? '#D4AF37' : '#333'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ backgroundColor: typeColors[apt.type] || '#666', padding: '0.5rem', borderRadius: '0.5rem', textAlign: 'center', minWidth: '60px' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{new Date(apt.date).getDate()}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '600' }}>{apt.title}</span>
                    <span style={{ backgroundColor: typeColors[apt.type], padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>{apt.type}</span>
                    {isToday && <span style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600' }}>TODAY</span>}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#999', marginTop: '0.25rem' }}>
                    <span style={{ marginRight: '1rem' }}>🕐 {formatTime(apt.time)}</span>
                    {apt.location && <span>📍 {apt.location}</span>}
                  </div>
                  {apt.notes && <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>{apt.notes}</div>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteAppointment(apt.id) }} className="delete-btn" style={{ backgroundColor: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.25rem', padding: '0.5rem', opacity: 0, transition: 'opacity 0.2s' }}>×</button>
              </div>
            )
          })}
          {appointments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <p>No appointments scheduled</p>
            </div>
          )}
        </div>

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
            <div style={{ backgroundColor: '#2a2a2a', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{editingAppointment ? '✏️ Edit Appointment' : '➕ Schedule Appointment'}</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input type="text" placeholder="Appointment Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                </div>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                  <option value="showing">🏠 Showing</option>
                  <option value="listing">📋 Listing Appointment</option>
                  <option value="consultation">💬 Consultation</option>
                  <option value="closing">🔑 Closing</option>
                  <option value="inspection">🔍 Inspection</option>
                  <option value="other">📌 Other</option>
                </select>
                <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                <textarea placeholder="Notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={resetForm} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveAppointment} disabled={!formData.title} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#D4AF37', color: '#000', cursor: 'pointer', fontWeight: '600', opacity: formData.title ? 1 : 0.5 }}>{editingAppointment ? 'Save Changes' : 'Schedule'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .group:hover .delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
