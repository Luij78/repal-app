'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

// Custom Calendar Date Picker Component
function DatePickerField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (value) setCurrentMonth(new Date(value + 'T00:00:00')) }, [])
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false) }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const prevMonth = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)) }
  const nextMonth = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)) }
  const selectDate = (day: number) => { onChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0]); setIsOpen(false) }
  const formatDisplayDate = (dateStr: string) => !dateStr ? 'Select date' : new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const todayStr = new Date().toISOString().split('T')[0]

  const renderDays = () => {
    const days = []
    for (let i = 0; i < firstDayOfMonth(currentMonth); i++) days.push(<div key={`empty-${i}`} className="w-10 h-10" />)
    for (let day = 1; day <= daysInMonth(currentMonth); day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push(
        <button key={day} type="button" onClick={(e) => { e.stopPropagation(); selectDate(day) }}
          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all flex items-center justify-center ${value === dateStr ? 'bg-gradient-to-br from-primary-500 to-[#B8960C] text-dark-bg shadow-lg' : dateStr === todayStr ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50' : 'text-white hover:bg-white/10'}`}
        >{day}</button>
      )
    }
    return days
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-left flex items-center justify-between hover:border-primary-500/50">
        <span className={value ? 'text-white' : 'text-gray-500'}>{formatDisplayDate(value)}</span><span className="text-xl">📅</span>
      </button>
      {isOpen && (
        <div className="absolute z-[100] mt-2 left-0 right-0">
          <div className="p-5 rounded-2xl border border-primary-500/20 shadow-2xl" style={{ background: 'linear-gradient(145deg, rgba(30,30,30,0.98) 0%, rgba(15,15,15,0.99) 100%)' }}>
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevMonth} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/70 text-lg">‹</button>
              <span className="font-playfair text-white text-lg">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
              <button type="button" onClick={nextMonth} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/70 text-lg">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">{dayNames.map(d => <div key={d} className="w-10 h-8 flex items-center justify-center text-xs text-primary-400 font-semibold">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(todayStr); setIsOpen(false) }} className="flex-1 py-2.5 text-sm font-semibold bg-primary-500/20 text-primary-400 rounded-xl">Today</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false) }} className="flex-1 py-2.5 text-sm font-semibold bg-white/5 text-gray-400 rounded-xl">Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Transaction Interface
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
  statusHistory: { status: string; date: string; note?: string }[]
}

// Lead Interface
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

// AI Alert Interface
interface AIAlert {
  id: string
  leadId: string
  leadName: string
  message: string
  suggestedStatus: string
  timestamp: string
  dismissed: boolean
}

