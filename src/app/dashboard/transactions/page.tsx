'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [formData, setFormData] = useState({
    address: '', clientName: '', clientType: 'buyer', price: '', status: 'pending',
    contractDate: '', closingDate: '', commission: '', notes: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('repal_transactions')
    if (saved) setTransactions(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('repal_transactions', JSON.stringify(transactions))
  }, [transactions])

  const statusColors: Record<string, string> = {
    pending: '#D4AF37', 'under-contract': '#6B8DD6', contingent: '#9B59B6',
    'clear-to-close': '#4ECDC4', closed: '#4A9B7F', cancelled: '#E74C3C'
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pending', 'under-contract': 'Under Contract', contingent: 'Contingent',
    'clear-to-close': 'Clear to Close', closed: 'Closed', cancelled: 'Cancelled'
  }

  const saveTransaction = () => {
    if (!formData.address || !formData.clientName) return alert('Please enter address and client name')
    setTransactions([...transactions, { ...formData, id: Date.now(), createdAt: new Date().toISOString() }])
    setFormData({ address: '', clientName: '', clientType: 'buyer', price: '', status: 'pending', contractDate: '', closingDate: '', commission: '', notes: '' })
    setShowForm(false)
  }

  const deleteTransaction = (id: number) => {
    if (confirm('Delete this transaction?')) setTransactions(transactions.filter(t => t.id !== id))
  }

  const filteredTransactions = transactions.filter(t => filter === 'all' || t.status === filter)

  const activeCount = transactions.filter(t => !['closed', 'cancelled'].includes(t.status)).length
  const closedCount = transactions.filter(t => t.status === 'closed').length
  const totalVolume = transactions.filter(t => t.status === 'closed').reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0)
  const totalCommission = transactions.filter(t => t.status === 'closed').reduce((sum, t) => sum + (parseFloat(t.commission) || 0), 0)

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">📋 Transactions</h1>
          <p className="text-gray-400 text-sm">Track your deals from contract to closing</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ Add Transaction</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-primary-400">{activeCount}</span>
          <p className="text-xs text-gray-400 mt-1">Active Deals</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-[#4A9B7F]">{closedCount}</span>
          <p className="text-xs text-gray-400 mt-1">Closed</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-lg font-bold text-white">${(totalVolume / 1000000).toFixed(1)}M</span>
          <p className="text-xs text-gray-400 mt-1">Volume</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-lg font-bold text-[#4ECDC4]">${totalCommission.toLocaleString()}</span>
          <p className="text-xs text-gray-400 mt-1">Commission</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap overflow-x-auto pb-2">
        {['all', 'pending', 'under-contract', 'contingent', 'clear-to-close', 'closed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === f ? 'bg-primary-500 text-dark-bg' : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'}`}>
            {f === 'all' ? 'All' : statusLabels[f] || f}
          </button>
        ))}
      </div>

      {/* Transaction Cards */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📋</span>
            <p className="text-gray-400">No transactions yet. Add your first deal!</p>
          </div>
        ) : (
          filteredTransactions.map(txn => (
            <div key={txn.id} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-5 border border-dark-border hover:border-primary-500/30 transition-all">
              <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-playfair text-lg text-white mb-1">{txn.address}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-400">{txn.clientName}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${txn.clientType === 'buyer' ? 'bg-[#4A9B7F]' : 'bg-[#6B8DD6]'}`}>
                      {txn.clientType === 'buyer' ? '🏠 Buyer' : '🏷️ Seller'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: statusColors[txn.status] }}>
                    {statusLabels[txn.status]}
                  </span>
                  <button onClick={() => deleteTransaction(txn.id)} className="text-xl text-gray-600 hover:text-[#E74C3C] transition-colors">🗑️</button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-dark-border">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="text-white font-semibold">${parseFloat(txn.price || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Commission</p>
                  <p className="text-[#4ECDC4] font-semibold">${parseFloat(txn.commission || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contract Date</p>
                  <p className="text-white">{txn.contractDate ? new Date(txn.contractDate + 'T00:00:00').toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Closing Date</p>
                  <p className="text-white">{txn.closingDate ? new Date(txn.closingDate + 'T00:00:00').toLocaleDateString() : '-'}</p>
                </div>
              </div>
              
              {txn.notes && <p className="text-sm text-gray-400 mt-3 pt-3 border-t border-dark-border">{txn.notes}</p>}
            </div>
          ))
        )}
      </div>

      {/* Add Transaction Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-lg w-full border border-dark-border my-8">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">Add Transaction</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Property Address *</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="123 Main St, City, ST" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Sale Price</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="400000" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Your Commission</label>
                  <input type="number" value={formData.commission} onChange={(e) => setFormData({ ...formData, commission: e.target.value })} placeholder="12000" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                  <option value="pending">Pending</option>
                  <option value="under-contract">Under Contract</option>
                  <option value="contingent">Contingent</option>
                  <option value="clear-to-close">Clear to Close</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Contract Date</label>
                  <input type="date" value={formData.contractDate} onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Closing Date</label>
                  <input type="date" value={formData.closingDate} onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Transaction details..." className="w-full min-h-[80px] px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500 resize-y" />
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-semibold text-gray-400 border border-dark-border rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={saveTransaction} className="px-6 py-3 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
