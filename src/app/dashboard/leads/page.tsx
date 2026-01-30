'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/types/database'

const priorityDescriptions: Record<number, string> = {
  1: '🔥 Buying in 1-2 months',
  2: '🔥 Very Hot - Actively looking',
  3: '🔥 Hot - Serious buyer',
  4: '☀️ Warm - Interested',
  5: '☀️ Moderate - Considering',
  6: '☀️ Lukewarm - Future buyer (6+ months)',
  7: '❄️ Cool - Just browsing',
  8: '❄️ Cold - Not ready yet',
  9: '❄️ Very Cold - Long term',
  10: '❄️ Coldest - Unresponsive'
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  qualified: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  negotiating: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  closed: 'bg-green-500/20 text-green-400 border-green-500/30',
  lost: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const typeLabels: Record<string, { label: string; icon: string }> = {
  buyer: { label: 'Buyer', icon: '🏠' },
  buyer55: { label: 'Buyer 55+', icon: '🏡' },
  seller: { label: 'Seller', icon: '💰' },
  investor: { label: 'Investor', icon: '📈' },
  renter: { label: 'Renter', icon: '🔑' },
  both: { label: 'Buyer/Seller', icon: '🔄' },
}

const getPriorityColor = (p: number) => {
  if (p <= 3) return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' }
  if (p <= 6) return { bg: 'bg-primary-500/20', text: 'text-primary-500', border: 'border-primary-500/30' }
  return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
}

const getPriorityEmoji = (p: number) => {
  if (p <= 3) return '🔥'
  if (p <= 6) return '☀️'
  return '❄️'
}

// Speech-to-text hook
function useSpeechToText() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const toggleListening = useCallback(() => {
    if (!isSupported) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript)
        }
      }

      recognitionRef.current.onerror = () => setIsListening(false)
      recognitionRef.current.onend = () => setIsListening(false)

      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening, isSupported])

  return { isListening, transcript, isSupported, toggleListening, setTranscript }
}

