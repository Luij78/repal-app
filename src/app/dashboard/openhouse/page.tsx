'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const sampleVisitors = [
  { id: 1, name: 'John & Mary Peterson', email: 'jpeterson@email.com', phone: '407-555-0201', property: '456 Dr Phillips Blvd', date: '2026-01-19', buyerType: 'buyer', preApproved: true, budget: '$475,000', timeframe: '1-3 months', agent: 'none', notes: 'Very interested! Currently renting, lease ends in March. Pre-approved with First National.' },
  { id: 2, name: 'Susan Williams', email: 'swilliams@gmail.com', phone: '407-555-0202', property: '456 Dr Phillips Blvd', date: '2026-01-19', buyerType: 'buyer', preApproved: false, budget: '$400-500K', timeframe: '3-6 months', agent: 'none', notes: 'First time buyer, needs lender recommendation. Loved the kitchen!' },
  { id: 3, name: 'Robert Miller', email: 'rmiller@company.com', phone: '407-555-0203', property: '456 Dr Phillips Blvd', date: '2026-01-19', buyerType: 'investor', preApproved: true, budget: '$500K+', timeframe: 'immediately', agent: 'other', notes: 'Has agent but contract expires next month. Looking for rental property. May call direct.' },
  { id: 4, name: 'Jennifer Davis', email: '', phone: '407-555-0204', property: '456 Dr Phillips Blvd', date: '2026-01-19', buyerType: 'neighbor', preApproved: false, notes: 'Curious neighbor from down the street. Mentioned friend looking to move to area.' },
  { id: 5, name: 'Michael & Lisa Brown', email: 'browns@email.com', phone: '407-555-0205', property: '789 Winter Park Ave', date: '2026-01-12', buyerType: 'buyer', preApproved: true, budget: '$450,000', timeframe: '1-3 months', agent: 'none', notes: 'Relocating from Tampa. Need good schools for 2 kids. Very motivated!' },
  { id: 6, name: 'Amanda Thompson', email: 'athompson@outlook.com', phone: '407-555-0206', property: '789 Winter Park Ave', date: '2026-01-12', buyerType: 'buyer55', preApproved: true, budget: '$350-400K', timeframe: '3-6 months', agent: 'none', notes: 'Downsizing from larger home. Wants single story with pool.' },
  { id: 7, name: 'David & Karen Garcia', email: 'garcias@gmail.com', phone: '407-555-0207', property: '789 Winter Park Ave', date: '2026-01-12', buyerType: 'buyer', preApproved: false, budget: 'Unknown', timeframe: 'just looking', agent: 'other', notes: 'Working with another agent but open to switching. Seemed frustrated with current service.' },
  { id: 8, name: 'Patricia Moore', email: 'pmoore@senior.net', phone: '407-555-0208', property: '123 Lakefront Dr', date: '2026-01-05', buyerType: 'buyer55', preApproved: true, budget: '$500,000 cash', timeframe: 'immediately', agent: 'none', notes: 'Cash buyer from Michigan. Wants to be near grandkids. Very serious!' },
  { id: 9, name: 'James Wilson', email: 'jwilson@invest.com', phone: '407-555-0209', property: '123 Lakefront Dr', date: '2026-01-05', buyerType: 'investor', preApproved: true, budget: '$600K', timeframe: '1-3 months', agent: 'none', notes: 'Looking for vacation rental potential. Wants numbers on rental income.' },
  { id: 10, name: 'Nancy Anderson', email: 'nanderson@email.com', phone: '407-555-0210', property: '234 Open House Lane', date: '2025-12-15', buyerType: 'buyer', preApproved: true, budget: '$380,000', timeframe: '1-3 months', agent: 'none', notes: 'Single professional, first-time buyer. Wants low maintenance yard.' }
]

