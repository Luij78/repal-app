'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const sampleCampaigns = [
  { id: 1, name: 'New Buyer Nurture', description: 'Warm up cold buyer leads with market insights and tips', audience: 'buyer', status: 'active', emails: 8, interval: 7, createdAt: '2026-01-01', subscribers: 24, opens: 156, clicks: 42 },
  { id: 2, name: '55+ Active Adult', description: 'Tailored content for retirement community buyers', audience: 'buyer55', status: 'active', emails: 6, interval: 10, createdAt: '2025-12-15', subscribers: 18, opens: 112, clicks: 38 },
  { id: 3, name: 'Investor Market Updates', description: 'Monthly market data and investment opportunities', audience: 'investor', status: 'active', emails: 12, interval: 30, createdAt: '2025-11-01', subscribers: 15, opens: 89, clicks: 67 },
  { id: 4, name: 'Seller Home Prep', description: 'Tips to maximize home value before listing', audience: 'seller', status: 'active', emails: 5, interval: 5, createdAt: '2026-01-10', subscribers: 8, opens: 34, clicks: 12 },
  { id: 5, name: 'Past Client Anniversary', description: 'Annual check-ins and market updates for past clients', audience: 'past-client', status: 'active', emails: 4, interval: 90, createdAt: '2025-10-01', subscribers: 47, opens: 203, clicks: 56 },
  { id: 6, name: 'Cold Lead Re-engagement', description: 'Win back inactive leads with special offers', audience: 'cold', status: 'paused', emails: 4, interval: 14, createdAt: '2025-09-01', subscribers: 35, opens: 48, clicks: 8 },
  { id: 7, name: 'First-Time Buyer Education', description: 'Step-by-step guide to buying your first home', audience: 'buyer', status: 'active', emails: 10, interval: 5, createdAt: '2026-01-15', subscribers: 12, opens: 67, clicks: 29 },
  { id: 8, name: 'Relocation Welcome', description: 'Area information and resources for relocating buyers', audience: 'buyer', status: 'active', emails: 6, interval: 7, createdAt: '2026-01-05', subscribers: 6, opens: 28, clicks: 15 }
]

const audiences = [
  { value: 'buyer', label: '🏠 Buyers', color: '#4A9B7F' },
  { value: 'buyer55', label: '🏠 Buyers 55+', color: '#4A9B7F' },
  { value: 'seller', label: '💰 Sellers', color: '#6B8DD6' },
  { value: 'investor', label: '📈 Investors', color: '#9B59B6' },
  { value: 'past-client', label: '⭐ Past Clients', color: '#D4AF37' },
  { value: 'cold', label: '❄️ Cold Leads', color: '#666' }
]