export default function LeadsPage() {
  const { user } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterFollowupToday, setFilterFollowupToday] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [importStatus, setImportStatus] = useState('')
  const notesScrollRef = useRef<HTMLDivElement>(null)
  
  const { isListening, transcript, isSupported, toggleListening, setTranscript } = useSpeechToText()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'buyer' as Lead['type'],
    source: 'manual',
    status: 'new' as Lead['status'],
    notes: '',
    property_interest: '',
    budget_min: '',
    budget_max: '',
    priority: 5,
    follow_up_date: '',
    preferred_area: '',
    birthday: '',
    home_anniversary: '',
  })

  const supabase = createClient()

  // Handle speech-to-text transcript
  useEffect(() => {
    if (transcript) {
      setFormData(prev => ({ ...prev, notes: (prev.notes + ' ' + transcript).trim() }))
      setTranscript('')
    }
  }, [transcript, setTranscript])

  // Auto-scroll notes to bottom when lead is selected
  useEffect(() => {
    if (selectedLead && notesScrollRef.current) {
      setTimeout(() => {
        notesScrollRef.current?.scrollTo({ top: notesScrollRef.current.scrollHeight, behavior: 'smooth' })
      }, 100)
    }
  }, [selectedLead])

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

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      type: 'buyer',
      source: 'manual',
      status: 'new',
      notes: '',
      property_interest: '',
      budget_min: '',
      budget_max: '',
      priority: 5,
      follow_up_date: '',
      preferred_area: '',
      birthday: '',
      home_anniversary: '',
    })
    setEditingLead(null)
    setShowAddModal(false)
  }

  const saveLead = async () => {
    if (!user || !formData.name.trim()) return

    const leadData = {
      user_id: user.id,
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      type: formData.type,
      source: formData.source,
      status: formData.status,
      notes: formData.notes || null,
      property_interest: formData.property_interest || null,
      budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
      budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
      priority: formData.priority,
      follow_up_date: formData.follow_up_date || null,
      preferred_area: formData.preferred_area || null,
      birthday: formData.birthday || null,
      home_anniversary: formData.home_anniversary || null,
    }

    if (editingLead) {
      const { error } = await supabase
        .from('leads')
        .update(leadData)
        .eq('id', editingLead.id)

      if (error) {
        console.error('Error updating lead:', error)
      } else {
        setLeads(leads.map(l => l.id === editingLead.id ? { ...l, ...leadData } : l))
        resetForm()
      }
    } else {
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single()

      if (error) {
        console.error('Error adding lead:', error)
      } else if (data) {
        setLeads([data, ...leads])
        resetForm()
      }
    }
  }

  const editLead = (lead: Lead) => {
    setFormData({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      type: lead.type,
      source: lead.source,
      status: lead.status,
      notes: lead.notes || '',
      property_interest: lead.property_interest || '',
      budget_min: lead.budget_min?.toString() || '',
      budget_max: lead.budget_max?.toString() || '',
      priority: lead.priority || 5,
      follow_up_date: lead.follow_up_date || '',
      preferred_area: lead.preferred_area || '',
      birthday: lead.birthday || '',
      home_anniversary: lead.home_anniversary || '',
    })
    setEditingLead(lead)
    setSelectedLead(null)
    setShowAddModal(true)
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
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus as Lead['status'] })
      }
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

  // Quick message generation
  const getQuickMessage = (lead: Lead) => {
    const name = lead.name.split(' ')[0]
    const priority = lead.priority || 5
    const isBuyer = lead.type === 'buyer' || lead.type === 'buyer55'
    
    if (priority <= 3) {
      return `Hi ${name}! 🔥 You're on my priority list today. ${isBuyer ? "I found some great properties I'd love to show you!" : "Let's discuss your listing strategy."} When are you free to connect?`
    } else if (priority <= 6) {
      return `Hey ${name}! Just checking in as promised. ${isBuyer ? "Any updates on your home search?" : "How are things going with your real estate plans?"} Let me know how I can help!`
    } else {
      return `Hi ${name}, hope you're doing well! Wanted to touch base and see if you have any questions about ${isBuyer ? "the market" : "your property"}. I'm here when you're ready!`
    }
  }

  const copyQuickMessage = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message)
      setImportStatus('✓ Copied!')
      setTimeout(() => setImportStatus(''), 2000)
    } catch {
      setImportStatus('Failed to copy')
      setTimeout(() => setImportStatus(''), 2000)
    }
  }

  const sendQuickMessage = (lead: Lead, message: string) => {
    const phone = lead.phone?.replace(/\D/g, '')
    if (phone) {
      window.open(`sms:${phone}?body=${encodeURIComponent(message)}`, '_blank')
    } else if (lead.email) {
      window.open(`mailto:${lead.email}?subject=${encodeURIComponent('Following Up')}&body=${encodeURIComponent(message)}`, '_blank')
    }
  }

  // Add timestamp to notes
  const addTimestampToNotes = () => {
    const now = new Date()
    const timestamp = `[${now.toLocaleDateString('en-US')} ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}] `
    setFormData(prev => ({ ...prev, notes: timestamp + prev.notes }))
  }

  // Filter and sort leads
  const today = new Date().toISOString().split('T')[0]
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone?.includes(searchTerm))
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus
    const matchesPriority = filterPriority === 'all' || 
      (filterPriority === 'hot' && (lead.priority || 5) <= 3) ||
      (filterPriority === 'warm' && (lead.priority || 5) >= 4 && (lead.priority || 5) <= 6) ||
      (filterPriority === 'cold' && (lead.priority || 5) >= 7)
    const matchesFollowup = !filterFollowupToday || lead.follow_up_date === today
    return matchesSearch && matchesStatus && matchesPriority && matchesFollowup
  }).sort((a, b) => (a.priority || 10) - (b.priority || 10))

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Stats
  const hotLeads = leads.filter(l => (l.priority || 5) <= 3)
  const warmLeads = leads.filter(l => (l.priority || 5) >= 4 && (l.priority || 5) <= 6)
  const todayFollowUps = leads.filter(l => l.follow_up_date === today)

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

      {/* Import Status Toast */}
      {importStatus && (
        <div className="fixed top-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg z-50 animate-fade-in">
          {importStatus}
        </div>
      )}

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
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="input-field"
        >
          <option value="all">All Priority</option>
          <option value="hot">🔥 Hot (1-3)</option>
          <option value="warm">☀️ Warm (4-6)</option>
          <option value="cold">❄️ Cold (7-10)</option>
        </select>
      </div>

      {/* Stats - Clickable to filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <button 
          onClick={() => { setFilterPriority('all'); setFilterStatus('all'); setFilterFollowupToday(false); }}
          className={`card text-center transition-all hover:scale-105 ${filterPriority === 'all' && filterStatus === 'all' && !filterFollowupToday ? 'ring-2 ring-white/50' : ''}`}
        >
          <p className="text-2xl font-bold text-white">{leads.length}</p>
          <p className="text-gray-400 text-sm">Total Leads</p>
        </button>
        <button 
          onClick={() => { setFilterPriority('hot'); setFilterStatus('all'); setFilterFollowupToday(false); }}
          className={`card text-center border-orange-500/30 transition-all hover:scale-105 hover:border-orange-500 ${filterPriority === 'hot' ? 'ring-2 ring-orange-500' : ''}`}
        >
          <p className="text-2xl font-bold text-orange-400">🔥 {hotLeads.length}</p>
          <p className="text-gray-400 text-sm">Hot Leads</p>
        </button>
        <button 
          onClick={() => { setFilterPriority('warm'); setFilterStatus('all'); setFilterFollowupToday(false); }}
          className={`card text-center border-primary-500/30 transition-all hover:scale-105 hover:border-primary-500 ${filterPriority === 'warm' ? 'ring-2 ring-primary-500' : ''}`}
        >
          <p className="text-2xl font-bold text-primary-500">☀️ {warmLeads.length}</p>
          <p className="text-gray-400 text-sm">Warm Leads</p>
        </button>
        <button 
          onClick={() => { setFilterPriority('all'); setFilterStatus('all'); setFilterFollowupToday(!filterFollowupToday); }}
          className={`card text-center border-green-500/30 transition-all hover:scale-105 hover:border-green-500 ${filterFollowupToday ? 'ring-2 ring-green-500' : ''}`}
        >
          <p className="text-2xl font-bold text-green-400">{todayFollowUps.length}</p>
          <p className="text-gray-400 text-sm">Follow-ups Today</p>
        </button>
      </div>

      {/* Today's Follow-ups Alert */}
      {todayFollowUps.length > 0 && (
        <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
          <h3 className="text-primary-500 font-semibold mb-2">📞 Today&apos;s Follow-ups</h3>
          <div className="space-y-2">
            {todayFollowUps.map(lead => (
              <div key={lead.id} className="flex items-center justify-between">
                <span className="text-white">{lead.name}</span>
                <button
                  onClick={() => setSelectedLead(lead)}
                  className="text-primary-500 hover:underline text-sm"
                >
                  View →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' ? 'No leads match your filters' : 'No leads yet'}
          </p>
          {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              Add Your First Lead
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map(lead => {
            const priority = lead.priority || 5
            const priorityColors = getPriorityColor(priority)
            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="card cursor-pointer hover:border-primary-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${priorityColors.bg} ${priorityColors.border} border`}>
                      <span className="text-lg">{getPriorityEmoji(priority)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{lead.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityColors.bg} ${priorityColors.text}`}>
                          P{priority}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm flex items-center gap-2">
                        <span>{typeLabels[lead.type]?.icon} {typeLabels[lead.type]?.label}</span>
                        {lead.preferred_area && <span>• {lead.preferred_area}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[lead.status]}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                    {lead.follow_up_date && (
                      <span className="text-gray-500 text-sm hidden sm:block">
                        📅 {formatDate(lead.follow_up_date)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-card">
              <h2 className="text-xl font-bold text-white">{editingLead ? 'Edit Lead' : 'Add New Lead'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="John Smith"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field w-full"
                    placeholder="john@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field w-full"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Lead['type'] })}
                    className="input-field w-full"
                  >
                    <option value="buyer">🏠 Buyer</option>
                    <option value="buyer55">🏡 Buyer 55+</option>
                    <option value="seller">💰 Seller</option>
                    <option value="investor">📈 Investor</option>
                    <option value="renter">🔑 Renter</option>
                    <option value="both">🔄 Buyer/Seller</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
                    className="input-field w-full"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="closed">Closed</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Priority (1 = Hottest, 10 = Coldest)</label>
                <div className="flex gap-1 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                    const colors = getPriorityColor(num)
                    const isSelected = formData.priority === num
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: num })}
                        className={`w-9 h-9 rounded-lg font-semibold transition-all ${
                          isSelected 
                            ? `${colors.bg} ${colors.text} ${colors.border} border-2` 
                            : 'bg-dark-border text-gray-400 hover:text-white border border-transparent'
                        }`}
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>
                <p className="text-sm text-gray-500 mt-2">{priorityDescriptions[formData.priority]}</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Preferred Area</label>
                  <input
                    type="text"
                    value={formData.preferred_area}
                    onChange={(e) => setFormData({ ...formData, preferred_area: e.target.value })}
                    className="input-field w-full"
                    placeholder="Winter Park, FL"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Budget Min</label>
                  <input
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                    className="input-field w-full"
                    placeholder="250000"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Budget Max</label>
                  <input
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                    className="input-field w-full"
                    placeholder="400000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Property Interest</label>
                <input
                  type="text"
                  value={formData.property_interest}
                  onChange={(e) => setFormData({ ...formData, property_interest: e.target.value })}
                  className="input-field w-full"
                  placeholder="3BR in Winter Park, pool preferred"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">🎂 BIRTHDAY</label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="input-field w-full"
                    placeholder="mm/dd/yyyy"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">🏠 HOME ANNIVERSARY</label>
                  <input
                    type="date"
                    value={formData.home_anniversary}
                    onChange={(e) => setFormData({ ...formData, home_anniversary: e.target.value })}
                    className="input-field w-full"
                    placeholder="mm/dd/yyyy"
                  />
                </div>
              </div>

              {/* Notes Log Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-400 text-sm font-semibold tracking-wide">NOTES LOG</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-dark-border text-gray-300 rounded-lg text-sm hover:bg-dark-border/80 transition-colors flex items-center gap-1"
                    >
                      📁 AI Follow-up
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-dark-border text-gray-300 rounded-lg text-sm hover:bg-dark-border/80 transition-colors flex items-center gap-1"
                    >
                      ✨ AI Rewrite
                    </button>
                    {isSupported && (
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                          isListening ? 'bg-orange-500 text-white' : 'bg-dark-border text-gray-300 hover:bg-dark-border/80'
                        }`}
                      >
                        🎤 Voice
                      </button>
                    )}
                  </div>
                </div>

                {isListening && (
                  <div className="flex items-center gap-2 text-orange-400 text-sm">
                    <span className="animate-pulse">●</span> Listening...
                  </div>
                )}

                {/* Add New Note Entry */}
                <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl">
                  <p className="text-teal-400 text-sm font-semibold mb-3 flex items-center gap-1">
                    📝 ADD NEW NOTE ENTRY
                  </p>
                  <button
                    type="button"
                    onClick={addTimestampToNotes}
                    className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-dark-bg font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    ⏱️ Add Timestamped Entry
                  </button>
                  <p className="text-gray-500 text-xs text-center mt-2 italic">
                    Always timestamp your notes so other agents can follow the conversation history
                  </p>
                </div>

                {/* Notes Display Area */}
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field w-full font-mono text-sm"
                  rows={6}
                  placeholder="[1/27/2026 @ 9:00 AM] Met at open house. Looking for 3BR in Winter Park..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-dark-border flex gap-3 sticky bottom-0 bg-dark-card">
              <button onClick={resetForm} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={saveLead} className="btn-primary flex-1" disabled={!formData.name.trim()}>
                {editingLead ? 'Save Changes' : 'Add Lead'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-card">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getPriorityColor(selectedLead.priority || 5).bg}`}>
                  <span className="text-2xl">{typeLabels[selectedLead.type]?.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedLead.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[selectedLead.status]}`}>
                      {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(selectedLead.priority || 5).bg} ${getPriorityColor(selectedLead.priority || 5).text}`}>
                      {getPriorityEmoji(selectedLead.priority || 5)} P{selectedLead.priority || 5}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Quick Message */}
              <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                <p className="text-sm text-gray-400 mb-2">Quick Message</p>
                <p className="text-white text-sm mb-3">{getQuickMessage(selectedLead)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyQuickMessage(getQuickMessage(selectedLead))}
                    className="flex-1 px-3 py-2 bg-dark-border text-gray-300 rounded-lg text-sm hover:text-white transition-colors"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => sendQuickMessage(selectedLead, getQuickMessage(selectedLead))}
                    className="flex-1 px-3 py-2 bg-primary-500 text-dark-bg rounded-lg text-sm font-semibold hover:bg-primary-400 transition-colors"
                  >
                    📤 Send
                  </button>
                </div>
              </div>

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
              {selectedLead.preferred_area && (
                <div>
                  <p className="text-gray-500 text-sm">Preferred Area</p>
                  <p className="text-white">{selectedLead.preferred_area}</p>
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
              {selectedLead.follow_up_date && (
                <div>
                  <p className="text-gray-500 text-sm">Follow-up Date</p>
                  <p className="text-white">📅 {formatDate(selectedLead.follow_up_date)}</p>
                </div>
              )}
              {(selectedLead.birthday || selectedLead.home_anniversary) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedLead.birthday && (
                    <div>
                      <p className="text-gray-500 text-sm">🎂 Birthday</p>
                      <p className="text-white">{formatDate(selectedLead.birthday)}</p>
                    </div>
                  )}
                  {selectedLead.home_anniversary && (
                    <div>
                      <p className="text-gray-500 text-sm">🏠 Home Anniversary</p>
                      <p className="text-white">{formatDate(selectedLead.home_anniversary)}</p>
                    </div>
                  )}
                </div>
              )}
              {/* Notes Log Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-400 text-sm font-semibold tracking-wide">NOTES LOG</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-dark-border text-gray-300 rounded-lg text-sm hover:bg-dark-border/80 transition-colors flex items-center gap-1"
                    >
                      📁 AI Follow-up
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-dark-border text-gray-300 rounded-lg text-sm hover:bg-dark-border/80 transition-colors flex items-center gap-1"
                    >
                      ✨ AI Rewrite
                    </button>
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                        isListening ? 'bg-orange-500 text-white' : 'bg-dark-border text-gray-300 hover:bg-dark-border/80'
                      }`}
                    >
                      🎤 Voice
                    </button>
                  </div>
                </div>

                {isListening && (
                  <div className="flex items-center gap-2 text-orange-400 text-sm">
                    <span className="animate-pulse">●</span> Listening...
                  </div>
                )}

                {/* Add New Note Entry */}
                <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl">
                  <p className="text-teal-400 text-sm font-semibold mb-3 flex items-center gap-1">
                    📝 ADD NEW NOTE ENTRY
                  </p>
                  <button
                    type="button"
                    onClick={() => editLead(selectedLead)}
                    className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-dark-bg font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    ⏱️ Add Timestamped Entry
                  </button>
                  <p className="text-gray-500 text-xs text-center mt-2 italic">
                    Always timestamp your notes so other agents can follow the conversation history
                  </p>
                </div>

                {/* Notes Display Area */}
                <div 
                  ref={notesScrollRef}
                  className="p-4 bg-dark-bg border border-dark-border rounded-xl max-h-48 overflow-y-auto"
                >
                  {selectedLead.notes ? (
                    <p className="text-white whitespace-pre-wrap font-mono text-sm">{selectedLead.notes}</p>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No notes yet. Click "Add Timestamped Entry" to add your first note.</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {(['new', 'contacted', 'qualified', 'negotiating', 'closed', 'lost'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => updateLeadStatus(selectedLead.id, status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        selectedLead.status === status
                          ? statusColors[status]
                          : 'bg-dark-border text-gray-400 border-transparent hover:text-white'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-dark-border flex gap-3 sticky bottom-0 bg-dark-card">
              <button 
                onClick={() => deleteLead(selectedLead.id)} 
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={() => editLead(selectedLead)} 
                className="btn-secondary flex-1"
              >
                Edit
              </button>
              <button onClick={() => setSelectedLead(null)} className="btn-primary flex-1">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
