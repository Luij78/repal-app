'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'

interface Expense {
  id: string
  user_id: string
  amount: number
  category: string
  description: string | null
  date: string
  receipt_url: string | null
  tax_deductible: boolean
  created_at: string
}

const categories = [
  { value: 'marketing', label: '📢 Marketing', color: '#E67E22' },
  { value: 'transportation', label: '🚗 Transportation', color: '#3498DB' },
  { value: 'office', label: '🏢 Office', color: '#9B59B6' },
  { value: 'technology', label: '💻 Technology', color: '#1ABC9C' },
  { value: 'education', label: '📚 Education', color: '#E74C3C' },
  { value: 'client', label: '🎁 Client Gifts', color: '#F39C12' },
  { value: 'dues', label: '🏷️ Dues & Subscriptions', color: '#2ECC71' },
  { value: 'meals', label: '🍽️ Meals & Entertainment', color: '#E91E63' },
  { value: 'supplies', label: '📦 Supplies', color: '#00BCD4' },
  { value: 'other', label: '📋 Other', color: '#666' }
]

export default function ExpensesPage() {
  const { user } = useUser()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')
  const [formData, setFormData] = useState({
    amount: '',
    category: 'marketing',
    description: '',
    date: new Date().toISOString().split('T')[0],
    tax_deductible: true
  })

  const supabase = createClient()

  useEffect(() => {
    if (user) fetchExpenses()
  }, [user])

  const fetchExpenses = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching expenses:', error)
    } else {
      setExpenses(data || [])
    }
    setLoading(false)
  }

  const getCategoryInfo = (cat: string) => categories.find(c => c.value === cat) || categories[categories.length - 1]

  const resetForm = () => {
    setFormData({
      amount: '',
      category: 'marketing',
      description: '',
      date: new Date().toISOString().split('T')[0],
      tax_deductible: true
    })
    setEditingExpense(null)
    setShowForm(false)
  }

  const openEditForm = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
      date: expense.date,
      tax_deductible: expense.tax_deductible
    })
    setShowForm(true)
  }

  const saveExpense = async () => {
    if (!user || !formData.amount || !formData.date) return

    const expenseData = {
      user_id: user.id,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description || null,
      date: formData.date,
      tax_deductible: formData.tax_deductible
    }

    if (editingExpense) {
      const { error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', editingExpense.id)

      if (error) {
        console.error('Error updating expense:', error)
      } else {
        setExpenses(expenses.map(e => e.id === editingExpense.id ? { ...e, ...expenseData } : e))
        resetForm()
      }
    } else {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single()

      if (error) {
        console.error('Error adding expense:', error)
      } else if (data) {
        setExpenses([data, ...expenses])
        resetForm()
      }
    }
  }

  const deleteExpense = async (expenseId: string) => {
    if (!confirm('Delete this expense?')) return

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)

    if (error) {
      console.error('Error deleting expense:', error)
    } else {
      setExpenses(expenses.filter(e => e.id !== expenseId))
    }
  }

  // Get unique months from expenses
  const months = Array.from(new Set(expenses.map(e => e.date.substring(0, 7)))).sort().reverse()

  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory
    const matchesMonth = filterMonth === 'all' || expense.date.startsWith(filterMonth)
    return matchesCategory && matchesMonth
  })

  // Stats
  const currentYear = new Date().getFullYear().toString()
  const currentMonth = new Date().toISOString().substring(0, 7)
  const ytdTotal = expenses.filter(e => e.date.startsWith(currentYear)).reduce((sum, e) => sum + e.amount, 0)
  const mtdTotal = expenses.filter(e => e.date.startsWith(currentMonth)).reduce((sum, e) => sum + e.amount, 0)
  const deductibleTotal = expenses.filter(e => e.tax_deductible && e.date.startsWith(currentYear)).reduce((sum, e) => sum + e.amount, 0)
  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  // Category breakdown
  const categoryTotals = categories.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.value && e.date.startsWith(currentYear)).reduce((sum, e) => sum + e.amount, 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🧾 Expense Tracker</h1>
          <p className="text-gray-400">Track tax-deductible business expenses</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{formatCurrency(mtdTotal)}</p>
          <p className="text-gray-400 text-sm">This Month</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-500">{formatCurrency(ytdTotal)}</p>
          <p className="text-gray-400 text-sm">Year to Date</p>
        </div>
        <div className="card text-center border-green-500/30">
          <p className="text-2xl font-bold text-green-400">{formatCurrency(deductibleTotal)}</p>
          <p className="text-gray-400 text-sm">Tax Deductible (YTD)</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-400">{expenses.length}</p>
          <p className="text-gray-400 text-sm">Total Entries</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryTotals.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-white font-semibold mb-4">📊 {currentYear} Breakdown</h3>
          <div className="space-y-3">
            {categoryTotals.slice(0, 5).map(cat => (
              <div key={cat.value} className="flex items-center gap-3">
                <div className="w-24 text-sm" style={{ color: cat.color }}>{cat.label}</div>
                <div className="flex-1 bg-dark-border rounded-full h-3">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min((cat.total / ytdTotal) * 100, 100)}%`,
                      backgroundColor: cat.color 
                    }}
                  />
                </div>
                <div className="w-24 text-right text-white font-semibold">{formatCurrency(cat.total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-field"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="input-field"
        >
          <option value="all">All Time</option>
          {months.map(month => (
            <option key={month} value={month}>{formatMonth(month)}</option>
          ))}
        </select>
        {(filterCategory !== 'all' || filterMonth !== 'all') && (
          <div className="flex items-center text-primary-500">
            Filtered Total: <span className="font-bold ml-2">{formatCurrency(filteredTotal)}</span>
          </div>
        )}
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading expenses...</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">🧾</span>
          <p className="text-gray-400 mb-4">
            {filterCategory !== 'all' || filterMonth !== 'all' ? 'No expenses match your filters' : 'No expenses yet'}
          </p>
          {filterCategory === 'all' && filterMonth === 'all' && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Track Your First Expense
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map(expense => {
            const catInfo = getCategoryInfo(expense.category)
            
            return (
              <div key={expense.id} className="card flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${catInfo.color}20` }}
                  >
                    <span>{catInfo.label.split(' ')[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{formatCurrency(expense.amount)}</p>
                      {expense.tax_deductible && (
                        <span className="text-green-400 text-xs">✓ Deductible</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {expense.description || catInfo.label} • {formatDate(expense.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditForm(expense)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field w-full"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field w-full"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field w-full"
                  placeholder="What was this expense for?"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="tax_deductible"
                  checked={formData.tax_deductible}
                  onChange={(e) => setFormData({ ...formData, tax_deductible: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 bg-dark-bg text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="tax_deductible" className="text-gray-300">
                  ✓ Tax Deductible
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-dark-border flex gap-3">
              <button onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
              <button 
                onClick={saveExpense} 
                className="btn-primary flex-1"
                disabled={!formData.amount || !formData.date}
              >
                {editingExpense ? 'Save Changes' : 'Add Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
