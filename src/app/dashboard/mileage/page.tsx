'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'

interface MileageTrip {
  id: string
  user_id: string
  date: string
  start_location: string
  end_location: string
  miles: number
  purpose: string | null
  lead_id: string | null
  created_at: string
}

const IRS_RATE_2024 = 0.67 // 67 cents per mile for 2024
const IRS_RATE_2025 = 0.70 // Estimated rate for 2025

export default function MileagePage() {
  const { user } = useUser()
  const [trips, setTrips] = useState<MileageTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState<MileageTrip | null>(null)
  const [filterMonth, setFilterMonth] = useState('all')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    start_location: '',
    end_location: '',
    miles: '',
    purpose: ''
  })

  const supabase = createClient()

  useEffect(() => {
    if (user) fetchTrips()
  }, [user])

  const fetchTrips = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('mileage_trips')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching mileage trips:', error)
    } else {
      setTrips(data || [])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      start_location: '',
      end_location: '',
      miles: '',
      purpose: ''
    })
    setEditingTrip(null)
    setShowForm(false)
  }

  const openEditForm = (trip: MileageTrip) => {
    setEditingTrip(trip)
    setFormData({
      date: trip.date,
      start_location: trip.start_location,
      end_location: trip.end_location,
      miles: trip.miles.toString(),
      purpose: trip.purpose || ''
    })
    setShowForm(true)
  }

  const saveTrip = async () => {
    if (!user || !formData.miles || !formData.start_location || !formData.end_location) return

    const tripData = {
      user_id: user.id,
      date: formData.date,
      start_location: formData.start_location,
      end_location: formData.end_location,
      miles: parseFloat(formData.miles),
      purpose: formData.purpose || null
    }

    if (editingTrip) {
      const { error } = await supabase
        .from('mileage_trips')
        .update(tripData)
        .eq('id', editingTrip.id)

      if (error) {
        console.error('Error updating trip:', error)
      } else {
        setTrips(trips.map(t => t.id === editingTrip.id ? { ...t, ...tripData } : t))
        resetForm()
      }
    } else {
      const { data, error } = await supabase
        .from('mileage_trips')
        .insert(tripData)
        .select()
        .single()

      if (error) {
        console.error('Error adding trip:', error)
      } else if (data) {
        setTrips([data, ...trips])
        resetForm()
      }
    }
  }

  const deleteTrip = async (tripId: string) => {
    if (!confirm('Delete this trip?')) return

    const { error } = await supabase
      .from('mileage_trips')
      .delete()
      .eq('id', tripId)

    if (error) {
      console.error('Error deleting trip:', error)
    } else {
      setTrips(trips.filter(t => t.id !== tripId))
    }
  }

  // Quick add round trip
  const addRoundTrip = () => {
    if (formData.start_location && formData.end_location && formData.miles) {
      const roundTripMiles = (parseFloat(formData.miles) * 2).toString()
      setFormData({ ...formData, miles: roundTripMiles, purpose: formData.purpose + ' (Round Trip)' })
    }
  }

  // Get unique months
  const months = Array.from(new Set(trips.map(t => t.date.substring(0, 7)))).sort().reverse()

  const filteredTrips = trips.filter(trip => 
    filterMonth === 'all' || trip.date.startsWith(filterMonth)
  )

  // Stats
  const currentYear = new Date().getFullYear().toString()
  const currentMonth = new Date().toISOString().substring(0, 7)
  const irsRate = currentYear === '2024' ? IRS_RATE_2024 : IRS_RATE_2025
  
  const ytdMiles = trips.filter(t => t.date.startsWith(currentYear)).reduce((sum, t) => sum + t.miles, 0)
  const ytdDeduction = ytdMiles * irsRate
  const mtdMiles = trips.filter(t => t.date.startsWith(currentMonth)).reduce((sum, t) => sum + t.miles, 0)
  const mtdDeduction = mtdMiles * irsRate
  const filteredMiles = filteredTrips.reduce((sum, t) => sum + t.miles, 0)
  const filteredDeduction = filteredMiles * irsRate

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🚗 Mileage Tracker</h1>
          <p className="text-gray-400">Log business miles for tax deductions</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> Log Trip
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{mtdMiles.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">Miles This Month</p>
        </div>
        <div className="card text-center border-primary-500/30">
          <p className="text-2xl font-bold text-primary-500">{ytdMiles.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">Miles YTD</p>
        </div>
        <div className="card text-center border-green-500/30">
          <p className="text-2xl font-bold text-green-400">{formatCurrency(ytdDeduction)}</p>
          <p className="text-gray-400 text-sm">Est. Deduction (YTD)</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-400">{trips.length}</p>
          <p className="text-gray-400 text-sm">Total Trips</p>
        </div>
      </div>

      {/* IRS Rate Info */}
      <div className="card mb-6 bg-primary-500/10 border-primary-500/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="text-gray-300">
              {currentYear} IRS Standard Mileage Rate: <span className="text-primary-500 font-bold">${irsRate}/mile</span>
            </span>
          </div>
          <a 
            href="https://www.irs.gov/tax-professionals/standard-mileage-rates" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-500 text-sm hover:underline"
          >
            IRS Info →
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="input-field"
        >
          <option value="all">All Time</option>
          {months.map(month => (
            <option key={month} value={month}>{formatMonth(month)}</option>
          ))}
        </select>
        {filterMonth !== 'all' && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              {filteredMiles.toLocaleString()} miles • <span className="text-green-400 font-semibold">{formatCurrency(filteredDeduction)} deduction</span>
            </span>
          </div>
        )}
      </div>

      {/* Trips List */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading trips...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">🚗</span>
          <p className="text-gray-400 mb-4">
            {filterMonth !== 'all' ? 'No trips this month' : 'No trips logged yet'}
          </p>
          {filterMonth === 'all' && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Log Your First Trip
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrips.map(trip => (
            <div key={trip.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📍</span>
                  <span className="text-white font-medium">{trip.start_location}</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-white font-medium">{trip.end_location}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                  <span>📅 {formatDate(trip.date)}</span>
                  {trip.purpose && <span>• {trip.purpose}</span>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{trip.miles} mi</p>
                  <p className="text-green-400 text-sm">{formatCurrency(trip.miles * irsRate)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditForm(trip)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteTrip(trip.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingTrip ? 'Edit Trip' : 'Log Trip'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
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
                <label className="block text-gray-400 text-sm mb-1">From *</label>
                <input
                  type="text"
                  value={formData.start_location}
                  onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                  className="input-field w-full"
                  placeholder="Office / Home"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">To *</label>
                <input
                  type="text"
                  value={formData.end_location}
                  onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                  className="input-field w-full"
                  placeholder="123 Main St, Orlando"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-gray-400 text-sm">Miles *</label>
                  {formData.miles && !editingTrip && (
                    <button
                      type="button"
                      onClick={addRoundTrip}
                      className="text-xs text-primary-500 hover:underline"
                    >
                      Make Round Trip (×2)
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={formData.miles}
                  onChange={(e) => setFormData({ ...formData, miles: e.target.value })}
                  className="input-field w-full"
                  placeholder="0.0"
                />
                {formData.miles && (
                  <p className="text-green-400 text-sm mt-1">
                    Est. deduction: {formatCurrency(parseFloat(formData.miles) * irsRate)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Purpose</label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="input-field w-full"
                  placeholder="Showing, Listing appointment, Client meeting..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-dark-border flex gap-3">
              <button onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
              <button 
                onClick={saveTrip} 
                className="btn-primary flex-1"
                disabled={!formData.miles || !formData.start_location || !formData.end_location}
              >
                {editingTrip ? 'Save Changes' : 'Log Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
