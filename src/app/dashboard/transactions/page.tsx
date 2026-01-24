'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

// ============ INLINE EDITABLE COMPONENTS ============

// Inline Text/Number Field - click to edit
function InlineEdit({ value, onChange, type = 'text', placeholder = '', prefix = '', suffix = '', className = '', displayClassName = '' }: {
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'number'
  placeholder?: string
  prefix?: string
  suffix?: string
  className?: string
  displayClassName?: string
}) {
  const [editing, setEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setTempValue(value) }, [value])
  useEffect(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select() } }, [editing])

  const save = () => { onChange(tempValue); setEditing(false) }
  const cancel = () => { setTempValue(value); setEditing(false) }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
        placeholder={placeholder}
        className={`bg-primary-500/20 border border-primary-500 rounded px-2 py-1 outline-none text-white ${className}`}
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  const displayValue = type === 'number' && value ? parseFloat(value).toLocaleString() : value
  return (
    <span onClick={(e) => { e.stopPropagation(); setEditing(true) }} className={`cursor-pointer hover:bg-white/10 rounded px-1 py-0.5 transition-colors ${!value ? 'text-gray-500 italic' : ''} ${displayClassName}`} title="Click to edit">
      {prefix}{displayValue || placeholder}{suffix}
    </span>
  )
}

// Inline Textarea - click to edit
function InlineTextarea({ value, onChange, placeholder = '', className = '' }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setTempValue(value) }, [value])
  useEffect(() => { if (editing && textareaRef.current) { textareaRef.current.focus() } }, [editing])

  const save = () => { onChange(tempValue); setEditing(false) }

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Escape') { setTempValue(value); setEditing(false) } }}
        placeholder={placeholder}
        rows={3}
        className={`w-full bg-primary-500/20 border border-primary-500 rounded-lg px-3 py-2 outline-none text-white text-sm resize-none ${className}`}
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  return (
    <div onClick={(e) => { e.stopPropagation(); setEditing(true) }} className={`cursor-pointer hover:bg-white/5 rounded-lg px-2 py-2 transition-colors min-h-[60px] ${!value ? 'text-gray-500 italic' : 'text-gray-300'} ${className}`} title="Click to edit">
      {value || placeholder}
    </div>
  )
}

