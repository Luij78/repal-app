'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const sampleTransactions = [
  { id: 1, address: '789 Lake View Dr, Winter Park, FL', clientName: 'Robert & Linda Williams', clientType: 'buyer', clientEmail: 'rwilliams55@aol.com', clientPhone: '407-555-0103', price: 575000, contractDate: '2025-12-15', closingDate: '2026-01-30', commission: 3, status: 'closing', leadId: 3, milestones: { offer: true, contract: true, inspection: true, appraisal: true, financing: true, title: true, walkthrough: false, closing: false }, createdAt: '2025-12-15' },
  { id: 2, address: '456 Dr Phillips Blvd, Orlando, FL', clientName: 'Sarah Chen', clientType: 'seller', clientEmail: 'sarah.chen@gmail.com', clientPhone: '407-555-0102', price: 485000, contractDate: '2026-01-10', closingDate: '2026-02-28', commission: 2.5, status: 'active', leadId: 2, milestones: { offer: true, contract: true, inspection: true, appraisal: false, financing: false, title: false, walkthrough: false, closing: false }, createdAt: '2026-01-10' },
  { id: 3, address: '123 Maitland Ave, Maitland, FL', clientName: 'Jennifer Thompson', clientType: 'buyer', clientEmail: 'jthompson@outlook.com', clientPhone: '407-555-0105', price: 315000, contractDate: '2026-01-18', closingDate: '2026-03-15', commission: 3, status: 'active', leadId: 5, milestones: { offer: true, contract: true, inspection: false, appraisal: false, financing: false, title: false, walkthrough: false, closing: false }, createdAt: '2026-01-18' },
  { id: 4, address: '567 Waterford Lakes Pkwy, Orlando, FL', clientName: 'Marcus Johnson', clientType: 'buyer', clientEmail: 'marcus.j@email.com', clientPhone: '407-555-0101', price: 425000, contractDate: '2025-10-01', closingDate: '2025-11-30', commission: 3, status: 'closed', milestones: { offer: true, contract: true, inspection: true, appraisal: true, financing: true, title: true, walkthrough: true, closing: true }, createdAt: '2025-10-01' },
  { id: 5, address: '234 Baldwin Park Blvd, Orlando, FL', clientName: 'Christopher Lee', clientType: 'buyer', clientEmail: 'chris.lee@techcorp.com', clientPhone: '407-555-0107', price: 550000, contractDate: '2025-08-15', closingDate: '2025-10-01', commission: 2.5, status: 'closed', milestones: { offer: true, contract: true, inspection: true, appraisal: true, financing: true, title: true, walkthrough: true, closing: true }, createdAt: '2025-08-15' },
  { id: 6, address: '890 Celebration Ave, Kissimmee, FL', clientName: 'Paul Nelson', clientType: 'buyer', clientEmail: 'pnelson@techstartup.com', clientPhone: '407-555-0130', price: 285000, contractDate: '2025-06-01', closingDate: '2025-07-15', commission: 3, status: 'closed', milestones: { offer: true, contract: true, inspection: true, appraisal: true, financing: true, title: true, walkthrough: true, closing: true }, createdAt: '2025-06-01' },
  { id: 7, address: '456 Lake Nona Blvd, Orlando, FL', clientName: 'Jessica Campbell', clientType: 'buyer', clientEmail: 'jcampbell@lawfirm.com', clientPhone: '407-555-0137', price: 625000, contractDate: '2025-09-01', closingDate: '2025-10-30', commission: 3, status: 'closed', milestones: { offer: true, contract: true, inspection: true, appraisal: true, financing: true, title: true, walkthrough: true, closing: true }, createdAt: '2025-09-01' }
]

