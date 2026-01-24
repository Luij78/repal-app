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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [filterCategory, setFilterCategory] = useState('all')
  const [formData, setFormData] = useState({ description: '', category: 'marketing', amount: '', date: '', vendor: '', paymentMethod: 'card', taxDeductible: true })

  const categories = [
    { id: 'marketing', name: 'Marketing', icon: '📢' },
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'office', name: 'Office Supplies', icon: '📎' },
    { id: 'professional', name: 'Professional Dev', icon: '📚' },
    { id: 'mls', name: 'MLS/Association', icon: '🏢' },
    { id: 'photography', name: 'Photography', icon: '📸' },
    { id: 'staging', name: 'Staging', icon: '🛋️' },
    { id: 'travel', name: 'Travel', icon: '✈️' },
    { id: 'meals', name: 'Meals & Entertainment', icon: '🍽️' },
    { id: 'gifts', name: 'Client Gifts', icon: '🎁' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️' },
    { id: 'vehicle', name: 'Vehicle', icon: '🚗' },
    { id: 'other', name: 'Other', icon: '📋' }
  ]

  useEffect(() => { const saved = localStorage.getItem('repal_expenses'); if (saved) setExpenses(JSON.parse(saved)) }, [])
  useEffect(() => { localStorage.setItem('repal_expenses', JSON.stringify(expenses)) }, [expenses])

  const saveExpense = () => {
    if (!formData.description || !formData.amount) return alert('Please enter description and amount')
    setExpenses([...expenses, { ...formData, id: Date.now(), amount: parseFloat(formData.amount) }])
    setFormData({ description: '', category: 'marketing', amount: '', date: '', vendor: '', paymentMethod: 'card', taxDeductible: true })
    setShowForm(false)
  }

  const deleteExpense = (id: number) => { if (confirm('Delete this expense?')) setExpenses(expenses.filter(e => e.id !== id)) }

  const filteredExpenses = expenses.filter(e => {
    const expYear = e.date ? new Date(e.date).getFullYear().toString() : filterYear
    const matchesYear = expYear === filterYear
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory
    return matchesYear && matchesCategory
  })

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const taxDeductible = filteredExpenses.filter(e => e.taxDeductible).reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">💰 Expense Tracker</h1>
          <p className="text-gray-400 text-sm">Track business expenses for tax deductions</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ Add Expense</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-white">${totalExpenses.toLocaleString()}</span>
          <p className="text-xs text-gray-400 mt-1">Total ({filterYear})</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-[#4A9B7F]">${taxDeductible.toLocaleString()}</span>
          <p className="text-xs text-gray-400 mt-1">Tax Deductible</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-primary-400">{filteredExpenses.length}</span>
          <p className="text-xs text-gray-400 mt-1">Transactions</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
          {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16"><span className="text-5xl mb-4 block">💰</span><p className="text-gray-400">No expenses recorded.</p></div>
        ) : (
          filteredExpenses.map(expense => (
            <div key={expense.id} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border hover:border-primary-500/30 transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categories.find(c => c.id === expense.category)?.icon || '📋'}</span>
                  <div>
                    <h3 className="font-medium text-white">{expense.description}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {expense.vendor && <span>{expense.vendor}</span>}
                      {expense.date && <span>• {new Date(expense.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                      {expense.taxDeductible && <span className="text-[#4A9B7F]">• Tax Deductible</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white">${expense.amount?.toLocaleString()}</span>
                  <button onClick={() => deleteExpense(expense.id)} className="text-gray-500 hover:text-[#E74C3C]">🗑️</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-lg w-full border border-dark-border">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">Add Expense</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Description *</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Amount *</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DatePickerField label="Date" value={formData.date} onChange={(v) => setFormData({ ...formData, date: v })} />
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Vendor</label>
                  <input type="text" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Payment Method</label>
                  <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                    <option value="card">Credit Card</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.taxDeductible} onChange={(e) => setFormData({ ...formData, taxDeductible: e.target.checked })} className="w-5 h-5 rounded border-dark-border bg-[#0D0D0D]" />
                    <span className="text-sm text-gray-400">Tax Deductible</span>
                  </label>
                </div>
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
