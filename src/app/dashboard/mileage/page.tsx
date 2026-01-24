'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const sampleTrips = [
  { id: 1, date: '2026-01-22', purpose: 'Showing - Marcus Johnson', startLocation: 'Office', endLocation: '789 Winter Park Ave', miles: 12.5, roundTrip: true, notes: 'Showed 3 properties' },
  { id: 2, date: '2026-01-21', purpose: 'Listing appointment - Carol Scott', startLocation: 'Home', endLocation: 'Baldwin Park', miles: 8.2, roundTrip: true, notes: 'FSBO conversion meeting' },
  { id: 3, date: '2026-01-20', purpose: 'Client meeting - Raymond Green', startLocation: 'Office', endLocation: 'Downtown Orlando', miles: 5.5, roundTrip: true, notes: '1031 exchange consultation' },
  { id: 4, date: '2026-01-19', purpose: 'Property inspection', startLocation: 'Home', endLocation: '123 Closing Soon Dr, Sanford', miles: 18.3, roundTrip: true, notes: 'Pre-listing inspection' },
  { id: 5, date: '2026-01-18', purpose: 'Showing - Jennifer Thompson', startLocation: 'Office', endLocation: 'Oviedo', miles: 15.7, roundTrip: true, notes: '4 homes in school district' },
  { id: 6, date: '2026-01-17', purpose: 'Photography appointment', startLocation: 'Home', endLocation: '456 Dr Phillips Blvd', miles: 11.2, roundTrip: true, notes: 'Sarah Chen listing photos' },
  { id: 7, date: '2026-01-16', purpose: 'VA consultation - Frank & Helen King', startLocation: 'Office', endLocation: 'Waterford Lakes', miles: 9.8, roundTrip: true, notes: 'Military family, area tour' },
  { id: 8, date: '2026-01-15', purpose: 'Closing - Previous client', startLocation: 'Home', endLocation: 'Title Company - Lake Mary', miles: 14.5, roundTrip: true },
  { id: 9, date: '2026-01-14', purpose: 'Open house setup', startLocation: 'Office', endLocation: '234 Open House Lane', miles: 7.3, roundTrip: true, notes: 'Set up signs and refreshments' },
  { id: 10, date: '2026-01-13', purpose: '55+ community tour', startLocation: 'Home', endLocation: 'Solivita', miles: 28.5, roundTrip: true, notes: 'Ruth Adams tour' },
  { id: 11, date: '2026-01-12', purpose: 'Investor property viewing', startLocation: 'Office', endLocation: 'Pine Street Duplex', miles: 6.2, roundTrip: true, notes: 'David Martinez' },
  { id: 12, date: '2026-01-10', purpose: 'CMA delivery - Emily Davis', startLocation: 'Home', endLocation: 'Lake Mary', miles: 10.8, roundTrip: true },
  { id: 13, date: '2026-01-08', purpose: 'Realtor Association Meeting', startLocation: 'Office', endLocation: 'ORRA Building', miles: 4.5, roundTrip: true, notes: 'Monthly meeting' },
  { id: 14, date: '2026-01-05', purpose: 'Property preview', startLocation: 'Home', endLocation: 'Lake Nona', miles: 22.1, roundTrip: true, notes: 'New listings for Murphy family' },
  { id: 15, date: '2026-01-03', purpose: 'Client gift delivery', startLocation: 'Office', endLocation: 'Winter Park', miles: 8.9, roundTrip: true, notes: 'Williams closing gift' }
]

const IRS_RATE_2026 = 0.70 // $0.70 per mile for 2026

