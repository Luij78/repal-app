'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/types/database'

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  qualified: 'bg-purple-500/20 text-purple-400',
  negotiating: 'bg-orange-500/20 text-orange-400',
  closed: 'bg-green-500/20 text-green-400',
  lost: 'bg-red-500/20 text-red-400',
}

const typeIcons: Record<string, string> = {
  buyer: '🏠',
  seller: '💰',
  both: '🔄',
}

export default function LeadsPage() {
  const { user } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'buyer',
    source: 'manual',
    notes: '',
    property_interest: '',
    budget_min: '',
    budget_max: '',
  })

  const supabase = createClient()

  useEffect(() => {
    if (user) fetchLeads()
  }, [user])

  const fetchLeads = async () => {
    if (!user) return
    
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leads:', error)
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }

  const addLead = async () => {
    if (!user || !newLead.name.trim()) return

    const { data, error } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        name: newLead.name,
        email: newLead.email || null,
        phone: newLead.phone || null,
        type: newLead.type,
        source: newLead.source,
        notes: newLead.notes || null,
        property_interest: newLead.property_interest || null,
        budget_min: newLead.budget_min ? parseFloat(newLead.budget_min) : null,
        budget_max: newLead.budget_max ? parseFloat(newLead.budget_max) : null,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding lead:', error)
    } else if (data) {
      setLeads([data, ...leads])
      setShowAddModal(false)
      setNewLead({
        name: '',
        email: '',
        phone: '',
        type: 'buyer',
        source: 'manual',
        notes: '',
        property_interest: '',
        budget_min: '',
        budget_max: '',
      })
    }
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId)

    if (error) {
      console.error('Error updating lead:', error)
    } else {
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus as Lead['status'] } : l))
    }
  }

  const deleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId)

    if (error) {
      console.error('Error deleting lead:', error)
    } else {
      setLeads(leads.filter(l => l.id !== leadId))
      setSelectedLead(null)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone?.includes(searchTerm))
    const matchesFilter = filterStatus === 'all' || lead.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">👥 Lead Manager</h1>
          <p className="text-gray-400">Manage your clients and prospects</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span>+</span> Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="negotiating">Negotiating</option>
          <option value="closed">Closed</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{leads.length}</p>
          <p className="text-gray-400 text-sm">Total Leads</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-400">{leads.filter(l => l.status === 'new').length}</p>
          <p className="text-gray-400 text-sm">New</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-purple-400">{leads.filter(l => l.status === 'qualified').length}</p>
          <p className="text-gray-400 text-sm">Qualified</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-400">{leads.filter(l => l.status === 'closed').length}</p>
          <p className="text-gray-400 text-sm">Closed</p>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">👥</span>
          <p className="text-gray-400 mb-4">
            {searchTerm || filterStatus !== 'all' ? 'No leads match your filters' : 'No leads yet'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              Add Your First Lead
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map(lead => (
            <div
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className="card cursor-pointer hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeIcons[lead.type]}</span>
                  <div>
                    <h3 className="font-semibold text-white">{lead.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {lead.email || lead.phone || 'No contact info'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[lead.status]}`}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </span>
                  <span className="text-gray-500 text-sm hidden sm:block">
                    {formatDate(lead.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Add New Lead</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Name *</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="John Smith"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="input-field w-full"
                    placeholder="john@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="input-field w-full"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Type</label>
                  <select
                    value={newLead.type}
                    onChange={(e) => setNewLead({ ...newLead, type: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="buyer">🏠 Buyer</option>
                    <option value="seller">💰 Seller</option>
                    <option value="both">🔄 Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Source</label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="referral">Referral</option>
                    <option value="zillow">Zillow</option>
                    <option value="realtor">Realtor.com</option>
                    <option value="social">Social Media</option>
                    <option value="open-house">Open House</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Property Interest</label>
                <input
                  type="text"
                  value={newLead.property_interest}
                  onChange={(e) => setNewLead({ ...newLead, property_interest: e.target.value })}
                  className="input-field w-full"
                  placeholder="3BR in Winter Park"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Budget Min</label>
                  <input
                    type="number"
                    value={newLead.budget_min}
                    onChange={(e) => setNewLead({ ...newLead, budget_min: e.target.value })}
                    className="input-field w-full"
                    placeholder="250000"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Budget Max</label>
                  <input
                    type="number"
                    value={newLead.budget_max}
                    onChange={(e) => setNewLead({ ...newLead, budget_max: e.target.value })}
                    className="input-field w-full"
                    placeholder="400000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Notes</label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-dark-border flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={addLead} className="btn-primary flex-1" disabled={!newLead.name.trim()}>
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{typeIcons[selectedLead.type]}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedLead.name}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[selectedLead.status]}`}>
                    {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedLead.email && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">📧</span>
                  <a href={`mailto:${selectedLead.email}`} className="text-primary-500 hover:underline">
                    {selectedLead.email}
                  </a>
                </div>
              )}
              {selectedLead.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">📱</span>
                  <a href={`tel:${selectedLead.phone}`} className="text-primary-500 hover:underline">
                    {selectedLead.phone}
                  </a>
                </div>
              )}
              {selectedLead.property_interest && (
                <div>
                  <p className="text-gray-500 text-sm">Property Interest</p>
                  <p className="text-white">{selectedLead.property_interest}</p>
                </div>
              )}
              {(selectedLead.budget_min || selectedLead.budget_max) && (
                <div>
                  <p className="text-gray-500 text-sm">Budget Range</p>
                  <p className="text-white">
                    ${selectedLead.budget_min?.toLocaleString() || '?'} - ${selectedLead.budget_max?.toLocaleString() || '?'}
                  </p>
                </div>
              )}
              {selectedLead.notes && (
                <div>
                  <p className="text-gray-500 text-sm">Notes</p>
                  <p className="text-white">{selectedLead.notes}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-sm mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['new', 'contacted', 'qualified', 'negotiating', 'closed', 'lost'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateLeadStatus(selectedLead.id, status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedLead.status === status
                          ? statusColors[status]
                          : 'bg-dark-border text-gray-400 hover:text-white'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-dark-border flex gap-3">
              <button 
                onClick={() => deleteLead(selectedLead.id)} 
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
              <button onClick={() => setSelectedLead(null)} className="btn-secondary flex-1">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
