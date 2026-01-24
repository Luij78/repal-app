'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DripPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '', type: 'buyer', emails: [{ day: 1, subject: '', content: '' }]
  })

  const campaignTypes = [
    { id: 'buyer', name: 'New Buyer', icon: '🏠', desc: 'Nurture new buyer leads' },
    { id: 'seller', name: 'New Seller', icon: '🏷️', desc: 'Convert seller leads' },
    { id: 'past-client', name: 'Past Client', icon: '🤝', desc: 'Stay in touch for referrals' },
    { id: 'sphere', name: 'Sphere of Influence', icon: '👥', desc: 'Nurture your network' },
    { id: 'open-house', name: 'Open House Follow Up', icon: '🏡', desc: 'Convert visitors to clients' },
  ]

  const defaultCampaigns = [
    {
      id: 1, name: 'New Buyer Welcome', type: 'buyer', active: true, leads: 12,
      emails: [
        { day: 1, subject: 'Welcome! Let\'s Find Your Dream Home', content: 'Hi [Name], excited to help you find your perfect home...' },
        { day: 3, subject: 'Understanding the Buying Process', content: 'Hi [Name], here\'s what to expect when buying a home...' },
        { day: 7, subject: 'Pre-Approval: Your First Step', content: 'Hi [Name], getting pre-approved is crucial...' },
      ]
    },
    {
      id: 2, name: 'Past Client Nurture', type: 'past-client', active: true, leads: 45,
      emails: [
        { day: 30, subject: 'Checking In!', content: 'Hi [Name], how\'s the new home treating you?' },
        { day: 90, subject: 'Home Maintenance Tips', content: 'Hi [Name], here are some seasonal maintenance tips...' },
        { day: 180, subject: 'Market Update for Your Area', content: 'Hi [Name], home values in your area have...' },
      ]
    },
  ]

  useEffect(() => {
    const saved = localStorage.getItem('repal_drip_campaigns')
    if (saved) {
      setCampaigns(JSON.parse(saved))
    } else {
      setCampaigns(defaultCampaigns)
      localStorage.setItem('repal_drip_campaigns', JSON.stringify(defaultCampaigns))
    }
  }, [])

  useEffect(() => {
    if (campaigns.length > 0) {
      localStorage.setItem('repal_drip_campaigns', JSON.stringify(campaigns))
    }
  }, [campaigns])

  const saveCampaign = () => {
    if (!formData.name) return alert('Please enter campaign name')
    setCampaigns([...campaigns, { ...formData, id: Date.now(), active: false, leads: 0 }])
    setFormData({ name: '', type: 'buyer', emails: [{ day: 1, subject: '', content: '' }] })
    setShowForm(false)
  }

  const toggleCampaign = (id: number) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, active: !c.active } : c))
  }

  const deleteCampaign = (id: number) => {
    if (confirm('Delete this campaign?')) setCampaigns(campaigns.filter(c => c.id !== id))
  }

  const addEmail = () => {
    const lastDay = formData.emails.length > 0 ? formData.emails[formData.emails.length - 1].day : 0
    setFormData({ ...formData, emails: [...formData.emails, { day: lastDay + 7, subject: '', content: '' }] })
  }

  const updateEmail = (idx: number, field: string, value: any) => {
    const newEmails = [...formData.emails]
    newEmails[idx] = { ...newEmails[idx], [field]: value }
    setFormData({ ...formData, emails: newEmails })
  }

  const removeEmail = (idx: number) => {
    setFormData({ ...formData, emails: formData.emails.filter((_, i) => i !== idx) })
  }

  const getTypeIcon = (typeId: string) => campaignTypes.find(t => t.id === typeId)?.icon || '📧'

  const totalLeads = campaigns.reduce((sum, c) => sum + (c.leads || 0), 0)
  const activeCampaigns = campaigns.filter(c => c.active).length

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">📧 Drip Campaigns</h1>
          <p className="text-gray-400 text-sm">Automated email sequences to nurture leads</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ Create Campaign</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-white">{campaigns.length}</span>
          <p className="text-xs text-gray-400 mt-1">Total Campaigns</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-[#4A9B7F]">{activeCampaigns}</span>
          <p className="text-xs text-gray-400 mt-1">Active</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-primary-400">{totalLeads}</span>
          <p className="text-xs text-gray-400 mt-1">Leads Enrolled</p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📧</span>
            <p className="text-gray-400">No campaigns yet. Create your first drip campaign!</p>
          </div>
        ) : (
          campaigns.map(campaign => (
            <div key={campaign.id} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-5 border border-dark-border">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                  <div>
                    <h3 className="font-medium text-white">{campaign.name}</h3>
                    <p className="text-sm text-gray-400">{campaign.emails?.length || 0} emails • {campaign.leads || 0} leads enrolled</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCampaign(campaign.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${campaign.active ? 'bg-[#4A9B7F] text-white' : 'bg-dark-border text-gray-400'}`}
                  >
                    {campaign.active ? '✓ Active' : 'Paused'}
                  </button>
                  <button onClick={() => deleteCampaign(campaign.id)} className="text-gray-500 hover:text-[#E74C3C] transition-colors">🗑️</button>
                </div>
              </div>

              {/* Email Timeline */}
              <div className="flex gap-2 flex-wrap">
                {campaign.emails?.map((email: any, idx: number) => (
                  <div key={idx} className="px-3 py-2 bg-[#0D0D0D] rounded-lg text-sm">
                    <span className="text-primary-400 font-semibold">Day {email.day}</span>
                    <span className="text-gray-500 ml-2">{email.subject?.substring(0, 30)}...</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Campaign Type Cards */}
      <div className="mt-8">
        <h3 className="text-white font-semibold mb-4">Campaign Templates</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaignTypes.map(type => (
            <button
              key={type.id}
              onClick={() => { setFormData({ ...formData, type: type.id }); setShowForm(true) }}
              className="p-4 bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl border border-dark-border hover:border-primary-500/30 text-left transition-all"
            >
              <span className="text-2xl mb-2 block">{type.icon}</span>
              <h4 className="text-white font-medium text-sm">{type.name}</h4>
              <p className="text-xs text-gray-500">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-2xl w-full border border-dark-border my-8">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">Create Drip Campaign</h2>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Campaign Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., New Buyer Welcome" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Campaign Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                    {campaignTypes.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Email Sequence */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Email Sequence</label>
                  <button type="button" onClick={addEmail} className="text-sm text-primary-400 hover:text-primary-300">+ Add Email</button>
                </div>
                <div className="space-y-3">
                  {formData.emails.map((email, idx) => (
                    <div key={idx} className="p-4 bg-[#0D0D0D] rounded-lg border border-dark-border">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-primary-400 font-semibold">Email {idx + 1}</span>
                          <input type="number" value={email.day} onChange={(e) => updateEmail(idx, 'day', parseInt(e.target.value))} className="w-20 px-2 py-1 bg-dark-card border border-dark-border rounded text-white text-sm" />
                          <span className="text-xs text-gray-500">days after signup</span>
                        </div>
                        {formData.emails.length > 1 && (
                          <button onClick={() => removeEmail(idx)} className="text-gray-500 hover:text-[#E74C3C]">✕</button>
                        )}
                      </div>
                      <input type="text" value={email.subject} onChange={(e) => updateEmail(idx, 'subject', e.target.value)} placeholder="Subject line" className="w-full px-3 py-2 mb-2 bg-dark-card border border-dark-border rounded-lg text-white text-sm outline-none focus:border-primary-500" />
                      <textarea value={email.content} onChange={(e) => updateEmail(idx, 'content', e.target.value)} placeholder="Email content..." className="w-full px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-white text-sm outline-none focus:border-primary-500 resize-y min-h-[60px]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button onClick={() => { setShowForm(false); setFormData({ name: '', type: 'buyer', emails: [{ day: 1, subject: '', content: '' }] }) }} className="px-6 py-3 text-sm font-semibold text-gray-400 border border-dark-border rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={saveCampaign} className="px-6 py-3 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">Create Campaign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