export default function TransactionsPage() {
  const { user } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [aiAlerts, setAIAlerts] = useState<AIAlert[]>([])
  const [showAIPanel, setShowAIPanel] = useState(true)
  
  const emptyForm = {
    address: '', clientName: '', clientType: 'buyer' as const, status: 'pending', price: '', commission: '3', contractDate: '', closingDate: '', notes: '', leadId: null as string | null
  }
  const [formData, setFormData] = useState(emptyForm)

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
    const savedTxn = localStorage.getItem('repal_transactions')
    if (savedTxn) setTransactions(JSON.parse(savedTxn))
    
    const savedAlerts = localStorage.getItem('repal_ai_alerts')
    if (savedAlerts) setAIAlerts(JSON.parse(savedAlerts))
  }, [])

  // Load leads when user is available
  useEffect(() => {
    if (user) {
      const savedLeads = localStorage.getItem(`leads_${user.id}`)
      if (savedLeads) setLeads(JSON.parse(savedLeads))
    }
  }, [user])

  // Save transactions
  useEffect(() => { 
    localStorage.setItem('repal_transactions', JSON.stringify(transactions)) 
  }, [transactions])

  // Save AI alerts
  useEffect(() => {
    localStorage.setItem('repal_ai_alerts', JSON.stringify(aiAlerts))
  }, [aiAlerts])

  // AI Agent: Monitor lead notes for status keywords
  useEffect(() => {
    if (!user || leads.length === 0) return
    
    const statusKeywords = {
      'under-contract': ['under contract', 'accepted offer', 'offer accepted', 'signed contract', 'ratified'],
      'contingent': ['contingent', 'contingency', 'inspection contingency', 'financing contingency'],
      'inspection': ['inspection scheduled', 'inspection complete', 'inspection done', 'home inspection'],
      'appraisal': ['appraisal scheduled', 'appraisal ordered', 'appraisal complete', 'appraised'],
      'clear-to-close': ['clear to close', 'ctc', 'cleared to close', 'ready to close', 'closing scheduled'],
      'closed': ['closed', 'closing complete', 'keys handed', 'moved in', 'settled']
    }

    const newAlerts: AIAlert[] = []

    leads.forEach(lead => {
      if (!lead.notes) return
      const notesLower = lead.notes.toLowerCase()
      
      // Find linked transaction
      const linkedTxn = transactions.find(t => t.leadId === lead.id)
      
      Object.entries(statusKeywords).forEach(([status, keywords]) => {
        keywords.forEach(keyword => {
          if (notesLower.includes(keyword)) {
            // Check if we should create an alert
            const existingAlert = aiAlerts.find(a => a.leadId === lead.id && a.suggestedStatus === status && !a.dismissed)
            
            if (!existingAlert) {
              // Only alert if transaction doesn't already have this status or later
              if (linkedTxn) {
                const currentStep = statusOptions.find(s => s.value === linkedTxn.status)?.step || 0
                const suggestedStep = statusOptions.find(s => s.value === status)?.step || 0
                
                if (suggestedStep > currentStep) {
                  newAlerts.push({
                    id: `${lead.id}-${status}-${Date.now()}`,
                    leadId: lead.id,
                    leadName: lead.name,
                    message: `Lead notes mention "${keyword}" - consider updating transaction status`,
                    suggestedStatus: status,
                    timestamp: new Date().toISOString(),
                    dismissed: false
                  })
                }
              } else {
                // No linked transaction - suggest creating one
                newAlerts.push({
                  id: `${lead.id}-create-${Date.now()}`,
                  leadId: lead.id,
                  leadName: lead.name,
                  message: `Lead notes mention "${keyword}" but no transaction exists - consider adding one`,
                  suggestedStatus: status,
                  timestamp: new Date().toISOString(),
                  dismissed: false
                })
              }
            }
          }
        })
      })
    })

    if (newAlerts.length > 0) {
      setAIAlerts(prev => [...prev, ...newAlerts])
    }
  }, [leads, user])

  // Save transaction (create or update)
  const saveTransaction = () => {
    if (!formData.address || !formData.clientName) return alert('Please enter address and client name')
    
    if (editingTransaction) {
      // Update existing
      const statusChanged = editingTransaction.status !== formData.status
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? {
        ...t,
        ...formData,
        statusHistory: statusChanged 
          ? [...(t.statusHistory || []), { status: formData.status, date: new Date().toISOString() }]
          : t.statusHistory
      } : t))
    } else {
      // Create new
      const newTxn: Transaction = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        statusHistory: [{ status: formData.status, date: new Date().toISOString() }]
      }
      setTransactions([...transactions, newTxn])
    }
    
    setFormData(emptyForm)
    setEditingTransaction(null)
    setShowForm(false)
  }

  // Edit transaction
  const openEditForm = (txn: Transaction) => {
    setFormData({
      address: txn.address,
      clientName: txn.clientName,
      clientType: txn.clientType,
      status: txn.status,
      price: txn.price,
      commission: txn.commission,
      contractDate: txn.contractDate,
      closingDate: txn.closingDate,
      notes: txn.notes,
      leadId: txn.leadId
    })
    setEditingTransaction(txn)
    setShowForm(true)
  }

  // Quick status update
  const updateStatus = (txnId: number, newStatus: string) => {
    setTransactions(transactions.map(t => t.id === txnId ? {
      ...t,
      status: newStatus,
      statusHistory: [...(t.statusHistory || []), { status: newStatus, date: new Date().toISOString() }]
    } : t))
  }

  // Delete transaction
  const deleteTransaction = (id: number) => { 
    if (confirm('Delete this transaction?')) setTransactions(transactions.filter(t => t.id !== id)) 
  }

  // Dismiss AI alert
  const dismissAlert = (alertId: string) => {
    setAIAlerts(aiAlerts.map(a => a.id === alertId ? { ...a, dismissed: true } : a))
  }

  // Apply AI suggestion
  const applyAISuggestion = (alert: AIAlert) => {
    const linkedTxn = transactions.find(t => t.leadId === alert.leadId)
    if (linkedTxn) {
      updateStatus(linkedTxn.id, alert.suggestedStatus)
    }
    dismissAlert(alert.id)
  }

  // Link lead to new transaction
  const linkLeadToTransaction = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (lead) {
      setFormData({
        ...emptyForm,
        clientName: lead.name,
        clientType: lead.type === 'Seller' ? 'seller' : 'buyer',
        leadId: lead.id
      })
      setShowForm(true)
    }
  }

  // Get linked lead name
  const getLinkedLead = (leadId: string | null) => {
    if (!leadId) return null
    return leads.find(l => l.id === leadId)
  }

  // Filter & Stats
  const filteredTransactions = statusFilter === 'all' ? transactions : transactions.filter(t => t.status === statusFilter)
  const activeDeals = transactions.filter(t => !['closed', 'cancelled'].includes(t.status)).length
  const closedDeals = transactions.filter(t => t.status === 'closed').length
  const totalVolume = transactions.filter(t => t.status === 'closed').reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0)
  const totalCommission = transactions.filter(t => t.status === 'closed').reduce((sum, t) => sum + ((parseFloat(t.price) || 0) * (parseFloat(t.commission) || 0) / 100), 0)
  
  const activeAlerts = aiAlerts.filter(a => !a.dismissed)

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">💼 Transactions</h1>
          <p className="text-gray-400 text-sm">Track your deals from contract to close</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button onClick={() => { setFormData(emptyForm); setEditingTransaction(null); setShowForm(true) }} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ Add Transaction</button>
        </div>
      </div>

      {/* AI Agent Alerts Panel */}
      {activeAlerts.length > 0 && (
        <div className="mb-6">
          <div 
            className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4 cursor-pointer"
            onClick={() => setShowAIPanel(!showAIPanel)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-semibold text-white">AI Agent Detected Updates</h3>
                  <p className="text-sm text-gray-400">{activeAlerts.length} suggestion{activeAlerts.length > 1 ? 's' : ''} based on your lead notes</p>
                </div>
              </div>
              <span className="text-gray-400">{showAIPanel ? '▲' : '▼'}</span>
            </div>
            
            {showAIPanel && (
              <div className="mt-4 space-y-3">
                {activeAlerts.map(alert => (
                  <div key={alert.id} className="bg-dark-bg/50 rounded-lg p-4 flex items-start gap-4">
                    <span className="text-2xl">💡</span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{alert.leadName}</p>
                      <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Suggested:</span>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: statusOptions.find(s => s.value === alert.suggestedStatus)?.color }}>
                          {statusOptions.find(s => s.value === alert.suggestedStatus)?.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {transactions.find(t => t.leadId === alert.leadId) ? (
                        <button onClick={(e) => { e.stopPropagation(); applyAISuggestion(alert) }} className="px-3 py-1.5 text-xs font-semibold bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                          Apply
                        </button>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); linkLeadToTransaction(alert.leadId); dismissAlert(alert.id) }} className="px-3 py-1.5 text-xs font-semibold bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30">
                          Create Transaction
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id) }} className="px-3 py-1.5 text-xs font-semibold bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30">
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{ label: 'Active Deals', value: activeDeals, color: '#6B8DD6' }, { label: 'Closed', value: closedDeals, color: '#4A9B7F' }, { label: 'Volume', value: '$' + (totalVolume >= 1000000 ? (totalVolume / 1000000).toFixed(1) + 'M' : (totalVolume / 1000).toFixed(0) + 'K'), color: '#D4AF37' }, { label: 'Commission', value: '$' + totalCommission.toLocaleString(undefined, { maximumFractionDigits: 0 }), color: '#4ECDC4' }].map(s => (
          <div key={s.label} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
            <span className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</span>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 flex-wrap overflow-x-auto pb-2">
        <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${statusFilter === 'all' ? 'bg-primary-500 text-dark-bg' : 'bg-dark-card text-gray-400 border border-dark-border'}`}>All ({transactions.length})</button>
        {statusOptions.filter(opt => opt.value !== 'cancelled').map(opt => {
          const count = transactions.filter(t => t.status === opt.value).length
          return (
            <button key={opt.value} onClick={() => setStatusFilter(opt.value)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${statusFilter === opt.value ? 'text-white' : 'bg-dark-card text-gray-400 border border-dark-border'}`} style={statusFilter === opt.value ? { backgroundColor: opt.color } : {}}>
              <span>{opt.icon}</span> {opt.label} {count > 0 && <span className="text-xs opacity-70">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">💼</span>
            <p className="text-gray-400">No transactions found.</p>
            <p className="text-sm text-gray-500 mt-2">Add your first deal to start tracking</p>
          </div>
        ) : (
          filteredTransactions.map(txn => {
            const currentStatus = statusOptions.find(s => s.value === txn.status)
            const linkedLead = getLinkedLead(txn.leadId)
            
            return (
              <div key={txn.id} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl border border-dark-border hover:border-primary-500/30 transition-all overflow-hidden">
                {/* Status Progress Bar */}
                <div className="h-1 bg-dark-bg">
                  <div 
                    className="h-full transition-all duration-500" 
                    style={{ 
                      width: `${((currentStatus?.step || 0) / 7) * 100}%`,
                      backgroundColor: currentStatus?.color 
                    }} 
                  />
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                    <div>
                      <h3 className="font-playfair text-lg text-white">{txn.address}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-gray-400">{txn.clientName}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: txn.clientType === 'buyer' ? '#4A9B7F' : '#6B8DD6' }}>{txn.clientType}</span>
                        {linkedLead && (
                          <Link href="/dashboard/leads" className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 flex items-center gap-1">
                            🔗 Linked to Lead
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold text-white flex items-center gap-1.5" style={{ backgroundColor: currentStatus?.color }}>
                        <span>{currentStatus?.icon}</span> {currentStatus?.label}
                      </span>
                      <button onClick={() => openEditForm(txn)} className="p-2 text-gray-400 hover:text-primary-400 transition-colors" title="Edit">✏️</button>
                      <button onClick={() => deleteTransaction(txn.id)} className="p-2 text-gray-400 hover:text-[#E74C3C] transition-colors" title="Delete">🗑️</button>
                    </div>
                  </div>

                  {/* Quick Status Update */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Quick Status Update:</p>
                    <div className="flex gap-1 flex-wrap">
                      {statusOptions.filter(s => s.value !== 'cancelled').map(opt => (
                        <button 
                          key={opt.value}
                          onClick={() => updateStatus(txn.id, opt.value)}
                          className={`px-2 py-1 text-xs rounded transition-all ${txn.status === opt.value ? 'text-white scale-110' : 'bg-dark-bg text-gray-500 hover:text-white'}`}
                          style={txn.status === opt.value ? { backgroundColor: opt.color } : {}}
                          title={opt.label}
                        >
                          {opt.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block text-xs">Price</span>
                      <p className="text-white font-semibold">${parseFloat(txn.price || '0').toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Commission ({txn.commission}%)</span>
                      <p className="text-primary-400 font-semibold">${((parseFloat(txn.price) || 0) * (parseFloat(txn.commission) || 0) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Contract Date</span>
                      <p className="text-white">{txn.contractDate ? new Date(txn.contractDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Closing Date</span>
                      <p className="text-white">{txn.closingDate ? new Date(txn.closingDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</p>
                    </div>
                  </div>

                  {/* Notes Preview */}
                  {txn.notes && (
                    <div className="mt-4 pt-4 border-t border-dark-border">
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-400 line-clamp-2">{txn.notes}</p>
                    </div>
                  )}

                  {/* Status History */}
                  {txn.statusHistory && txn.statusHistory.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-dark-border">
                      <p className="text-xs text-gray-500 mb-2">Status History</p>
                      <div className="flex gap-2 flex-wrap">
                        {txn.statusHistory.map((h, idx) => {
                          const status = statusOptions.find(s => s.value === h.status)
                          return (
                            <div key={idx} className="flex items-center gap-1 text-xs text-gray-500">
                              <span style={{ color: status?.color }}>{status?.icon}</span>
                              <span>{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              {idx < txn.statusHistory.length - 1 && <span className="text-gray-600">→</span>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-2xl w-full border border-dark-border my-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">
              {editingTransaction ? '✏️ Edit Transaction' : '➕ Add Transaction'}
            </h2>
            
            {/* Link to Lead */}
            <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <label className="block text-xs text-purple-400 mb-2 uppercase tracking-wider">🔗 Link to Existing Lead (Optional)</label>
              <select 
                value={formData.leadId || ''} 
                onChange={(e) => {
                  const leadId = e.target.value
                  const lead = leads.find(l => l.id === leadId)
                  if (lead) {
                    setFormData({ 
                      ...formData, 
                      leadId, 
                      clientName: lead.name,
                      clientType: lead.type === 'Seller' ? 'seller' : 'buyer'
                    })
                  } else {
                    setFormData({ ...formData, leadId: null })
                  }
                }} 
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-purple-500/30 rounded-lg text-white cursor-pointer focus:border-purple-500"
              >
                <option value="">No linked lead</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} ({lead.type || 'Lead'}) - {lead.status}
                  </option>
                ))}
              </select>
              {formData.leadId && (
                <p className="text-xs text-purple-400 mt-2">✓ Transaction will sync with this lead's activity</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Property Address *</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="123 Main St, City, State" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Client Name *</label>
                <input type="text" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} placeholder="John Smith" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Client Type</label>
                <select value={formData.clientType} onChange={(e) => setFormData({ ...formData, clientType: e.target.value as 'buyer' | 'seller' })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Sale Price</label>
                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="450000" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Commission %</label>
                <input type="number" step="0.1" value={formData.commission} onChange={(e) => setFormData({ ...formData, commission: e.target.value })} placeholder="3" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Status</label>
                <div className="grid grid-cols-4 gap-2">
                  {statusOptions.map(opt => (
                    <button 
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: opt.value })}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${formData.status === opt.value ? 'text-white ring-2 ring-white/30' : 'text-gray-400 bg-dark-bg hover:text-white'}`}
                      style={formData.status === opt.value ? { backgroundColor: opt.color } : {}}
                    >
                      <span>{opt.icon}</span> {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <DatePickerField label="Contract Date" value={formData.contractDate} onChange={(v) => setFormData({ ...formData, contractDate: v })} />
              <DatePickerField label="Closing Date" value={formData.closingDate} onChange={(v) => setFormData({ ...formData, closingDate: v })} />
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} placeholder="Add any relevant notes..." className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500 resize-none" />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setShowForm(false); setEditingTransaction(null); setFormData(emptyForm) }} className="px-5 py-2.5 text-sm font-semibold bg-dark-bg text-gray-400 rounded-lg hover:bg-dark-border transition-colors">Cancel</button>
              <button onClick={saveTransaction} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">
                {editingTransaction ? 'Save Changes' : 'Add Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