// Inline Date Picker - click to edit
function InlineDate({ value, onChange, placeholder = 'Set date' }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [showPicker, setShowPicker] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value + 'T00:00:00') : new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowPicker(false) }
    if (showPicker) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPicker])

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const todayStr = new Date().toISOString().split('T')[0]

  const formatDate = (dateStr: string) => !dateStr ? placeholder : new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="relative inline-block" ref={containerRef}>
      <span onClick={(e) => { e.stopPropagation(); setShowPicker(true) }} className={`cursor-pointer hover:bg-white/10 rounded px-1 py-0.5 transition-colors ${!value ? 'text-gray-500 italic' : 'text-white'}`} title="Click to edit">
        {formatDate(value)}
      </span>
      {showPicker && (
        <div className="absolute z-[100] mt-2 left-0 p-3 rounded-xl border border-primary-500/30 shadow-2xl min-w-[220px]" style={{ background: 'linear-gradient(145deg, rgba(30,30,30,0.98) 0%, rgba(15,15,15,0.99) 100%)' }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="w-6 h-6 rounded bg-white/5 text-white/70 text-xs">‹</button>
            <span className="text-white text-sm font-medium">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="w-6 h-6 rounded bg-white/5 text-white/70 text-xs">›</button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">{dayNames.map((d, i) => <div key={i} className="w-7 h-5 flex items-center justify-center text-xs text-primary-400">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array(firstDayOfMonth(currentMonth)).fill(null).map((_, i) => <div key={`e-${i}`} className="w-7 h-7" />)}
            {Array(daysInMonth(currentMonth)).fill(null).map((_, i) => {
              const day = i + 1
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              return (
                <button key={day} onClick={() => { onChange(dateStr); setShowPicker(false) }}
                  className={`w-7 h-7 rounded text-xs flex items-center justify-center transition-all ${value === dateStr ? 'bg-primary-500 text-dark-bg font-bold' : dateStr === todayStr ? 'bg-primary-500/20 text-primary-400' : 'text-white hover:bg-white/10'}`}
                >{day}</button>
              )
            })}
          </div>
          <div className="flex gap-1 mt-2 pt-2 border-t border-white/10">
            <button onClick={() => { onChange(todayStr); setShowPicker(false) }} className="flex-1 py-1.5 text-xs bg-primary-500/20 text-primary-400 rounded">Today</button>
            <button onClick={() => { onChange(''); setShowPicker(false) }} className="flex-1 py-1.5 text-xs bg-white/5 text-gray-400 rounded">Clear</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ INTERFACES ============

interface Transaction {
  id: number
  address: string
  clientName: string
  clientType: 'buyer' | 'seller'
  status: string
  price: string
  commission: string
  contractDate: string
  closingDate: string
  notes: string
  leadId: string | null
  createdAt: string
  statusHistory: { status: string; date: string }[]
}

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: string
  type: string
  notes: string
  last_contact: string
}

interface AIAlert {
  id: string
  leadId: string
  leadName: string
  message: string
  suggestedStatus: string
  timestamp: string
  dismissed: boolean
}

// ============ MAIN COMPONENT ============

export default function TransactionsPage() {
  const { user } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [aiAlerts, setAIAlerts] = useState<AIAlert[]>([])
  const [showAIPanel, setShowAIPanel] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  
  const [newAddress, setNewAddress] = useState('')
  const [newClientName, setNewClientName] = useState('')
  const [newClientType, setNewClientType] = useState<'buyer' | 'seller'>('buyer')
  const [newLeadId, setNewLeadId] = useState<string | null>(null)

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#D4AF37', icon: '📋', step: 1 },
    { value: 'under-contract', label: 'Under Contract', color: '#6B8DD6', icon: '📝', step: 2 },
    { value: 'contingent', label: 'Contingent', color: '#9B59B6', icon: '⏳', step: 3 },
    { value: 'inspection', label: 'Inspection', color: '#F39C12', icon: '🔍', step: 4 },
    { value: 'appraisal', label: 'Appraisal', color: '#E67E22', icon: '💰', step: 5 },
    { value: 'clear-to-close', label: 'Clear to Close', color: '#4ECDC4', icon: '✅', step: 6 },
    { value: 'closed', label: 'Closed', color: '#4A9B7F', icon: '🎉', step: 7 },
    { value: 'cancelled', label: 'Cancelled', color: '#E74C3C', icon: '❌', step: 0 }
  ]

  // Load data
  useEffect(() => { 
    const saved = localStorage.getItem('repal_transactions')
    if (saved) setTransactions(JSON.parse(saved))
    const alerts = localStorage.getItem('repal_ai_alerts')
    if (alerts) setAIAlerts(JSON.parse(alerts))
  }, [])

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`leads_${user.id}`)
      if (saved) setLeads(JSON.parse(saved))
    }
  }, [user])

  useEffect(() => { localStorage.setItem('repal_transactions', JSON.stringify(transactions)) }, [transactions])
  useEffect(() => { localStorage.setItem('repal_ai_alerts', JSON.stringify(aiAlerts)) }, [aiAlerts])

  // AI Agent
  useEffect(() => {
    if (!user || leads.length === 0) return
    const keywords: Record<string, string[]> = {
      'under-contract': ['under contract', 'accepted offer', 'offer accepted', 'ratified'],
      'contingent': ['contingent', 'contingency'],
      'inspection': ['inspection scheduled', 'inspection complete'],
      'appraisal': ['appraisal scheduled', 'appraisal complete'],
      'clear-to-close': ['clear to close', 'ctc', 'ready to close'],
      'closed': ['closed', 'closing complete', 'keys handed']
    }
    const newAlerts: AIAlert[] = []
    leads.forEach(lead => {
      if (!lead.notes) return
      const notesLower = lead.notes.toLowerCase()
      const linkedTxn = transactions.find(t => t.leadId === lead.id)
      Object.entries(keywords).forEach(([status, words]) => {
        words.forEach(word => {
          if (notesLower.includes(word)) {
            const exists = aiAlerts.find(a => a.leadId === lead.id && a.suggestedStatus === status && !a.dismissed)
            if (!exists) {
              if (linkedTxn) {
                const cur = statusOptions.find(s => s.value === linkedTxn.status)?.step || 0
                const sug = statusOptions.find(s => s.value === status)?.step || 0
                if (sug > cur) {
                  newAlerts.push({ id: `${lead.id}-${status}-${Date.now()}`, leadId: lead.id, leadName: lead.name, message: `"${word}" found - update status?`, suggestedStatus: status, timestamp: new Date().toISOString(), dismissed: false })
                }
              } else {
                newAlerts.push({ id: `${lead.id}-new-${Date.now()}`, leadId: lead.id, leadName: lead.name, message: `"${word}" found - create transaction?`, suggestedStatus: status, timestamp: new Date().toISOString(), dismissed: false })
              }
            }
          }
        })
      })
    })
    if (newAlerts.length > 0) setAIAlerts(prev => [...prev, ...newAlerts])
  }, [leads, user])

  // Update transaction field
  const updateField = (id: number, field: keyof Transaction, value: any) => {
    setTransactions(txns => txns.map(t => {
      if (t.id !== id) return t
      const updated = { ...t, [field]: value }
      if (field === 'status' && t.status !== value) {
        updated.statusHistory = [...(t.statusHistory || []), { status: value, date: new Date().toISOString() }]
      }
      return updated
    }))
  }

  // Add transaction
  const addTransaction = () => {
    if (!newAddress || !newClientName) return alert('Enter address and client name')
    setTransactions([...transactions, {
      id: Date.now(), address: newAddress, clientName: newClientName, clientType: newClientType,
      status: 'pending', price: '', commission: '3', contractDate: '', closingDate: '', notes: '',
      leadId: newLeadId, createdAt: new Date().toISOString(), statusHistory: [{ status: 'pending', date: new Date().toISOString() }]
    }])
    setNewAddress(''); setNewClientName(''); setNewClientType('buyer'); setNewLeadId(null); setShowAddForm(false)
  }

  const deleteTransaction = (id: number) => { if (confirm('Delete?')) setTransactions(txns => txns.filter(t => t.id !== id)) }
  const dismissAlert = (id: string) => { setAIAlerts(alerts => alerts.map(a => a.id === id ? { ...a, dismissed: true } : a)) }
  const applyAlert = (alert: AIAlert) => { const txn = transactions.find(t => t.leadId === alert.leadId); if (txn) updateField(txn.id, 'status', alert.suggestedStatus); dismissAlert(alert.id) }
  const createFromAlert = (alert: AIAlert) => { const lead = leads.find(l => l.id === alert.leadId); if (lead) { setNewClientName(lead.name); setNewClientType(lead.type === 'Seller' ? 'seller' : 'buyer'); setNewLeadId(lead.id); setShowAddForm(true) }; dismissAlert(alert.id) }

  // Stats
  const filtered = statusFilter === 'all' ? transactions : transactions.filter(t => t.status === statusFilter)
  const active = transactions.filter(t => !['closed', 'cancelled'].includes(t.status)).length
  const closed = transactions.filter(t => t.status === 'closed').length
  const volume = transactions.filter(t => t.status === 'closed').reduce((s, t) => s + (parseFloat(t.price) || 0), 0)
  const commission = transactions.filter(t => t.status === 'closed').reduce((s, t) => s + ((parseFloat(t.price) || 0) * (parseFloat(t.commission) || 0) / 100), 0)
  const alerts = aiAlerts.filter(a => !a.dismissed)

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">💼 Transactions</h1>
          <p className="text-gray-400 text-sm">Click any field to edit instantly</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button onClick={() => setShowAddForm(true)} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400">+ Add Transaction</button>
        </div>
      </div>

      {/* AI Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAIPanel(!showAIPanel)}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div><h3 className="font-semibold text-white">AI Detected Updates</h3><p className="text-sm text-gray-400">{alerts.length} suggestion{alerts.length > 1 ? 's' : ''}</p></div>
            </div>
            <span className="text-gray-400">{showAIPanel ? '▲' : '▼'}</span>
          </div>
          {showAIPanel && (
            <div className="mt-3 space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className="bg-dark-bg/50 rounded-lg p-3 flex items-center gap-3">
                  <span className="text-lg">💡</span>
                  <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium truncate">{alert.leadName}</p><p className="text-xs text-gray-400 truncate">{alert.message}</p></div>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: statusOptions.find(s => s.value === alert.suggestedStatus)?.color }}>{statusOptions.find(s => s.value === alert.suggestedStatus)?.icon}</span>
                  {transactions.find(t => t.leadId === alert.leadId) ? (
                    <button onClick={() => applyAlert(alert)} className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">Apply</button>
                  ) : (
                    <button onClick={() => createFromAlert(alert)} className="px-2 py-1 text-xs bg-primary-500/20 text-primary-400 rounded hover:bg-primary-500/30">Create</button>
                  )}
                  <button onClick={() => dismissAlert(alert.id)} className="text-gray-500 hover:text-gray-300">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{ l: 'Active', v: active, c: '#6B8DD6' }, { l: 'Closed', v: closed, c: '#4A9B7F' }, { l: 'Volume', v: '$' + (volume >= 1e6 ? (volume/1e6).toFixed(1)+'M' : (volume/1e3).toFixed(0)+'K'), c: '#D4AF37' }, { l: 'Commission', v: '$'+commission.toLocaleString(undefined,{maximumFractionDigits:0}), c: '#4ECDC4' }].map(s => (
          <div key={s.l} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
            <span className="text-2xl font-bold" style={{ color: s.c }}>{s.v}</span>
            <p className="text-xs text-gray-400 mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 text-sm font-medium rounded-lg ${statusFilter === 'all' ? 'bg-primary-500 text-dark-bg' : 'bg-dark-card text-gray-400 border border-dark-border'}`}>All</button>
        {statusOptions.filter(o => o.value !== 'cancelled').map(opt => (
          <button key={opt.value} onClick={() => setStatusFilter(opt.value)} className={`px-3 py-1.5 text-sm rounded-lg ${statusFilter === opt.value ? 'text-white' : 'bg-dark-card text-gray-400 border border-dark-border'}`} style={statusFilter === opt.value ? { backgroundColor: opt.color } : {}}>{opt.icon}</button>
        ))}
      </div>

      {/* Transactions */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16"><span className="text-5xl mb-4 block">💼</span><p className="text-gray-400">No transactions</p><button onClick={() => setShowAddForm(true)} className="mt-4 text-primary-400 hover:underline">+ Add your first deal</button></div>
        ) : filtered.map(txn => {
          const status = statusOptions.find(s => s.value === txn.status)
          const lead = leads.find(l => l.id === txn.leadId)
          const expanded = expandedId === txn.id

          return (
            <div key={txn.id} className="group bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl border border-dark-border hover:border-primary-500/30 transition-all overflow-hidden">
              {/* Progress bar */}
              <div className="h-1 bg-dark-bg"><div className="h-full transition-all" style={{ width: `${((status?.step||0)/7)*100}%`, backgroundColor: status?.color }}/></div>
              
              <div className="p-4">
                {/* Main row */}
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Address & Client */}
                  <div className="flex-1 min-w-[200px]">
                    <InlineEdit value={txn.address} onChange={(v) => updateField(txn.id, 'address', v)} placeholder="Enter address" displayClassName="font-playfair text-lg text-white" className="w-full max-w-[300px]" />
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <InlineEdit value={txn.clientName} onChange={(v) => updateField(txn.id, 'clientName', v)} placeholder="Client name" displayClassName="text-sm text-gray-400" className="w-32" />
                      <select value={txn.clientType} onChange={(e) => updateField(txn.id, 'clientType', e.target.value)} onClick={(e) => e.stopPropagation()} className="px-2 py-0.5 rounded text-xs font-semibold cursor-pointer border-0 outline-none" style={{ backgroundColor: txn.clientType === 'buyer' ? '#4A9B7F' : '#6B8DD6', color: 'white' }}>
                        <option value="buyer">buyer</option>
                        <option value="seller">seller</option>
                      </select>
                      {lead && <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">🔗 {lead.name}</span>}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <InlineEdit value={txn.price} onChange={(v) => updateField(txn.id, 'price', v)} type="number" placeholder="0" prefix="$" displayClassName="text-white font-semibold text-lg" className="w-28 text-right" />
                    <p className="text-xs text-primary-400">${((parseFloat(txn.price)||0) * (parseFloat(txn.commission)||0) / 100).toLocaleString(undefined,{maximumFractionDigits:0})} comm</p>
                  </div>

                  {/* Status icons */}
                  <div className="flex items-center gap-1">
                    {statusOptions.filter(s => s.value !== 'cancelled').map(opt => (
                      <button key={opt.value} onClick={() => updateField(txn.id, 'status', opt.value)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${txn.status === opt.value ? 'scale-110 shadow-lg' : 'bg-dark-bg opacity-40 hover:opacity-100'}`} style={txn.status === opt.value ? { backgroundColor: opt.color } : {}} title={opt.label}>{opt.icon}</button>
                    ))}
                  </div>

                  {/* Expand & Delete */}
                  <div className="flex items-center gap-1">
                    <button onClick={() => setExpandedId(expanded ? null : txn.id)} className="p-2 text-gray-400 hover:text-white">{expanded ? '▲' : '▼'}</button>
                    <button onClick={() => deleteTransaction(txn.id)} className="p-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100">🗑️</button>
                  </div>
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div className="mt-4 pt-4 border-t border-dark-border space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div><p className="text-xs text-gray-500 mb-1">Contract Date</p><InlineDate value={txn.contractDate} onChange={(v) => updateField(txn.id, 'contractDate', v)} /></div>
                      <div><p className="text-xs text-gray-500 mb-1">Closing Date</p><InlineDate value={txn.closingDate} onChange={(v) => updateField(txn.id, 'closingDate', v)} /></div>
                      <div><p className="text-xs text-gray-500 mb-1">Commission %</p><InlineEdit value={txn.commission} onChange={(v) => updateField(txn.id, 'commission', v)} type="number" placeholder="3" suffix="%" displayClassName="text-white" className="w-16" /></div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Linked Lead</p>
                        <select value={txn.leadId || ''} onChange={(e) => updateField(txn.id, 'leadId', e.target.value || null)} onClick={(e) => e.stopPropagation()} className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-sm text-white cursor-pointer">
                          <option value="">None</option>
                          {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div><p className="text-xs text-gray-500 mb-1">Notes</p><InlineTextarea value={txn.notes} onChange={(v) => updateField(txn.id, 'notes', v)} placeholder="Click to add notes..." /></div>
                    {txn.statusHistory?.length > 1 && (
                      <div><p className="text-xs text-gray-500 mb-2">History</p><div className="flex gap-2 flex-wrap">{txn.statusHistory.map((h, i) => { const s = statusOptions.find(x => x.value === h.status); return (<span key={i} className="text-xs text-gray-500"><span style={{ color: s?.color }}>{s?.icon}</span> {new Date(h.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}{i < txn.statusHistory.length-1 && <span className="mx-1">→</span>}</span>) })}</div></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-md w-full border border-dark-border">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">➕ New Transaction</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase">Link to Lead</label>
                <select value={newLeadId || ''} onChange={(e) => { const id = e.target.value; const l = leads.find(x => x.id === id); if (l) { setNewLeadId(id); setNewClientName(l.name); setNewClientType(l.type === 'Seller' ? 'seller' : 'buyer') } else setNewLeadId(null) }} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white">
                  <option value="">None</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.type})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase">Address *</label>
                <input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="123 Main St" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase">Client *</label>
                  <input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="John Smith" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase">Type</label>
                  <select value={newClientType} onChange={(e) => setNewClientType(e.target.value as 'buyer'|'seller')} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white">
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setShowAddForm(false); setNewAddress(''); setNewClientName(''); setNewLeadId(null) }} className="px-5 py-2.5 text-sm bg-dark-bg text-gray-400 rounded-lg hover:bg-dark-border">Cancel</button>
              <button onClick={addTransaction} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
