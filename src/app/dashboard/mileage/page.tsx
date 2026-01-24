'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function MileagePage() {
  const [trips, setTrips] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    purpose: '',
    startLocation: '',
    endLocation: '',
    miles: '',
    tripType: 'showing'
  })

  const IRS_RATE = 0.67 // 2024 IRS rate

  const tripTypes = [
    { id: 'showing', name: 'Property Showing', icon: '🏠' },
    { id: 'listing', name: 'Listing Appointment', icon: '📋' },
    { id: 'closing', name: 'Closing', icon: '🔑' },
    { id: 'meeting', name: 'Client Meeting', icon: '👥' },
    { id: 'networking', name: 'Networking Event', icon: '🤝' },
    { id: 'training', name: 'Training/CE', icon: '🎓' },
    { id: 'office', name: 'Office Visit', icon: '🏢' },
    { id: 'other', name: 'Other Business', icon: '📍' }
  ]

  useEffect(() => {
    const saved = localStorage.getItem('repal_mileage')
    if (saved) setTrips(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('repal_mileage', JSON.stringify(trips))
  }, [trips])

  const saveTrip = () => {
    if (!formData.miles || !formData.purpose) return alert('Please enter miles and purpose')
    setTrips([...trips, { ...formData, id: Date.now(), createdAt: new Date().toISOString() }])
    setFormData({ date: new Date().toISOString().split('T')[0], purpose: '', startLocation: '', endLocation: '', miles: '', tripType: 'showing' })
    setShowForm(false)
  }

  const deleteTrip = (id: number) => {
    if (confirm('Delete this trip?')) setTrips(trips.filter(t => t.id !== id))
  }

  const filteredTrips = trips.filter(t => new Date(t.date).getFullYear().toString() === filterYear)
  const totalMiles = filteredTrips.reduce((sum, t) => sum + (parseFloat(t.miles) || 0), 0)
  const totalDeduction = totalMiles * IRS_RATE

  const getTripIcon = (typeId: string) => tripTypes.find(t => t.id === typeId)?.icon || '📍'

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-white">{totalMiles.toLocaleString()}</span>
          <p className="text-xs text-gray-400 mt-1">Total Miles ({filterYear})</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-[#4A9B7F]">${totalDeduction.toLocaleString()}</span>
          <p className="text-xs text-gray-400 mt-1">Tax Deduction</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-primary-400">{filteredTrips.length}</span>
          <p className="text-xs text-gray-400 mt-1">Trips Logged</p>
        </div>
      </div>

      {/* IRS Rate Info */}
      <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30 text-sm">
        <span className="text-blue-400 font-semibold">ℹ️ 2024 IRS Standard Mileage Rate:</span>
        <span className="text-white ml-2">${IRS_RATE}/mile for business use</span>
      </div>

      {/* Year Filter */}
      <div className="mb-6">
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="px-4 py-3 text-sm bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
          {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Trip List */}
      <div className="space-y-3">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🚗</span>
            <p className="text-gray-400">No trips logged. Start tracking your mileage!</p>
          </div>
        ) : (
          filteredTrips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(trip => (
            <div key={trip.id} className="flex items-center gap-4 bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
              <div className="w-12 h-12 rounded-xl bg-[#1F1F1F] flex items-center justify-center text-2xl flex-shrink-0">
                {getTripIcon(trip.tripType)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white mb-1">{trip.purpose}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap">
                  <span>{new Date(trip.date + 'T00:00:00').toLocaleDateString()}</span>
                  {trip.startLocation && trip.endLocation && (
                    <span>📍 {trip.startLocation} → {trip.endLocation}</span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-semibold text-white">{parseFloat(trip.miles).toLocaleString()} mi</p>
                <p className="text-xs text-[#4A9B7F]">${(parseFloat(trip.miles) * IRS_RATE).toFixed(2)}</p>
              </div>
              <button onClick={() => deleteTrip(trip.id)} className="text-gray-600 hover:text-[#E74C3C] transition-colors">🗑️</button>
            </div>
          ))
        )}
      </div>

      {/* Add Trip Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-lg w-full border border-dark-border">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">Log Trip</h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Miles *</label>
                  <input type="number" value={formData.miles} onChange={(e) => setFormData({ ...formData, miles: e.target.value })} placeholder="0" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Trip Type</label>
                <select value={formData.tripType} onChange={(e) => setFormData({ ...formData, tripType: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                  {tripTypes.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Purpose / Description *</label>
                <input type="text" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} placeholder="e.g., Showing at 123 Main St" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
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
