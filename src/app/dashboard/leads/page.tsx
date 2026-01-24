'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', type: 'buyer', status: 'new', priority: 5,
    budget: '', preferredArea: '', followUpDate: '', birthday: '', homeAnniversary: '', notes: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('repal_leads')
    if (saved) setLeads(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('repal_leads', JSON.stringify(leads))
  }, [leads])

  const getPriorityColor = (p: number) => {
    if (p <= 3) return '#C97B63'
    if (p <= 6) return '#D4AF37'
    return '#666'
  }

  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = { new: '#4ECDC4', contacted: '#6B8DD6', qualified: '#D4AF37', negotiating: '#C97B63', closed: '#4A9B7F', lost: '#666' }
    return colors[s] || '#666'
  }

  const getTypeColor = (t: string) => {
    const colors: Record<string, string> = { buyer: '#4A9B7F', buyer55: '#4A9B7F', seller: '#6B8DD6', investor: '#9B59B6', renter: '#E67E22' }
    return colors[t] || '#666'
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || 
      (priorityFilter === 'hot' && lead.priority <= 3) ||
      (priorityFilter === 'warm' && lead.priority > 3 && lead.priority <= 6) ||
      (priorityFilter === 'cold' && lead.priority > 6)
    return matchesSearch && matchesStatus && matchesPriority
  })

  const todaysFollowUps = leads.filter(lead => lead.followUpDate === new Date().toISOString().split('T')[0])
  const hotLeads = leads.filter(lead => lead.priority <= 3)

  const saveLead = () => {
    if (!formData.name) return alert('Please enter a name')
    if (editingLead) {
      setLeads(leads.map(l => l.id === editingLead.id ? { ...formData, id: editingLead.id } : l))
    } else {
      setLeads([...leads, { ...formData, id: Date.now(), createdAt: new Date().toISOString() }])
    }
    resetForm()
  }

  const deleteLead = (id: number) => {
    if (confirm('Delete this lead?')) setLeads(leads.filter(l => l.id !== id))
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', type: 'buyer', status: 'new', priority: 5, budget: '', preferredArea: '', followUpDate: '', birthday: '', homeAnniversary: '', notes: '' })
    setEditingLead(null)
    setShowForm(false)
  }

  const addTimestamp = () => {
    const now = new Date()
    const timestamp = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) + ' @ ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    setFormData({ ...formData, notes: (formData.notes ? formData.notes + '\n\n' : '') + `[${timestamp}] ` })
  }

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">👥 Lead Manager</h1>
          <p className="text-gray-400 text-sm">Track and nurture your client relationships</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ Add Lead</button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[150px] px-4 py-3 text-base bg-dark-card border border-dark-border rounded-lg text-white outline-none focus:border-primary-500"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 text-sm bg-[#0D0D0D] border border-dark-border rounded-lg text-white min-w-[120px] cursor-pointer">
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="negotiating">Negotiating</option>
          <option value="closed">Closed</option>
          <option value="lost">Lost</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-4 py-3 text-sm bg-[#0D0D0D] border border-dark-border rounded-lg text-white min-w-[120px] cursor-pointer">
          <option value="all">All Priority</option>
          <option value="hot">🔥 Hot (1-3)</option>
          <option value="warm">☀️ Warm (4-6)</option>
          <option value="cold">❄️ Cold (7-10)</option>
        </select>
      </div>

      {/* Today's Follow-ups */}
      {todaysFollowUps.length > 0 && (
        <div className="mb-6 p-4 bg-primary-500/10 rounded-xl border border-primary-500/30">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-primary-400 font-semibold">📅 Today's Follow-ups ({todaysFollowUps.length})</h3>
            <span className="text-xs text-gray-500">Messages ready to send</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {todaysFollowUps.slice(0, 3).map(lead => (
              <button key={lead.id} className="px-3 py-2 bg-[#4ECDC4]/20 text-[#4ECDC4] rounded-lg text-sm hover:bg-[#4ECDC4]/30 transition-colors">
                💬 {lead.name?.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lead Cards */}
      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">👥</span>
            <p className="text-gray-400">No leads yet. Add your first lead!</p>
          </div>
        ) : (
          filteredLeads.map(lead => (
            <div key={lead.id} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-5 border border-dark-border hover:border-primary-500/30 transition-all">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-playfair text-lg text-white">{lead.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: getPriorityColor(lead.priority) }}>
                    {lead.priority <= 3 ? '🔥' : lead.priority <= 6 ? '☀️' : '❄️'} P{lead.priority}
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold text-white capitalize" style={{ backgroundColor: getTypeColor(lead.type) }}>
                    {lead.type === 'buyer55' ? 'Buyer 55+' : lead.type}
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold text-white capitalize" style={{ backgroundColor: getStatusColor(lead.status) }}>
                    {lead.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {lead.phone && <a href={`tel:${lead.phone}`} className="text-xl hover:scale-110 transition-transform">📞</a>}
                  {lead.email && <a href={`mailto:${lead.email}`} className="text-xl hover:scale-110 transition-transform">✉️</a>}
                  <button onClick={() => { setEditingLead(lead); setFormData(lead); setShowForm(true) }} className="text-xl hover:scale-110 transition-transform">✏️</button>
                  <button onClick={() => deleteLead(lead.id)} className="text-xl hover:scale-110 transition-transform">🗑️</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                {lead.phone && <span>📱 {lead.phone}</span>}
                {lead.email && <span>✉️ {lead.email}</span>}
                {lead.budget && <span>💰 ${lead.budget}</span>}
                {lead.preferredArea && <span>📍 {lead.preferredArea}</span>}
              </div>
              {lead.notes && (
                <div className="text-sm text-gray-300 leading-relaxed p-4 bg-[#0D0D0D] rounded-lg font-mono whitespace-pre-wrap">
                  {lead.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Lead Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-dark-border">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">{editingLead ? 'Edit Lead' : 'Add New Lead'}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Full Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                  <option value="buyer">Buyer</option>
                  <option value="buyer55">Buyer 55+</option>
                  <option value="seller">Seller</option>
                  <option value="investor">Investor</option>
                  <option value="renter">Renter</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="closed">Closed</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Follow Up Date</label>
                <input type="date" value={formData.followUpDate} onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Budget</label>
                <input type="text" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="e.g. 400,000" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Preferred Area</label>
                <input type="text" value={formData.preferredArea} onChange={(e) => setFormData({ ...formData, preferredArea: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
            </div>

            {/* Priority Selector */}
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Priority (1 = Hottest, 10 = Coldest)</label>
              <div className="flex gap-2 flex-wrap">
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <button key={num} type="button" onClick={() => setFormData({ ...formData, priority: num })} className="w-9 h-9 rounded-lg font-semibold text-sm transition-all" style={{ backgroundColor: formData.priority === num ? getPriorityColor(num) : '#1A1A1A', borderColor: formData.priority === num ? getPriorityColor(num) : '#2A2A2A', border: '1px solid', color: formData.priority === num ? '#fff' : '#8A8A8A' }}>{num}</button>
                ))}
              </div>
              <p className="text-sm mt-2" style={{ color: getPriorityColor(formData.priority) }}>
                {formData.priority <= 3 ? '🔥 Hot - Contact within 24 hours' : formData.priority <= 6 ? '☀️ Warm - Follow up this week' : '❄️ Cold - Nurture over time'}
              </p>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">🎂 Birthday</label>
                <input type="date" value={formData.birthday} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">🏠 Home Anniversary</label>
                <input type="date" value={formData.homeAnniversary} onChange={(e) => setFormData({ ...formData, homeAnniversary: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                <label className="text-xs text-gray-400 uppercase tracking-wider">Notes Log</label>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" className="px-3 py-1.5 text-xs font-semibold bg-[#1F1F1F] border border-dark-border rounded-lg text-white hover:bg-dark-border transition-colors">📋 AI Follow-up</button>
                  <button type="button" className="px-3 py-1.5 text-xs font-semibold bg-[#1F1F1F] border border-dark-border rounded-lg text-white hover:bg-dark-border transition-colors">✨ AI Rewrite</button>
                  <button type="button" className="px-3 py-1.5 text-xs font-semibold bg-[#1F1F1F] border border-dark-border rounded-lg text-white hover:bg-dark-border transition-colors">🎤 Voice</button>
                </div>
              </div>
              
              {/* Timestamp Button */}
              <div className="mb-3 p-3 bg-[#4ECDC4]/10 rounded-lg border border-[#4ECDC4]/20">
                <p className="text-xs text-[#4ECDC4] font-semibold mb-2 uppercase">📝 Add New Note Entry</p>
                <button type="button" onClick={addTimestamp} className="w-full py-2.5 text-sm font-semibold bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] text-white rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  🕐 Add Timestamped Entry
                </button>
                <p className="text-xs text-gray-500 mt-2 italic text-center">Always timestamp your notes so other agents can follow the conversation history</p>
              </div>

              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Continue typing your note..." className="w-full min-h-[150px] px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white font-mono text-sm leading-relaxed outline-none focus:border-primary-500 resize-y" />
            </div>

            <div className="flex gap-4 justify-end">
              <button onClick={resetForm} className="px-6 py-3 text-sm font-semibold text-gray-400 border border-dark-border rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={saveLead} className="px-6 py-3 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">Save Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