export default function OpenHousePage() {
  const [visitors, setVisitors] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingVisitor, setEditingVisitor] = useState<any>(null)
  const [filterProperty, setFilterProperty] = useState('all')
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', property: '', date: new Date().toISOString().split('T')[0],
    buyerType: 'buyer', preApproved: false, budget: '', timeframe: 'just looking', agent: 'none', notes: ''
  })

  const buyerTypes = [
    { value: 'buyer', label: '🏠 Buyer', color: '#4A9B7F' },
    { value: 'buyer55', label: '🏠 Buyer 55+', color: '#4A9B7F' },
    { value: 'seller', label: '💰 Seller', color: '#6B8DD6' },
    { value: 'investor', label: '📈 Investor', color: '#9B59B6' },
    { value: 'neighbor', label: '👋 Neighbor', color: '#E67E22' },
    { value: 'agent', label: '🏢 Agent', color: '#666' }
  ]

  useEffect(() => {
    const saved = localStorage.getItem('repal_openhouse')
    if (saved) {
      const parsed = JSON.parse(saved)
      setVisitors(parsed.length > 0 ? parsed : sampleVisitors)
    } else {
      setVisitors(sampleVisitors)
    }
  }, [])

  useEffect(() => {
    if (visitors.length > 0) {
      localStorage.setItem('repal_openhouse', JSON.stringify(visitors))
    }
  }, [visitors])

  const getTypeInfo = (t: string) => buyerTypes.find(bt => bt.value === t) || buyerTypes[0]

  const properties = Array.from(new Set(visitors.map(v => v.property))).filter(Boolean)
  const filteredVisitors = visitors.filter(v => filterProperty === 'all' || v.property === filterProperty).sort((a, b) => b.date.localeCompare(a.date))

  const potentialLeads = visitors.filter(v => ['buyer', 'buyer55', 'investor'].includes(v.buyerType) && v.agent === 'none').length

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', property: '', date: new Date().toISOString().split('T')[0], buyerType: 'buyer', preApproved: false, budget: '', timeframe: 'just looking', agent: 'none', notes: '' })
    setShowForm(false)
    setEditingVisitor(null)
  }

  const openEditForm = (visitor: any) => {
    setEditingVisitor(visitor)
    setFormData({
      name: visitor.name || '',
      email: visitor.email || '',
      phone: visitor.phone || '',
      property: visitor.property || '',
      date: visitor.date || new Date().toISOString().split('T')[0],
      buyerType: visitor.buyerType || 'buyer',
      preApproved: visitor.preApproved || false,
      budget: visitor.budget || '',
      timeframe: visitor.timeframe || 'just looking',
      agent: visitor.agent || 'none',
      notes: visitor.notes || ''
    })
    setShowForm(true)
  }

  const saveVisitor = () => {
    if (editingVisitor) {
      setVisitors(visitors.map(v => v.id === editingVisitor.id ? { ...formData, id: editingVisitor.id } : v))
    } else {
      setVisitors([...visitors, { ...formData, id: Date.now() }])
    }
    resetForm()
  }

  const deleteVisitor = (id: number) => {
    if (confirm('Delete this visitor?')) setVisitors(visitors.filter(v => v.id !== id))
  }

  const convertToLead = (visitor: any) => {
    const leads = JSON.parse(localStorage.getItem('repal_leads') || '[]')
    const newLead = {
      id: Date.now(),
      name: visitor.name,
      email: visitor.email,
      phone: visitor.phone,
      type: visitor.buyerType,
      status: 'new',
      priority: visitor.preApproved ? 3 : 5,
      budget: visitor.budget,
      notes: `[Open House Lead - ${visitor.property}]\n${visitor.notes}`,
      createdAt: new Date().toISOString().split('T')[0]
    }
    localStorage.setItem('repal_leads', JSON.stringify([...leads, newLead]))
    alert(`${visitor.name} added to Lead Manager!`)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#fff', padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard" style={{ color: '#D4AF37', fontSize: '1.5rem' }}>←</Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🏡 Open House Sign-In</h1>
            <span style={{ backgroundColor: '#333', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>{visitors.length} visitors</span>
            <span style={{ backgroundColor: '#4A9B7F', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>{potentialLeads} potential leads</span>
          </div>
          <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}>+ Sign In Visitor</button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <select value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff' }}>
            <option value="all">All Properties</option>
            {properties.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filteredVisitors.map(visitor => {
            const typeInfo = getTypeInfo(visitor.buyerType)
            return (
              <div key={visitor.id} onClick={() => openEditForm(visitor)} className="group" style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{visitor.name}</span>
                      <span style={{ backgroundColor: typeInfo.color, padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>{typeInfo.label}</span>
                      {visitor.preApproved && <span style={{ backgroundColor: '#4A9B7F', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem' }}>PRE-APPROVED</span>}
                      {visitor.agent === 'none' && ['buyer', 'buyer55', 'investor'].includes(visitor.buyerType) && <span style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem' }}>POTENTIAL LEAD</span>}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#999', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      {visitor.phone && <span>📱 {visitor.phone}</span>}
                      {visitor.email && <span>✉️ {visitor.email}</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                      🏠 {visitor.property} • 📅 {new Date(visitor.date).toLocaleDateString()}
                      {visitor.budget && <span> • 💰 {visitor.budget}</span>}
                      {visitor.timeframe && <span> • ⏱️ {visitor.timeframe}</span>}
                    </div>
                    {visitor.notes && <div style={{ fontSize: '0.875rem', color: '#aaa', marginTop: '0.5rem', fontStyle: 'italic' }}>"{visitor.notes}"</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {visitor.agent === 'none' && ['buyer', 'buyer55', 'investor'].includes(visitor.buyerType) && (
                      <button onClick={(e) => { e.stopPropagation(); convertToLead(visitor) }} style={{ backgroundColor: '#4A9B7F', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem' }}>+ Add to Leads</button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); deleteVisitor(visitor.id) }} className="delete-btn" style={{ backgroundColor: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.25rem', padding: '0.5rem', opacity: 0, transition: 'opacity 0.2s' }}>🗑️</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
            <div style={{ backgroundColor: '#2a2a2a', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{editingVisitor ? '✏️ Edit Visitor' : '✍️ Visitor Sign-In'}</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input type="text" placeholder="Full Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="text" placeholder="Property Address *" value={formData.property} onChange={(e) => setFormData({ ...formData, property: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <select value={formData.buyerType} onChange={(e) => setFormData({ ...formData, buyerType: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    {buyerTypes.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                  </select>
                  <select value={formData.agent} onChange={(e) => setFormData({ ...formData, agent: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    <option value="none">No Agent</option>
                    <option value="me">Working with Me</option>
                    <option value="other">Has Other Agent</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input type="text" placeholder="Budget" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                  <select value={formData.timeframe} onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    <option value="immediately">Immediately</option>
                    <option value="1-3 months">1-3 Months</option>
                    <option value="3-6 months">3-6 Months</option>
                    <option value="6-12 months">6-12 Months</option>
                    <option value="just looking">Just Looking</option>
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.preApproved} onChange={(e) => setFormData({ ...formData, preApproved: e.target.checked })} style={{ width: '1.25rem', height: '1.25rem', accentColor: '#D4AF37' }} />
                  <span>Pre-Approved for Financing</span>
                </label>
                <textarea placeholder="Notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={resetForm} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveVisitor} disabled={!formData.name || !formData.property} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#D4AF37', color: '#000', cursor: 'pointer', fontWeight: '600', opacity: formData.name && formData.property ? 1 : 0.5 }}>{editingVisitor ? 'Save Changes' : 'Sign In'}</button>
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
