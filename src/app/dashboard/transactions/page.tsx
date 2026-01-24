'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    address: '', clientName: '', clientType: 'buyer', status: 'pending', price: '', commission: '3', contractDate: '', closingDate: '', notes: ''
  })

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#D4AF37' },
    { value: 'under-contract', label: 'Under Contract', color: '#6B8DD6' },
    { value: 'contingent', label: 'Contingent', color: '#9B59B6' },
    { value: 'clear-to-close', label: 'Clear to Close', color: '#4ECDC4' },
    { value: 'closed', label: 'Closed', color: '#4A9B7F' },
    { value: 'cancelled', label: 'Cancelled', color: '#E74C3C' }
  ]

  useEffect(() => { const saved = localStorage.getItem('repal_transactions'); if (saved) setTransactions(JSON.parse(saved)) }, [])
  useEffect(() => { localStorage.setItem('repal_transactions', JSON.stringify(transactions)) }, [transactions])

  const saveTransaction = () => {
    if (!formData.address || !formData.clientName) return alert('Please enter address and client name')
    setTransactions([...transactions, { ...formData, id: Date.now(), createdAt: new Date().toISOString() }])
    setFormData({ address: '', clientName: '', clientType: 'buyer', status: 'pending', price: '', commission: '3', contractDate: '', closingDate: '', notes: '' })
    setShowForm(false)
  }

  const deleteTransaction = (id: number) => { if (confirm('Delete this transaction?')) setTransactions(transactions.filter(t => t.id !== id)) }

  const filteredTransactions = statusFilter === 'all' ? transactions : transactions.filter(t => t.status === statusFilter)
  const activeDeals = transactions.filter(t => !['closed', 'cancelled'].includes(t.status)).length
  const closedDeals = transactions.filter(t => t.status === 'closed').length
  const totalVolume = transactions.filter(t => t.status === 'closed').reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0)
  const totalCommission = transactions.filter(t => t.status === 'closed').reduce((sum, t) => sum + ((parseFloat(t.price) || 0) * (parseFloat(t.commission) || 0) / 100), 0)

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">💼 Transactions</h1>
          <p className="text-gray-400 text-sm">Track your deals from contract to close</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ Add Transaction</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{ label: 'Active Deals', value: activeDeals, color: '#6B8DD6' }, { label: 'Closed', value: closedDeals, color: '#4A9B7F' }, { label: 'Volume', value: '$' + (totalVolume / 1000000).toFixed(1) + 'M', color: '#D4AF37' }, { label: 'Commission', value: '$' + totalCommission.toLocaleString(), color: '#4ECDC4' }].map(s => (
          <div key={s.label} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
            <span className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</span>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap overflow-x-auto pb-2">
        <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${statusFilter === 'all' ? 'bg-primary-500 text-dark-bg' : 'bg-dark-card text-gray-400 border border-dark-border'}`}>All</button>
        {statusOptions.map(opt => (
          <button key={opt.value} onClick={() => setStatusFilter(opt.value)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${statusFilter === opt.value ? 'text-white' : 'bg-dark-card text-gray-400 border border-dark-border'}`} style={statusFilter === opt.value ? { backgroundColor: opt.color } : {}}>{opt.label}</button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16"><span className="text-5xl mb-4 block">💼</span><p className="text-gray-400">No transactions found.</p></div>
        ) : (
          filteredTransactions.map(txn => (
            <div key={txn.id} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-5 border border-dark-border hover:border-primary-500/30 transition-all">
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-playfair text-lg text-white">{txn.address}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-400">{txn.clientName}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: txn.clientType === 'buyer' ? '#4A9B7F' : '#6B8DD6' }}>{txn.clientType}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: statusOptions.find(s => s.value === txn.status)?.color }}>{statusOptions.find(s => s.value === txn.status)?.label}</span>
                  <button onClick={() => deleteTransaction(txn.id)} className="text-gray-500 hover:text-[#E74C3C]">🗑️</button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div><span className="text-gray-500">Price</span><p className="text-white font-semibold">${parseFloat(txn.price || 0).toLocaleString()}</p></div>
                <div><span className="text-gray-500">Commission</span><p className="text-primary-400 font-semibold">${((parseFloat(txn.price) || 0) * (parseFloat(txn.commission) || 0) / 100).toLocaleString()}</p></div>
                <div><span className="text-gray-500">Contract</span><p className="text-white">{txn.contractDate ? new Date(txn.contractDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</p></div>
                <div><span className="text-gray-500">Closing</span><p className="text-white">{txn.closingDate ? new Date(txn.closingDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</p></div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-2xl w-full border border-dark-border my-4">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">Add Transaction</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Property Address *</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Client Name *</label>
                <input type="text" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Client Type</label>
                <select value={formData.clientType} onChange={(e) => setFormData({ ...formData, clientType: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
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
                <input type="number" step="0.1" value={formData.commission} onChange={(e) => setFormData({ ...formData, commission: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <DatePickerField label="Contract Date" value={formData.contractDate} onChange={(v) => setFormData({ ...formData, contractDate: v })} />
              <DatePickerField label="Closing Date" value={formData.closingDate} onChange={(v) => setFormData({ ...formData, closingDate: v })} />
            </div>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-semibold text-gray-400 border border-dark-border rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={saveTransaction} className="px-6 py-3 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">Save Transaction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
