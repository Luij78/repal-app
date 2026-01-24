'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function OpenHousePage() {
  const [visitors, setVisitors] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingVisitor, setEditingVisitor] = useState<any>(null)
  const [propertyAddress, setPropertyAddress] = useState('')
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', type: 'buyer', agent: '', notes: '', hearAbout: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('repal_openhouse_visitors')
    if (saved) setVisitors(JSON.parse(saved))
    const savedAddress = localStorage.getItem('repal_openhouse_address')
    if (savedAddress) setPropertyAddress(savedAddress)
  }, [])

  useEffect(() => {
    localStorage.setItem('repal_openhouse_visitors', JSON.stringify(visitors))
  }, [visitors])

  useEffect(() => {
    localStorage.setItem('repal_openhouse_address', propertyAddress)
  }, [propertyAddress])

  const addVisitor = () => {
    if (!formData.name) return alert('Please enter visitor name')
    if (editingVisitor) {
      setVisitors(visitors.map(v => v.id === editingVisitor.id ? { ...formData, id: editingVisitor.id, signInTime: editingVisitor.signInTime, property: editingVisitor.property } : v))
    } else {
      setVisitors([...visitors, { ...formData, id: Date.now(), signInTime: new Date().toISOString(), property: propertyAddress }])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', type: 'buyer', agent: '', notes: '', hearAbout: '' })
    setEditingVisitor(null)
    setShowForm(false)
  }

  const openEditForm = (visitor: any) => {
    setEditingVisitor(visitor)
    setFormData({ name: visitor.name, email: visitor.email || '', phone: visitor.phone || '', type: visitor.type, agent: visitor.agent || '', notes: visitor.notes || '', hearAbout: visitor.hearAbout || '' })
    setShowForm(true)
  }

  const deleteVisitor = (id: number) => {
    if (confirm('Remove this visitor?')) setVisitors(visitors.filter(v => v.id !== id))
  }

  const exportToLeads = () => {
    const existingLeads = JSON.parse(localStorage.getItem('repal_leads') || '[]')
    const newLeads = visitors.filter(v => !v.agent).map(v => ({
      id: Date.now() + Math.random(),
      name: v.name,
      email: v.email,
      phone: v.phone,
      type: v.type,
      status: 'new',
      priority: 5,
      notes: `[Open House ${new Date(v.signInTime).toLocaleDateString()}] ${propertyAddress}\n${v.notes || ''}\nHeard about us: ${v.hearAbout || 'Not specified'}`,
      createdAt: new Date().toISOString()
    }))
    localStorage.setItem('repal_leads', JSON.stringify([...existingLeads, ...newLeads]))
    alert(`✓ Exported ${newLeads.length} visitors to Lead Manager!`)
  }

  const clearVisitors = () => {
    if (confirm('Clear all visitors? This cannot be undone.')) {
      setVisitors([])
    }
  }

  const unrepresentedCount = visitors.filter(v => !v.agent).length

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">🏡 Open House Sign-In</h1>
          <p className="text-gray-400 text-sm">Digital sign-in for open house visitors</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          {unrepresentedCount > 0 && (
            <button onClick={exportToLeads} className="px-4 py-2.5 text-sm font-semibold bg-[#4ECDC4] text-white rounded-lg hover:bg-[#4ECDC4]/80 transition-colors">
              📤 Export to Leads ({unrepresentedCount})
            </button>
          )}
        </div>
      </div>

      {/* Property Address */}
      <div className="mb-6 p-4 bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl border border-dark-border">
        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Property Address</label>
        <input
          type="text"
          value={propertyAddress}
          onChange={(e) => setPropertyAddress(e.target.value)}
          placeholder="123 Main St, City, ST 12345"
          className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white text-lg outline-none focus:border-primary-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-primary-400">{visitors.length}</span>
          <p className="text-xs text-gray-400 mt-1">Total Visitors</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-[#4A9B7F]">{unrepresentedCount}</span>
          <p className="text-xs text-gray-400 mt-1">Unrepresented</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border text-center">
          <span className="text-2xl font-bold text-[#6B8DD6]">{visitors.filter(v => v.agent).length}</span>
          <p className="text-xs text-gray-400 mt-1">With Agent</p>
        </div>
      </div>

      {/* Add Visitor Button */}
      <button onClick={() => { resetForm(); setShowForm(true) }} className="w-full py-4 mb-6 text-lg font-semibold bg-primary-500 text-dark-bg rounded-xl hover:bg-primary-400 transition-colors">
        ✍️ Sign In New Visitor
      </button>

      {/* Visitor List */}
      <div className="space-y-3">
        {visitors.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🏡</span>
            <p className="text-gray-400">No visitors yet. Start signing in guests!</p>
          </div>
        ) : (
          <>
            {visitors.map(v => (
              <div 
                key={v.id} 
                onClick={() => openEditForm(v)}
                className="group bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border hover:border-primary-500/30 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary-500/5"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-white">{v.name}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(v.signInTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${v.agent ? 'bg-[#6B8DD6] text-white' : 'bg-[#4A9B7F] text-white'}`}>
                      {v.agent ? 'Has Agent' : 'Unrepresented'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary-500/20 text-primary-400 capitalize">{v.type}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteVisitor(v.id) }} className="text-gray-600 hover:text-[#E74C3C] transition-colors opacity-0 group-hover:opacity-100">🗑️</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                  {v.phone && <span>📱 {v.phone}</span>}
                  {v.email && <span>✉️ {v.email}</span>}
                  {v.hearAbout && <span>📣 {v.hearAbout}</span>}
                </div>
                {v.notes && <p className="text-sm text-gray-500 mt-2">{v.notes}</p>}
              </div>
            ))}
            
            <button onClick={clearVisitors} className="w-full py-3 text-sm text-gray-500 hover:text-[#E74C3C] transition-colors">
              🗑️ Clear All Visitors
            </button>
          </>
        )}
      </div>

      {/* Sign In / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-lg w-full border border-dark-border my-8">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">{editingVisitor ? '✏️ Edit Visitor' : '✍️ Visitor Sign-In'}</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Full Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500 text-lg" autoFocus />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">I am a...</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                    <option value="buyer">Buyer</option>
                    <option value="neighbor">Neighbor</option>
                    <option value="investor">Investor</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">How did you hear about us?</label>
                  <select value={formData.hearAbout} onChange={(e) => setFormData({ ...formData, hearAbout: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                    <option value="">Select...</option>
                    <option value="Sign">Yard Sign</option>
                    <option value="Zillow">Zillow</option>
                    <option value="Realtor.com">Realtor.com</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Referral">Referral</option>
                    <option value="Driving By">Driving By</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Working with an agent?</label>
                <input type="text" value={formData.agent} onChange={(e) => setFormData({ ...formData, agent: e.target.value })} placeholder="Agent name (leave blank if no)" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Notes / Comments</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any questions or interests..." className="w-full min-h-[80px] px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500 resize-y" />
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button onClick={resetForm} className="px-6 py-3 text-sm font-semibold text-gray-400 border border-dark-border rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={addVisitor} className="px-6 py-3 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">{editingVisitor ? 'Save Changes' : 'Sign In'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