export default function MileagePage() {
  const [trips, setTrips] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState<any>(null)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], purpose: '', startLocation: '', endLocation: '', miles: '', roundTrip: false, notes: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('repal_mileage')
    if (saved) {
      const parsed = JSON.parse(saved)
      setTrips(parsed.length > 0 ? parsed : sampleTrips)
    } else {
      setTrips(sampleTrips)
    }
  }, [])

  useEffect(() => {
    if (trips.length > 0) {
      localStorage.setItem('repal_mileage', JSON.stringify(trips))
    }
  }, [trips])

  const filteredTrips = trips.filter(trip => trip.date.startsWith(filterYear)).sort((a, b) => b.date.localeCompare(a.date))

  const totalMiles = filteredTrips.reduce((sum, trip) => {
    const miles = parseFloat(trip.miles) || 0
    return sum + (trip.roundTrip ? miles * 2 : miles)
  }, 0)

  const totalDeduction = totalMiles * IRS_RATE_2026

  const resetForm = () => {
    setFormData({ date: new Date().toISOString().split('T')[0], purpose: '', startLocation: '', endLocation: '', miles: '', roundTrip: false, notes: '' })
    setShowForm(false)
    setEditingTrip(null)
  }

  const openEditForm = (trip: any) => {
    setEditingTrip(trip)
    setFormData({
      date: trip.date || new Date().toISOString().split('T')[0],
      purpose: trip.purpose || '',
      startLocation: trip.startLocation || '',
      endLocation: trip.endLocation || '',
      miles: trip.miles?.toString() || '',
      roundTrip: trip.roundTrip || false,
      notes: trip.notes || ''
    })
    setShowForm(true)
  }

  const saveTrip = () => {
    const tripData = { ...formData, miles: parseFloat(formData.miles) || 0 }
    if (editingTrip) {
      setTrips(trips.map(t => t.id === editingTrip.id ? { ...tripData, id: editingTrip.id } : t))
    } else {
      setTrips([...trips, { ...tripData, id: Date.now() }])
    }
    resetForm()
  }

  const deleteTrip = (id: number) => {
    if (confirm('Delete this trip?')) setTrips(trips.filter(t => t.id !== id))
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#fff', padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard" style={{ color: '#D4AF37', fontSize: '1.5rem' }}>←</Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🚗 Mileage Tracker</h1>
          </div>
          <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}>+ Log Trip</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333' }}>
            <div style={{ fontSize: '0.875rem', color: '#999' }}>Total Miles ({filterYear})</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6B8DD6' }}>{totalMiles.toFixed(1)} mi</div>
          </div>
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333' }}>
            <div style={{ fontSize: '0.875rem', color: '#999' }}>Tax Deduction (${IRS_RATE_2026}/mi)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4A9B7F' }}>${totalDeduction.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333' }}>
            <div style={{ fontSize: '0.875rem', color: '#999' }}>Trips Logged</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{filteredTrips.length}</div>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff' }}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filteredTrips.map(trip => {
            const actualMiles = trip.roundTrip ? parseFloat(trip.miles) * 2 : parseFloat(trip.miles)
            return (
              <div key={trip.id} onClick={() => openEditForm(trip)} className="group" style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: '#6B8DD6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🚗</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '600' }}>{trip.purpose}</span>
                      {trip.roundTrip && <span style={{ backgroundColor: '#4A9B7F', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem' }}>ROUND TRIP</span>}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#999', marginTop: '0.25rem' }}>
                      📅 {new Date(trip.date).toLocaleDateString()} • {trip.startLocation} → {trip.endLocation}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#6B8DD6' }}>{actualMiles.toFixed(1)} mi</div>
                    <div style={{ fontSize: '0.75rem', color: '#4A9B7F' }}>${(actualMiles * IRS_RATE_2026).toFixed(2)}</div>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteTrip(trip.id) }} className="delete-btn" style={{ backgroundColor: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.25rem', padding: '0.5rem', marginLeft: '0.5rem', opacity: 0, transition: 'opacity 0.2s' }}>🗑️</button>
              </div>
            )
          })}
        </div>

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
            <div style={{ backgroundColor: '#2a2a2a', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{editingTrip ? '✏️ Edit Trip' : '➕ Log Trip'}</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input type="text" placeholder="Purpose *" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <input type="number" step="0.1" placeholder="Miles *" value={formData.miles} onChange={(e) => setFormData({ ...formData, miles: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="text" placeholder="Start Location" value={formData.startLocation} onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <input type="text" placeholder="End Location" value={formData.endLocation} onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                </div>
                <textarea placeholder="Notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', resize: 'vertical' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.roundTrip} onChange={(e) => setFormData({ ...formData, roundTrip: e.target.checked })} style={{ width: '1.25rem', height: '1.25rem', accentColor: '#D4AF37' }} />
                  <span>Round Trip (doubles mileage)</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={resetForm} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveTrip} disabled={!formData.purpose || !formData.miles} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#D4AF37', color: '#000', cursor: 'pointer', fontWeight: '600', opacity: formData.purpose && formData.miles ? 1 : 0.5 }}>{editingTrip ? 'Save Changes' : 'Log Trip'}</button>
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
