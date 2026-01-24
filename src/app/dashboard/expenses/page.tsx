'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const sampleExpenses = [
  { id: 1, date: '2026-01-20', category: 'marketing', description: 'Facebook Ads - January Campaign', vendor: 'Meta', amount: 350, paymentMethod: 'credit', isDeductible: true, notes: 'Lead generation campaign for Winter Park area' },
  { id: 2, date: '2026-01-18', category: 'marketing', description: 'Just Listed Postcards - Sarah Chen', vendor: 'VistaPrint', amount: 185, paymentMethod: 'credit', isDeductible: true, notes: '500 postcards for Dr Phillips neighborhood' },
  { id: 3, date: '2026-01-15', category: 'education', description: 'NAR Annual Conference Registration', vendor: 'National Association of Realtors', amount: 495, paymentMethod: 'credit', isDeductible: true, notes: 'March 2026 conference in San Diego' },
  { id: 4, date: '2026-01-12', category: 'office', description: 'Printer Ink & Paper', vendor: 'Staples', amount: 89.99, paymentMethod: 'debit', isDeductible: true },
  { id: 5, date: '2026-01-10', category: 'software', description: 'MLS Subscription - Monthly', vendor: 'Stellar MLS', amount: 45, paymentMethod: 'credit', isDeductible: true },
  { id: 6, date: '2026-01-08', category: 'marketing', description: 'Zillow Premier Agent - January', vendor: 'Zillow', amount: 500, paymentMethod: 'credit', isDeductible: true, notes: 'Lead package for Orlando area' },
  { id: 7, date: '2026-01-05', category: 'client', description: 'Closing Gift - Williams Family', vendor: 'Amazon', amount: 150, paymentMethod: 'credit', isDeductible: true, notes: 'Wine basket and cutting board set' },
  { id: 8, date: '2026-01-03', category: 'photography', description: 'Professional Photos - 456 Dr Phillips', vendor: 'Orlando Real Estate Photography', amount: 275, paymentMethod: 'credit', isDeductible: true, notes: 'Sarah Chen listing' },
  { id: 9, date: '2025-12-28', category: 'software', description: 'CRM Software - Annual', vendor: 'Follow Up Boss', amount: 499, paymentMethod: 'credit', isDeductible: true },
  { id: 10, date: '2025-12-20', category: 'marketing', description: 'Holiday Client Gifts', vendor: 'Various', amount: 850, paymentMethod: 'credit', isDeductible: true, notes: 'Gift cards and cookies for top 25 clients' },
  { id: 11, date: '2025-12-15', category: 'education', description: 'Real Estate Masterclass', vendor: 'Tom Ferry', amount: 997, paymentMethod: 'credit', isDeductible: true },
  { id: 12, date: '2025-12-10', category: 'office', description: 'Business Cards - 1000 qty', vendor: 'Moo', amount: 125, paymentMethod: 'credit', isDeductible: true },
  { id: 13, date: '2025-12-05', category: 'insurance', description: 'E&O Insurance - Quarterly', vendor: 'CRES Insurance', amount: 375, paymentMethod: 'credit', isDeductible: true },
  { id: 14, date: '2025-12-01', category: 'dues', description: 'Orlando Regional Realtor Assoc - Annual', vendor: 'ORRA', amount: 650, paymentMethod: 'credit', isDeductible: true },
  { id: 15, date: '2025-11-25', category: 'signage', description: 'For Sale Signs (10)', vendor: 'Oakley Signs', amount: 320, paymentMethod: 'credit', isDeductible: true }
]