const milestoneSteps = [
  { key: 'offer', label: 'Offer', icon: '📝' },
  { key: 'contract', label: 'Contract', icon: '📋' },
  { key: 'inspection', label: 'Inspection', icon: '🔍' },
  { key: 'appraisal', label: 'Appraisal', icon: '💰' },
  { key: 'financing', label: 'Financing', icon: '🏦' },
  { key: 'title', label: 'Title', icon: '📄' },
  { key: 'walkthrough', label: 'Walk-through', icon: '🚶' },
  { key: 'closing', label: 'Closing', icon: '🔑' }
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTx, setEditingTx] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [formData, setFormData] = useState({
    address: '', clientName: '', clientType: 'buyer', clientEmail: '', clientPhone: '',
    price: '', contractDate: '', closingDate: '', commission: 3, status: 'pending',
    milestones: { offer: false, contract: false, inspection: false, appraisal: false, financing: false, title: false, walkthrough: false, closing: false }
  })

  useEffect(() => {
    const saved = localStorage.getItem('repal_transactions')
    if (saved) {
      const parsed = JSON.parse(saved)
      setTransactions(parsed.length > 0 ? parsed : sampleTransactions)
    } else {
      setTransactions(sampleTransactions)
    }
  }, [])

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('repal_transactions', JSON.stringify(transactions))
    }
  }, [transactions])

  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = { pending: '#666', active: '#D4AF37', closing: '#6B8DD6', closed: '#4A9B7F', cancelled: '#C97B63' }
    return colors[s] || '#666'
  }

  const filteredTransactions = transactions.filter(tx => {
    return filterStatus === 'all' || tx.status === filterStatus
  }).sort((a, b) => b.contractDate.localeCompare(a.contractDate))

  const activeTransactions = transactions.filter(tx => ['active', 'closing', 'pending'].includes(tx.status))
  const closedTransactions = transactions.filter(tx => tx.status === 'closed')
  const ytdCommission = closedTransactions.filter(tx => tx.closingDate?.startsWith('2026')).reduce((sum, tx) => sum + (parseFloat(tx.price) * (tx.commission / 100)), 0)
  const pendingCommission = activeTransactions.reduce((sum, tx) => sum + (parseFloat(tx.price) * (tx.commission / 100)), 0)

  const resetForm = () => {
    setFormData({
      address: '', clientName: '', clientType: 'buyer', clientEmail: '', clientPhone: '',
      price: '', contractDate: '', closingDate: '', commission: 3, status: 'pending',
      milestones: { offer: false, contract: false, inspection: false, appraisal: false, financing: false, title: false, walkthrough: false, closing: false }
    })
    setShowForm(false)
    setEditingTx(null)
  }

  const openEditForm = (tx: any) => {
    setEditingTx(tx)
    setFormData({
      address: tx.address || '',
      clientName: tx.clientName || '',
      clientType: tx.clientType || 'buyer',
      clientEmail: tx.clientEmail || '',
      clientPhone: tx.clientPhone || '',
      price: tx.price?.toString() || '',
      contractDate: tx.contractDate || '',
      closingDate: tx.closingDate || '',
      commission: tx.commission || 3,
      status: tx.status || 'pending',
      milestones: tx.milestones || { offer: false, contract: false, inspection: false, appraisal: false, financing: false, title: false, walkthrough: false, closing: false }
    })
    setShowForm(true)
  }

  const saveTransaction = () => {
    const txData = { ...formData, price: parseFloat(formData.price) || 0 }
    if (editingTx) {
      setTransactions(transactions.map(t => t.id === editingTx.id ? { ...txData, id: editingTx.id, createdAt: editingTx.createdAt } : t))
    } else {
      setTransactions([...transactions, { ...txData, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] }])
    }
    resetForm()
  }

  const toggleMilestone = (txId: number, milestone: string) => {
    setTransactions(transactions.map(tx => {
      if (tx.id === txId) {
        const newMilestones = { ...tx.milestones, [milestone]: !tx.milestones[milestone] }
        const completedCount = Object.values(newMilestones).filter(Boolean).length
        let newStatus = tx.status
        if (completedCount === 8) newStatus = 'closed'
        else if (completedCount >= 5) newStatus = 'closing'
        else if (completedCount >= 1) newStatus = 'active'
        return { ...tx, milestones: newMilestones, status: newStatus }
      }
      return tx
    }))
  }

  const deleteTransaction = (id: number) => {
    if (confirm('Delete this transaction?')) setTransactions(transactions.filter(t => t.id !== id))
  }

  const getProgress = (milestones: any) => {
    if (!milestones) return 0
    const completed = Object.values(milestones).filter(Boolean).length
    return Math.round((completed / 8) * 100)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#fff', padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard" style={{ color: '#D4AF37', fontSize: '1.5rem' }}>←</Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🏠 Transaction Tracker</h1>
            <span style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>{activeTransactions.length} active</span>
          </div>
          <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}>+ Add Transaction</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333' }}>
            <div style={{ fontSize: '0.875rem', color: '#999' }}>YTD Commission (2026)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4A9B7F' }}>${ytdCommission.toLocaleString()}</div>
          </div>
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333' }}>
            <div style={{ fontSize: '0.875rem', color: '#999' }}>Pending Commission</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#D4AF37' }}>${pendingCommission.toLocaleString()}</div>
          </div>
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333' }}>
            <div style={{ fontSize: '0.875rem', color: '#999' }}>Closed This Year</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{closedTransactions.filter(tx => tx.closingDate?.startsWith('2026')).length}</div>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff' }}>
            <option value="all">All Transactions</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="closing">Closing</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filteredTransactions.map(tx => {
            const progress = getProgress(tx.milestones)
            const commission = (parseFloat(tx.price) * (tx.commission / 100))
            
            return (
              <div key={tx.id} onClick={() => openEditForm(tx)} className="group" style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{tx.address}</span>
                      <span style={{ backgroundColor: getStatusColor(tx.status), padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>{tx.status}</span>
                      <span style={{ backgroundColor: tx.clientType === 'buyer' ? '#4A9B7F' : '#6B8DD6', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>{tx.clientType === 'buyer' ? '🏠 Buyer' : '💰 Seller'}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#999' }}>
                      👤 {tx.clientName} • 💵 ${parseFloat(tx.price).toLocaleString()} • 📅 Close: {tx.closingDate ? new Date(tx.closingDate).toLocaleDateString() : 'TBD'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#4A9B7F', marginTop: '0.25rem' }}>
                      Commission: ${commission.toLocaleString()} ({tx.commission}%)
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteTransaction(tx.id) }} className="delete-btn" style={{ backgroundColor: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.25rem', padding: '0.5rem', opacity: 0, transition: 'opacity 0.2s' }}>🗑️</button>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem' }}>
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, backgroundColor: progress === 100 ? '#4A9B7F' : '#D4AF37', transition: 'width 0.3s' }} />
                  </div>
                </div>

                {/* Milestone Indicators */}
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                  {milestoneSteps.map(step => (
                    <button key={step.key} onClick={() => toggleMilestone(tx.id, step.key)} style={{ backgroundColor: tx.milestones?.[step.key] ? '#4A9B7F' : '#333', border: 'none', borderRadius: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.625rem', cursor: 'pointer', color: '#fff', transition: 'background-color 0.2s' }} title={step.label}>
                      {step.icon} {step.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
            <div style={{ backgroundColor: '#2a2a2a', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{editingTx ? '✏️ Edit Transaction' : '➕ Add Transaction'}</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input type="text" placeholder="Property Address *" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="text" placeholder="Client Name *" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <select value={formData.clientType} onChange={(e) => setFormData({ ...formData, clientType: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="email" placeholder="Client Email" value={formData.clientEmail} onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <input type="tel" placeholder="Client Phone" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <input type="number" placeholder="Price *" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <input type="number" step="0.1" placeholder="Commission %" value={formData.commission} onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) || 3 })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="closing">Closing</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#999' }}>Contract Date</label>
                    <input type="date" value={formData.contractDate} onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#999' }}>Closing Date</label>
                    <input type="date" value={formData.closingDate} onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={resetForm} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveTransaction} disabled={!formData.address || !formData.clientName || !formData.price} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#D4AF37', color: '#000', cursor: 'pointer', fontWeight: '600', opacity: formData.address && formData.clientName && formData.price ? 1 : 0.5 }}>{editingTx ? 'Save Changes' : 'Add Transaction'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .group:hover .delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
