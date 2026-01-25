'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

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
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  hot: 'bg-red-500/20 text-red-400',
  warm: 'bg-yellow-500/20 text-yellow-400',
  cold: 'bg-gray-500/20 text-gray-400',
  waiting: 'bg-purple-500/20 text-purple-400',
  closed: 'bg-green-500/20 text-green-400',
  lost: 'bg-gray-500/20 text-gray-500',
}

export default function LeadsPage() {
  const { user } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', status: 'new', type: 'buyer', source: '', notes: '' })

  useEffect(() => { if (user) loadLeads() }, [user])

  const loadLeads = () => {
    if (!user) return
    setLoading(true)
    const saved = localStorage.getItem(`leads_${user.id}`)
    if (saved) setLeads(JSON.parse(saved))
    setLoading(false)
  }

  const saveLeads = (newLeads: Lead[]) => {
    if (!user) return
    localStorage.setItem(`leads_${user.id}`, JSON.stringify(newLeads))
    setLeads(newLeads)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    const now = new Date().toISOString()
    if (editingLead) {
      const updated = leads.map(l => l.id === editingLead.id ? { ...l, ...formData, last_contact: now } : l)
      saveLeads(updated)
      setEditingLead(null)
    } else {
      const newLead: Lead = { id: `lead_${Date.now()}`, ...formData, last_contact: now, created_at: now }
      saveLeads([newLead, ...leads])
    }
    setFormData({ name: '', email: '', phone: '', status: 'new', type: 'buyer', source: '', notes: '' })
    setShowForm(false)
  }

  const deleteLead = (id: string) => {
    if (confirm('Delete this lead?')) saveLeads(leads.filter(l => l.id !== id))
  }

  const editLead = (lead: Lead) => {
    setEditingLead(lead)
    setFormData({ name: lead.name, email: lead.email, phone: lead.phone, status: lead.status, type: lead.type, source: lead.source, notes: lead.notes })
    setShowForm(true)
  }

  const updateLastContact = (id: string) => {
    const updated = leads.map(l => l.id === id ? { ...l, last_contact: new Date().toISOString() } : l)
    saveLeads(updated)
  }

  const filteredLeads = leads.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const daysSince = (date: string) => {
    if (!date) return 999
    return Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">← Back</Link>
          <h1 className="font-playfair text-2xl md:text-3xl text-white mt-1">👥 Lead Manager</h1>
        </div>
        <button onClick={() => { setShowForm(true); setEditingLead(null); setFormData({ name: '', email: '', phone: '', status: 'new', type: 'buyer', source: '', notes: '' }) }} className="px-4 py-2 bg-primary-500 text-dark-bg rounded-lg font-semibold hover:bg-primary-400">+ Add Lead</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white">
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
          <option value="waiting">Waiting</option>
          <option value="closed">Closed</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {showForm && (
        <div className="card border-primary-500/30">
          <h3 className="font-semibold text-white mb-4">{editingLead ? 'Edit Lead' : 'Add New Lead'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Name *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white" required />
              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white" />
              <input type="tel" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white" />
              <input type="text" placeholder="Source (Zillow, Referral, etc)" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white" />
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white">
                <option value="new">New</option><option value="hot">Hot</option><option value="warm">Warm</option><option value="cold">Cold</option><option value="waiting">Waiting</option><option value="closed">Closed</option><option value="lost">Lost</option>
              </select>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white">
                <option value="buyer">Buyer</option><option value="seller">Seller</option><option value="both">Both</option><option value="investor">Investor</option><option value="renter">Renter</option>
              </select>
            </div>
            <textarea placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white h-20" />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary-500 text-dark-bg rounded-lg font-semibold hover:bg-primary-400">{editingLead ? 'Update' : 'Add'} Lead</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingLead(null) }} className="px-4 py-2 bg-dark-border text-gray-400 rounded-lg hover:text-white">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {filteredLeads.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">👥</span>
          <h3 className="text-xl font-semibold text-white mb-2">{leads.length === 0 ? 'No leads yet' : 'No matching leads'}</h3>
          <p className="text-gray-400">{leads.length === 0 ? 'Add your first lead to get started!' : 'Try adjusting your filters'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map(lead => (
            <div key={lead.id} className="card hover:border-primary-500/30 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-xl">{lead.name.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white">{lead.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${statusColors[lead.status] || 'bg-gray-500/20 text-gray-400'}`}>{lead.status}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-dark-bg text-gray-400 capitalize">{lead.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
                    {lead.email && <span>📧 {lead.email}</span>}
                    {lead.phone && <span>📱 {lead.phone}</span>}
                    {lead.source && <span>📍 {lead.source}</span>}
                  </div>
                  {lead.notes && <p className="text-sm text-gray-500 mt-2 line-clamp-1">{lead.notes}</p>}
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className={`${daysSince(lead.last_contact) >= 14 ? 'text-yellow-400' : 'text-gray-500'}`}>Last contact: {daysSince(lead.last_contact) === 0 ? 'Today' : `${daysSince(lead.last_contact)} days ago`}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => updateLastContact(lead.id)} className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">Contacted</button>
                  <button onClick={() => editLead(lead)} className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30">Edit</button>
                  <button onClick={() => deleteLead(lead.id)} className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center"><p className="text-2xl font-bold text-white">{leads.length}</p><p className="text-xs text-gray-400">Total Leads</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-red-400">{leads.filter(l => l.status === 'hot').length}</p><p className="text-xs text-gray-400">Hot</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-yellow-400">{leads.filter(l => daysSince(l.last_contact) >= 14 && l.status !== 'closed' && l.status !== 'lost').length}</p><p className="text-xs text-gray-400">Need Follow-up</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-green-400">{leads.filter(l => l.status === 'closed').length}</p><p className="text-xs text-gray-400">Closed</p></div>
      </div>
    </div>
  )
}