export default function DripCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [formData, setFormData] = useState({
    name: '', description: '', audience: 'buyer', status: 'active', emails: 6, interval: 7
  })

  useEffect(() => {
    const saved = localStorage.getItem('repal_drip')
    if (saved) {
      const parsed = JSON.parse(saved)
      setCampaigns(parsed.length > 0 ? parsed : sampleCampaigns)
    } else {
      setCampaigns(sampleCampaigns)
    }
  }, [])

  useEffect(() => {
    if (campaigns.length > 0) {
      localStorage.setItem('repal_drip', JSON.stringify(campaigns))
    }
  }, [campaigns])

  const getAudienceInfo = (aud: string) => audiences.find(a => a.value === aud) || audiences[0]

  const filteredCampaigns = campaigns.filter(c => {
    return filterStatus === 'all' || c.status === filterStatus
  })

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalSubscribers = campaigns.reduce((sum, c) => sum + (c.subscribers || 0), 0)

  const resetForm = () => {
    setFormData({ name: '', description: '', audience: 'buyer', status: 'active', emails: 6, interval: 7 })
    setShowForm(false)
    setEditingCampaign(null)
  }

  const openEditForm = (campaign: any) => {
    setEditingCampaign(campaign)
    setFormData({
      name: campaign.name || '',
      description: campaign.description || '',
      audience: campaign.audience || 'buyer',
      status: campaign.status || 'active',
      emails: campaign.emails || 6,
      interval: campaign.interval || 7
    })
    setShowForm(true)
  }

  const saveCampaign = () => {
    if (editingCampaign) {
      setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? { ...c, ...formData } : c))
    } else {
      setCampaigns([...campaigns, { ...formData, id: Date.now(), createdAt: new Date().toISOString().split('T')[0], subscribers: 0, opens: 0, clicks: 0 }])
    }
    resetForm()
  }

  const toggleStatus = (id: number) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c))
  }

  const deleteCampaign = (id: number) => {
    if (confirm('Delete this campaign?')) setCampaigns(campaigns.filter(c => c.id !== id))
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#fff', padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard" style={{ color: '#D4AF37', fontSize: '1.5rem' }}>←</Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>💧 Drip Campaigns</h1>
            <span style={{ backgroundColor: '#4A9B7F', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>{activeCampaigns} active</span>
          </div>
          <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}>+ Create Campaign</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333' }}>
            <div style={{ fontSize: '0.875rem', color: '#999' }}>Active Campaigns</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4A9B7F' }}>{activeCampaigns}</div>
          </div>
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333' }}>
            <div style={{ fontSize: '0.875rem', color: '#999' }}>Total Subscribers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6B8DD6' }}>{totalSubscribers}</div>
          </div>
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333' }}>
            <div style={{ fontSize: '0.875rem', color: '#999' }}>Total Campaigns</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{campaigns.length}</div>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff' }}>
            <option value="all">All Campaigns</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filteredCampaigns.map(campaign => {
            const audInfo = getAudienceInfo(campaign.audience)
            const openRate = campaign.opens && campaign.subscribers ? Math.round((campaign.opens / (campaign.subscribers * campaign.emails)) * 100) : 0
            const clickRate = campaign.clicks && campaign.opens ? Math.round((campaign.clicks / campaign.opens) * 100) : 0
            
            return (
              <div key={campaign.id} onClick={() => openEditForm(campaign)} className="group" style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333', cursor: 'pointer', transition: 'all 0.2s', opacity: campaign.status === 'paused' ? 0.7 : 1 }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{campaign.name}</span>
                      <span style={{ backgroundColor: audInfo.color, padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>{audInfo.label}</span>
                      <span style={{ backgroundColor: campaign.status === 'active' ? '#4A9B7F' : '#666', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', textTransform: 'uppercase' }}>{campaign.status}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem' }}>{campaign.description}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>📧 {campaign.emails} emails</span>
                      <span>⏱️ Every {campaign.interval} days</span>
                      <span>👥 {campaign.subscribers || 0} subscribers</span>
                    </div>
                    {(campaign.opens || campaign.clicks) && (
                      <div style={{ fontSize: '0.75rem', color: '#4A9B7F', marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                        <span>📬 {openRate}% open rate</span>
                        <span>🖱️ {clickRate}% click rate</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button onClick={(e) => { e.stopPropagation(); toggleStatus(campaign.id) }} style={{ backgroundColor: campaign.status === 'active' ? '#666' : '#4A9B7F', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem' }}>{campaign.status === 'active' ? '⏸️ Pause' : '▶️ Activate'}</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCampaign(campaign.id) }} className="delete-btn" style={{ backgroundColor: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.25rem', padding: '0.5rem', opacity: 0, transition: 'opacity 0.2s' }}>🗑️</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
            <div style={{ backgroundColor: '#2a2a2a', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{editingCampaign ? '✏️ Edit Campaign' : '➕ Create Drip Campaign'}</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input type="text" placeholder="Campaign Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                <textarea placeholder="Description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', resize: 'vertical' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <select value={formData.audience} onChange={(e) => setFormData({ ...formData, audience: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    {audiences.map(aud => <option key={aud.value} value={aud.value}>{aud.label}</option>)}
                  </select>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#999' }}>Number of Emails</label>
                    <input type="number" min="1" value={formData.emails} onChange={(e) => setFormData({ ...formData, emails: parseInt(e.target.value) || 1 })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#999' }}>Days Between Emails</label>
                    <input type="number" min="1" value={formData.interval} onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) || 1 })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={resetForm} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveCampaign} disabled={!formData.name} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#D4AF37', color: '#000', cursor: 'pointer', fontWeight: '600', opacity: formData.name ? 1 : 0.5 }}>{editingCampaign ? 'Save Changes' : 'Create Campaign'}</button>
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
