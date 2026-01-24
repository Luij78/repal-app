'use client'

import { useState, useEffect } from 'react'
import CalendarPicker from '@/components/CalendarPicker'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: string
  type: string
  source: string
  last_contact: string
  notes: string
  created_at: string
  budget?: string
  preferred_area?: string
  priority?: number
}

const STORAGE_KEY = 'repal_leads'

const statusOptions = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'hot', 'warm', 'cold', 'waiting', 'closed', 'lost']
const typeOptions = ['buyer', 'seller', 'buyer_seller', 'investor', 'buyer_55', 'renter', 'referral']
const sourceOptions = ['website', 'referral', 'zillow', 'realtor.com', 'social_media', 'open_house', 'cold_call', 'sphere', 'other']

export default function LeadsPage() {
  const [mounted, setMounted] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [noteInput, setNoteInput] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'new',
    type: 'buyer',
    source: 'website',
    last_contact: new Date().toISOString().split('T')[0],
    notes: '',
    budget: '',
    preferred_area: '',
    priority: 5
  })

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setLeads(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading leads:', e)
      }
    }
  }, [])

  const saveLeads = (newLeads: Lead[]) => {
    setLeads(newLeads)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLeads))
  }

  // Generate timestamp for notes
  const getTimestamp = () => {
    const now = new Date()
    const date = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `[${date} @ ${time}]`
  }

  // Add timestamped note
  const addTimestampedNote = () => {
    if (!noteInput.trim()) return
    
    const timestamp = getTimestamp()
    const newNote = `${timestamp} ${noteInput.trim()}`
    const existingNotes = formData.notes.trim()
    
    setFormData({
      ...formData,
      notes: existingNotes ? `${newNote}\n\n${existingNotes}` : newNote
    })
    setNoteInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const leadData: Lead = {
      id: editingLead?.id || Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      type: formData.type,
      source: formData.source,
      last_contact: formData.last_contact,
      notes: formData.notes,
      created_at: editingLead?.created_at || new Date().toISOString(),
      budget: formData.budget,
      preferred_area: formData.preferred_area,
      priority: formData.priority
    }

    if (editingLead) {
      saveLeads(leads.map(l => l.id === editingLead.id ? leadData : l))
    } else {
      saveLeads([leadData, ...leads])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'new',
      type: 'buyer',
      source: 'website',
      last_contact: new Date().toISOString().split('T')[0],
      notes: '',
      budget: '',
      preferred_area: '',
      priority: 5
    })
    setNoteInput('')
    setEditingLead(null)
    setShowModal(false)
  }

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead)
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      type: lead.type,
      source: lead.source,
      last_contact: lead.last_contact,
      notes: lead.notes,
      budget: lead.budget || '',
      preferred_area: lead.preferred_area || '',
      priority: lead.priority || 5
    })
    setNoteInput('')
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      saveLeads(leads.filter(l => l.id !== id))
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm)
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      hot: 'bg-red-500/20 text-red-400',
      warm: 'bg-orange-500/20 text-orange-400',
      cold: 'bg-blue-500/20 text-blue-400',
      new: 'bg-green-500/20 text-green-400',
      contacted: 'bg-yellow-500/20 text-yellow-400',
      qualified: 'bg-purple-500/20 text-purple-400',
      proposal: 'bg-pink-500/20 text-pink-400',
      negotiation: 'bg-indigo-500/20 text-indigo-400',
      waiting: 'bg-gray-500/20 text-gray-400',
      closed: 'bg-emerald-500/20 text-emerald-400',
      lost: 'bg-gray-600/20 text-gray-500'
    }
    return colors[status] || 'bg-gray-500/20 text-gray-400'
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return 'text-red-400'
    if (priority <= 6) return 'text-yellow-400'
    return 'text-green-400'
  }

  // Parse notes to show entries
  const parseNotes = (notes: string) => {
    if (!notes) return []
    return notes.split('\n\n').filter(n => n.trim())
  }

  return (
    <div className="animate-fade-in">
      {!mounted ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading...</div>
        </div>
      ) : (
        <>
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Manager</h1>
          <p className="text-gray-400 text-sm mt-1">{leads.length} lead{leads.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <span>➕</span>
          <span>Add Lead</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">👥</span>
          <p className="text-gray-400 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'No leads match your filters' 
              : 'No leads yet'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Add Your First Lead
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map(lead => (
            <div 
              key={lead.id} 
              className="card hover:border-primary-500/50 transition-all cursor-pointer"
              onClick={() => handleEdit(lead)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-white">
                    {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white">{lead.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    {lead.priority && (
                      <span className={`text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                        P{lead.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">{lead.type.replace('_', ' ')} • {lead.source.replace('_', ' ')}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                    {lead.email && <span>📧 {lead.email}</span>}
                    {lead.phone && <span>📱 {lead.phone}</span>}
                    {lead.last_contact && (
                      <span>📅 Last: {new Date(lead.last_contact).toLocaleDateString()}</span>
                    )}
                  </div>
                  {lead.notes && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{lead.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={resetForm}
        >
          <div 
            className="bg-dark-card border border-dark-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-dark-card border-b border-dark-border p-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-semibold text-white">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="John Smith"
                  required
                />
              </div>

              {/* Email and Phone - Side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field w-full"
                    placeholder="john@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field w-full"
                    placeholder="(407) 555-0123"
                  />
                </div>
              </div>

              {/* Status and Type - Side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field w-full"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field w-full"
                  >
                    {typeOptions.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Source and Priority - Side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="input-field w-full"
                  >
                    {sourceOptions.map(source => (
                      <option key={source} value={source}>
                        {source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Priority (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Budget and Area - Side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Budget</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="input-field w-full"
                    placeholder="$300,000 - $400,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Preferred Area</label>
                  <input
                    type="text"
                    value={formData.preferred_area}
                    onChange={(e) => setFormData({ ...formData, preferred_area: e.target.value })}
                    className="input-field w-full"
                    placeholder="Winter Garden"
                  />
                </div>
              </div>

              {/* Last Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Last Contact</label>
                <CalendarPicker
                  value={formData.last_contact}
                  onChange={(date) => setFormData({ ...formData, last_contact: date })}
                  placeholder="Select last contact date"
                />
              </div>

              {/* Notes with Timestamp */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Notes
                  <span className="text-primary-400 ml-2 text-xs">(with automatic timestamps)</span>
                </label>
                
                {/* Add new note input */}
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTimestampedNote()
                      }
                    }}
                    className="input-field flex-1"
                    placeholder="Add a new note..."
                  />
                  <button
                    type="button"
                    onClick={addTimestampedNote}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center gap-1"
                  >
                    <span>🕐</span>
                    <span>Add</span>
                  </button>
                </div>
                
                {/* Notes history */}
                <div className="bg-dark-bg border border-dark-border rounded-lg">
                  {formData.notes ? (
                    <div className="max-h-48 overflow-y-auto">
                      {parseNotes(formData.notes).map((note, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 text-sm ${idx !== 0 ? 'border-t border-dark-border' : ''}`}
                        >
                          {note.startsWith('[') ? (
                            <>
                              <span className="text-primary-400 font-medium">
                                {note.match(/\[.*?\]/)?.[0]}
                              </span>
                              <span className="text-gray-300 ml-1">
                                {note.replace(/\[.*?\]\s*/, '')}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-300">{note}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notes yet. Add your first note above.
                    </div>
                  )}
                </div>
                
                {/* Manual notes editing (collapsible) */}
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                    Edit notes manually
                  </summary>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field w-full h-24 resize-none mt-2 text-sm"
                    placeholder="Notes will appear here with timestamps..."
                  />
                </details>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-dark-border">
                {editingLead && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingLead.id)}
                    className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingLead ? 'Save Changes' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  )
}