const categories = [
  { value: 'marketing', label: '📢 Marketing', color: '#4A9B7F' },
  { value: 'office', label: '🏢 Office Supplies', color: '#6B8DD6' },
  { value: 'software', label: '💻 Software/Tech', color: '#9B59B6' },
  { value: 'education', label: '📚 Education', color: '#E67E22' },
  { value: 'client', label: '🎁 Client Gifts', color: '#D4AF37' },
  { value: 'photography', label: '📸 Photography', color: '#E74C3C' },
  { value: 'signage', label: '🪧 Signage', color: '#1ABC9C' },
  { value: 'dues', label: '🏛️ Dues & Fees', color: '#34495E' },
  { value: 'insurance', label: '🛡️ Insurance', color: '#7F8C8D' },
  { value: 'other', label: '📦 Other', color: '#666' }
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], category: 'marketing', description: '', vendor: '', amount: '', paymentMethod: 'credit', isDeductible: true, notes: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('repal_expenses')
    if (saved) {
      const parsed = JSON.parse(saved)
      setExpenses(parsed.length > 0 ? parsed : sampleExpenses)
    } else {
      setExpenses(sampleExpenses)
    }
  }, [])

  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem('repal_expenses', JSON.stringify(expenses))
    }
  }, [expenses])

  const getCategoryInfo = (cat: string) => categories.find(c => c.value === cat) || categories[categories.length - 1]

  const filteredExpenses = expenses.filter(exp => {
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory
    const matchesYear = exp.date.startsWith(filterYear)
    return matchesCategory && matchesYear
  }).sort((a, b) => b.date.localeCompare(a.date))

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)
  const deductibleTotal = filteredExpenses.filter(e => e.isDeductible).reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)

  const resetForm = () => {
    setFormData({ date: new Date().toISOString().split('T')[0], category: 'marketing', description: '', vendor: '', amount: '', paymentMethod: 'credit', isDeductible: true, notes: '' })
    setShowForm(false)
    setEditingExpense(null)
  }

  const openEditForm = (expense: any) => {
    setEditingExpense(expense)
    setFormData({
      date: expense.date || new Date().toISOString().split('T')[0],
      category: expense.category || 'marketing',
      description: expense.description || '',
      vendor: expense.vendor || '',
      amount: expense.amount?.toString() || '',
      paymentMethod: expense.paymentMethod || 'credit',
      isDeductible: expense.isDeductible !== false,
      notes: expense.notes || ''
    })
    setShowForm(true)
  }

  const saveExpense = () => {
    const expenseData = { ...formData, amount: parseFloat(formData.amount) || 0 }
    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === editingExpense.id ? { ...expenseData, id: editingExpense.id } : e))
    } else {
      setExpenses([...expenses, { ...expenseData, id: Date.now() }])
    }
    resetForm()
  }

  const deleteExpense = (id: number) => {
    if (confirm('Delete this expense?')) setExpenses(expenses.filter(e => e.id !== id))
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#fff', padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard" style={{ color: '#D4AF37', fontSize: '1.5rem' }}>←</Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>💰 Expense Tracker</h1>
          </div>
          <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}>+ Add Expense</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333' }}>
            <div style={{ fontSize: '0.875rem', color: '#999' }}>Total Expenses ({filterYear})</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#C97B63' }}>${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333' }}>
            <div style={{ fontSize: '0.875rem', color: '#999' }}>Tax Deductible</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4A9B7F' }}>${deductibleTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333' }}>
            <div style={{ fontSize: '0.875rem', color: '#999' }}>Entries</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{filteredExpenses.length}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff' }}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff' }}>
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filteredExpenses.map(expense => {
            const catInfo = getCategoryInfo(expense.category)
            return (
              <div key={expense.id} onClick={() => openEditForm(expense)} className="group" style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: catInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>{catInfo.label.split(' ')[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '600' }}>{expense.description}</span>
                      {expense.isDeductible && <span style={{ backgroundColor: '#4A9B7F', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem' }}>TAX DEDUCTIBLE</span>}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#999', marginTop: '0.25rem' }}>
                      <span style={{ marginRight: '1rem' }}>📅 {new Date(expense.date).toLocaleDateString()}</span>
                      {expense.vendor && <span>🏪 {expense.vendor}</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#C97B63' }}>-${parseFloat(expense.amount).toFixed(2)}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteExpense(expense.id) }} className="delete-btn" style={{ backgroundColor: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.25rem', padding: '0.5rem', marginLeft: '0.5rem', opacity: 0, transition: 'opacity 0.2s' }}>🗑️</button>
              </div>
            )
          })}
        </div>

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
            <div style={{ backgroundColor: '#2a2a2a', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{editingExpense ? '✏️ Edit Expense' : '➕ Add Expense'}</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input type="text" placeholder="Description *" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="number" step="0.01" placeholder="Amount *" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                  <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    <option value="credit">💳 Credit Card</option>
                    <option value="debit">🏦 Debit Card</option>
                    <option value="cash">💵 Cash</option>
                    <option value="check">📝 Check</option>
                  </select>
                </div>
                <input type="text" placeholder="Vendor" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                <textarea placeholder="Notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', resize: 'vertical' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isDeductible} onChange={(e) => setFormData({ ...formData, isDeductible: e.target.checked })} style={{ width: '1.25rem', height: '1.25rem', accentColor: '#D4AF37' }} />
                  <span>Tax Deductible</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={resetForm} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveExpense} disabled={!formData.description || !formData.amount} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#D4AF37', color: '#000', cursor: 'pointer', fontWeight: '600', opacity: formData.description && formData.amount ? 1 : 0.5 }}>{editingExpense ? 'Save Changes' : 'Add Expense'}</button>
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
