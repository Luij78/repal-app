'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'

interface Transaction {
  id: string
  user_id: string
  lead_id: string | null
  property_address: string
  sale_price: number
  commission_rate: number
  status: 'pending' | 'under-contract' | 'closed' | 'cancelled'
  closing_date: string | null
  contract_date: string | null
  inspection_date: string | null
  appraisal_date: string | null
  milestone: number
  notes: string | null
  client_name: string | null
  client_type: 'buyer' | 'seller'
  created_at: string
  updated_at: string
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: '⏳' },
  'under-contract': { label: 'Under Contract', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '📝' },
  closed: { label: 'Closed', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '✅' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '❌' }
}

const milestones = [
  { id: 0, label: 'New Lead', icon: '👤' },
  { id: 1, label: 'Contract Signed', icon: '📝' },
  { id: 2, label: 'Inspection', icon: '🔍' },
  { id: 3, label: 'Appraisal', icon: '📊' },
  { id: 4, label: 'Clear to Close', icon: '✨' },
  { id: 5, label: 'Closed!', icon: '🎉' }
]

export default function TransactionsPage() {
  const { user } = useUser()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [formData, setFormData] = useState({
    property_address: '',
    sale_price: '',
    commission_rate: '3',
    status: 'pending' as Transaction['status'],
    closing_date: '',
    contract_date: '',
    inspection_date: '',
    appraisal_date: '',
    milestone: 0,
    notes: '',
    client_name: '',
    client_type: 'buyer' as Transaction['client_type']
  })

  const supabase = createClient()

  useEffect(() => {
    if (user) fetchTransactions()
  }, [user])

  const fetchTransactions = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
    } else {
      setTransactions(data || [])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      property_address: '',
      sale_price: '',
      commission_rate: '3',
      status: 'pending',
      closing_date: '',
      contract_date: '',
      inspection_date: '',
      appraisal_date: '',
      milestone: 0,
      notes: '',
      client_name: '',
      client_type: 'buyer'
    })
    setEditingTransaction(null)
    setShowForm(false)
  }

  const openEditForm = (txn: Transaction) => {
    setEditingTransaction(txn)
    setFormData({
      property_address: txn.property_address,
      sale_price: txn.sale_price.toString(),
      commission_rate: txn.commission_rate.toString(),
      status: txn.status,
      closing_date: txn.closing_date || '',
      contract_date: txn.contract_date || '',
      inspection_date: txn.inspection_date || '',
      appraisal_date: txn.appraisal_date || '',
      milestone: txn.milestone,
      notes: txn.notes || '',
      client_name: txn.client_name || '',
      client_type: txn.client_type
    })
    setSelectedTransaction(null)
    setShowForm(true)
  }

  const saveTransaction = async () => {
    if (!user || !formData.property_address.trim() || !formData.sale_price) return

    const txnData = {
      user_id: user.id,
      property_address: formData.property_address,
      sale_price: parseFloat(formData.sale_price),
      commission_rate: parseFloat(formData.commission_rate),
      status: formData.status,
      closing_date: formData.closing_date || null,
      contract_date: formData.contract_date || null,
      inspection_date: formData.inspection_date || null,
      appraisal_date: formData.appraisal_date || null,
      milestone: formData.milestone,
      notes: formData.notes || null,
      client_name: formData.client_name || null,
      client_type: formData.client_type
    }

    if (editingTransaction) {
      const { error } = await supabase
        .from('transactions')
        .update(txnData)
        .eq('id', editingTransaction.id)

      if (error) {
        console.error('Error updating transaction:', error)
      } else {
        setTransactions(transactions.map(t => t.id === editingTransaction.id ? { ...t, ...txnData, updated_at: new Date().toISOString() } : t))
        resetForm()
      }
    } else {
      const { data, error } = await supabase
        .from('transactions')
        .insert(txnData)
        .select()
        .single()

      if (error) {
        console.error('Error adding transaction:', error)
      } else if (data) {
        setTransactions([data, ...transactions])
        resetForm()
      }
    }
  }

  const updateMilestone = async (txnId: string, newMilestone: number) => {
    const newStatus = newMilestone >= 5 ? 'closed' : newMilestone >= 1 ? 'under-contract' : 'pending'

    const { error } = await supabase
      .from('transactions')
      .update({ milestone: newMilestone, status: newStatus })
      .eq('id', txnId)

    if (error) {
      console.error('Error updating milestone:', error)
    } else {
      setTransactions(transactions.map(t => 
        t.id === txnId ? { ...t, milestone: newMilestone, status: newStatus } : t
      ))
      if (selectedTransaction?.id === txnId) {
        setSelectedTransaction({ ...selectedTransaction, milestone: newMilestone, status: newStatus })
      }
    }
  }

  const deleteTransaction = async (txnId: string) => {
    if (!confirm('Delete this transaction?')) return

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', txnId)

    if (error) {
      console.error('Error deleting transaction:', error)
    } else {
      setTransactions(transactions.filter(t => t.id !== txnId))
      setSelectedTransaction(null)
    }
  }

  const filteredTransactions = transactions.filter(txn => 
    filterStatus === 'all' || txn.status === filterStatus
  )

  const calculateCommission = (price: number, rate: number) => price * (rate / 100)

  const stats = {
    active: transactions.filter(t => t.status === 'under-contract').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    closed: transactions.filter(t => t.status === 'closed').length,
    closedValue: transactions.filter(t => t.status === 'closed').reduce((sum, t) => sum + calculateCommission(t.sale_price, t.commission_rate), 0),
    pipelineValue: transactions.filter(t => t.status !== 'cancelled' && t.status !== 'closed').reduce((sum, t) => sum + calculateCommission(t.sale_price, t.commission_rate), 0)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">📋 Transaction Tracker</h1>
          <p className="text-gray-400">Manage your deals from contract to closing</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> Add Transaction
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
          <p className="text-gray-400 text-sm">Under Contract</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-400">{stats.pending}</p>
          <p className="text-gray-400 text-sm">Pending</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-400">{stats.closed}</p>
          <p className="text-gray-400 text-sm">Closed</p>
        </div>
        <div className="card text-center border-primary-500/30">
          <p className="text-2xl font-bold text-primary-500">{formatCurrency(stats.pipelineValue)}</p>
          <p className="text-gray-400 text-sm">Pipeline GCI</p>
        </div>
        <div className="card text-center border-green-500/30">
          <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.closedValue)}</p>
          <p className="text-gray-400 text-sm">Closed GCI</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under-contract">Under Contract</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">📋</span>
          <p className="text-gray-400 mb-4">
            {filterStatus !== 'all' ? 'No transactions match your filter' : 'No transactions yet'}
          </p>
          {filterStatus === 'all' && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Add Your First Transaction
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map(txn => {
            const config = statusConfig[txn.status]
            const commission = calculateCommission(txn.sale_price, txn.commission_rate)
            
            return (
              <div
                key={txn.id}
                onClick={() => setSelectedTransaction(txn)}
                className="card cursor-pointer hover:border-primary-500/50 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{config.icon}</span>
                      <h3 className="font-semibold text-white">{txn.property_address}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      {txn.client_name && (
                        <span>{txn.client_type === 'buyer' ? '🏠' : '💰'} {txn.client_name}</span>
                      )}
                      <span>Sale: {formatCurrency(txn.sale_price)}</span>
                      <span className="text-primary-500 font-semibold">GCI: {formatCurrency(commission)}</span>
                      {txn.closing_date && (
                        <span>📅 Closing: {formatDate(txn.closing_date)}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Mini Milestone Progress */}
                  <div className="flex items-center gap-1">
                    {milestones.slice(0, 6).map((m, idx) => (
                      <div
                        key={m.id}
                        className={`w-3 h-3 rounded-full ${idx <= txn.milestone ? 'bg-primary-500' : 'bg-gray-600'}`}
                        title={m.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-card">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedTransaction.property_address}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig[selectedTransaction.status].color}`}>
                  {statusConfig[selectedTransaction.status].label}
                </span>
              </div>
              <button onClick={() => setSelectedTransaction(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Financial Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-dark-bg rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-white">{formatCurrency(selectedTransaction.sale_price)}</p>
                  <p className="text-gray-400 text-sm">Sale Price</p>
                </div>
                <div className="bg-dark-bg rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary-500">{selectedTransaction.commission_rate}%</p>
                  <p className="text-gray-400 text-sm">Commission</p>
                </div>
                <div className="bg-dark-bg rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(calculateCommission(selectedTransaction.sale_price, selectedTransaction.commission_rate))}</p>
                  <p className="text-gray-400 text-sm">Your GCI</p>
                </div>
              </div>

              {/* Client Info */}
              {selectedTransaction.client_name && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Client</p>
                  <p className="text-white">
                    {selectedTransaction.client_type === 'buyer' ? '🏠 Buyer' : '💰 Seller'}: {selectedTransaction.client_name}
                  </p>
                </div>
              )}

              {/* Key Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Contract Date</p>
                  <p className="text-white">{formatDate(selectedTransaction.contract_date)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Closing Date</p>
                  <p className="text-white">{formatDate(selectedTransaction.closing_date)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Inspection</p>
                  <p className="text-white">{formatDate(selectedTransaction.inspection_date)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Appraisal</p>
                  <p className="text-white">{formatDate(selectedTransaction.appraisal_date)}</p>
                </div>
              </div>

              {/* Milestone Tracker */}
              <div>
                <p className="text-gray-500 text-sm mb-3">Progress</p>
                <div className="flex items-center justify-between">
                  {milestones.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => updateMilestone(selectedTransaction.id, m.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                        idx <= selectedTransaction.milestone 
                          ? 'bg-primary-500/20 text-primary-500' 
                          : 'bg-dark-bg text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-xs hidden sm:block">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedTransaction.notes && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Notes</p>
                  <p className="text-white whitespace-pre-wrap">{selectedTransaction.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-dark-border flex gap-3 sticky bottom-0 bg-dark-card">
              <button 
                onClick={() => deleteTransaction(selectedTransaction.id)} 
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={() => openEditForm(selectedTransaction)} 
                className="btn-secondary flex-1"
              >
                Edit
              </button>
              <button onClick={() => setSelectedTransaction(null)} className="btn-primary flex-1">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-card">
              <h2 className="text-xl font-bold text-white">{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Property Address *</label>
                <input
                  type="text"
                  value={formData.property_address}
                  onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                  className="input-field w-full"
                  placeholder="123 Main St, Orlando, FL 32801"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Client Name</label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="input-field w-full"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Client Type</label>
                  <select
                    value={formData.client_type}
                    onChange={(e) => setFormData({ ...formData, client_type: e.target.value as Transaction['client_type'] })}
                    className="input-field w-full"
                  >
                    <option value="buyer">🏠 Buyer</option>
                    <option value="seller">💰 Seller</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Sale Price *</label>
                  <input
                    type="number"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    className="input-field w-full"
                    placeholder="350000"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Commission %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                    className="input-field w-full"
                    placeholder="3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Contract Date</label>
                  <input
                    type="date"
                    value={formData.contract_date}
                    onChange={(e) => setFormData({ ...formData, contract_date: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Closing Date</label>
                  <input
                    type="date"
                    value={formData.closing_date}
                    onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Inspection Date</label>
                  <input
                    type="date"
                    value={formData.inspection_date}
                    onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Appraisal Date</label>
                  <input
                    type="date"
                    value={formData.appraisal_date}
                    onChange={(e) => setFormData({ ...formData, appraisal_date: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Add notes about this transaction..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-dark-border flex gap-3 sticky bottom-0 bg-dark-card">
              <button onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
              <button 
                onClick={saveTransaction} 
                className="btn-primary flex-1"
                disabled={!formData.property_address.trim() || !formData.sale_price}
              >
                {editingTransaction ? 'Save Changes' : 'Add Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
