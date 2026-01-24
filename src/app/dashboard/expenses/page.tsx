'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'marketing',
    description: '',
    vendor: '',
    amount: '',
    paymentMethod: 'credit',
    notes: '',
    isDeductible: true
  })

  const categories = [
    { id: 'marketing', name: 'Marketing & Advertising', icon: '📢' },
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'office', name: 'Office Supplies', icon: '📎' },
    { id: 'professional', name: 'Professional Development', icon: '🎓' },
    { id: 'mls', name: 'MLS & Board Fees', icon: '🏢' },
    { id: 'photography', name: 'Photography/Media', icon: '📸' },
    { id: 'staging', name: 'Staging', icon: '🛋️' },
    { id: 'travel', name: 'Travel', icon: '✈️' },
    { id: 'meals', name: 'Meals & Entertainment', icon: '🍽️' },
    { id: 'gifts', name: 'Client Gifts', icon: '🎁' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️' },
    { id: 'vehicle', name: 'Vehicle Expenses', icon: '🚗' },
    { id: 'other', name: 'Other', icon: '📋' }
  ]

  useEffect(() => {
    const saved = localStorage.getItem('repal_expenses')
    if (saved) setExpenses(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('repal_expenses', JSON.stringify(expenses))
  }, [expenses])

  const saveExpense = () => {
    if (!formData.amount || !formData.description) return alert('Please enter amount and description')
    setExpenses([...expenses, { ...formData, id: Date.now(), createdAt: new Date().toISOString() }])
    setFormData({ date: new Date().toISOString().split('T')[0], category: 'marketing', description: '', vendor: '', amount: '', paymentMethod: 'credit', notes: '', isDeductible: true })
    setShowForm(false)
  }

  const deleteExpense = (id: number) => {
    if (confirm('Delete this expense?')) setExpenses(expenses.filter(e => e.id !== id))
  }

  const filteredExpenses = expenses.filter(e => {
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory
    const matchesYear = new Date(e.date).getFullYear().toString() === filterYear
    return matchesCategory && matchesYear
  })

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  const deductibleTotal = filteredExpenses.filter(e => e.isDeductible).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  const getCategoryIcon = (catId: string) => categories.find(c => c.id === catId)?.icon || '📋'
  const getCategoryName = (catId: string) => categories.find(c => c.id === catId)?.name || catId

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">🧾 Expense Tracker</h1>
          <p className="text-gray-400 text-sm">Track business expenses for tax deductions</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ Add Expense</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-white">${totalExpenses.toLocaleString()}</span>
          <p className="text-xs text-gray-400 mt-1">Total ({filterYear})</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-[#4A9B7F]">${deductibleTotal.toLocaleString()}</span>
          <p className="text-xs text-gray-400 mt-1">Tax Deductible</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-primary-400">{filteredExpenses.length}</span>
          <p className="text-xs text-gray-400 mt-1">Transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="px-4 py-3 text-sm bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
          {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-3 text-sm bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer flex-1 min-w-[150px]">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🧾</span>
            <p className="text-gray-400">No expenses recorded. Start tracking!</p>
          </div>
        ) : (
          filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
            <div key={expense.id} className="flex items-center gap-4 bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
              <div className="w-12 h-12 rounded-xl bg-[#1F1F1F] flex items-center justify-center text-2xl flex-shrink-0">
                {getCategoryIcon(expense.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-medium text-white">{expense.description}</h3>
                  {expense.isDeductible && <span className="px-2 py-0.5 bg-[#4A9B7F]/20 text-[#4A9B7F] rounded text-xs">Deductible</span>}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>{getCategoryName(expense.category)}</span>
                  {expense.vendor && <span>• {expense.vendor}</span>}
                  <span>• {new Date(expense.date + 'T00:00:00').toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-semibold text-white">${parseFloat(expense.amount).toLocaleString()}</p>
                <p className="text-xs text-gray-500 capitalize">{expense.paymentMethod}</p>
              </div>
              <button onClick={() => deleteExpense(expense.id)} className="text-gray-600 hover:text-[#E74C3C] transition-colors">🗑️</button>
            </div>
          ))
        )}
      </div>

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-lg w-full border border-dark-border my-8">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">Add Expense</h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Amount *</label>
                  <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Description *</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="What was this expense for?" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Vendor</label>
                  <input type="text" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} placeholder="Business name" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Payment Method</label>
                  <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                    <option value="credit">Credit Card</option>
                    <option value="debit">Debit Card</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="deductible" checked={formData.isDeductible} onChange={(e) => setFormData({ ...formData, isDeductible: e.target.checked })} className="w-5 h-5 rounded border-dark-border bg-[#0D0D0D]" />
                <label htmlFor="deductible" className="text-sm text-gray-400">Tax Deductible</label>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-semibold text-gray-400 border border-dark-border rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={saveExpense} className="px-6 py-3 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">Save Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
