'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const sampleTemplates = [
  { id: 1, name: 'New Lead Welcome', category: 'text', subject: '', content: 'Hi {name}! Thanks for reaching out about finding your perfect home. I\'m excited to help you on this journey! When would be a good time to chat about what you\'re looking for? I\'m available for a quick call today or tomorrow. - {agent}', tags: ['first-contact', 'buyer'] },
  { id: 2, name: 'Showing Follow-Up', category: 'text', subject: '', content: 'Hi {name}! Great meeting you today at {property}. I loved showing you around! What were your thoughts on the home? Any questions I can answer? Let me know if you\'d like to schedule another viewing or see similar properties. - {agent}', tags: ['showing', 'follow-up'] },
  { id: 3, name: 'Listing Presentation Confirmation', category: 'email', subject: 'Looking forward to meeting you!', content: 'Hi {name},\n\nI\'m excited to meet with you on {date} to discuss selling your home at {property}.\n\nI\'ll bring a comprehensive market analysis and marketing plan tailored specifically for your property.\n\nPlease have the following ready if possible:\n- Any recent repairs or upgrades\n- Original purchase documents\n- HOA information (if applicable)\n\nSee you soon!\n\nBest,\n{agent}', tags: ['listing', 'seller'] },
  { id: 4, name: 'Price Reduction Discussion', category: 'email', subject: 'Market Update for {property}', content: 'Hi {name},\n\nI wanted to touch base about your listing at {property}. We\'ve had good showing activity, but the feedback suggests buyers are comparing to other homes in a slightly lower price range.\n\nBased on recent market data and comparable sales, I\'d like to discuss a strategic price adjustment to increase buyer interest.\n\nCan we schedule a quick call to review the numbers together?\n\nBest,\n{agent}', tags: ['listing', 'seller', 'price'] },
  { id: 5, name: 'Offer Submitted', category: 'text', subject: '', content: 'Great news {name}! 🎉 I just submitted your offer on {property}. The listing agent confirmed receipt and said the sellers will review tonight. I\'ll call you as soon as I hear back. Fingers crossed! - {agent}', tags: ['offer', 'buyer'] },
  { id: 6, name: 'Under Contract Celebration', category: 'email', subject: 'Congratulations - You\'re Under Contract! 🎉', content: 'Hi {name},\n\nWONDERFUL NEWS! Your offer on {property} has been accepted!\n\nHere\'s what happens next:\n\n📅 Important Dates:\n- Inspection: Schedule within 10 days\n- Appraisal: Lender will order this week\n- Closing: {closing_date}\n\n📋 Action Items:\n1. Send earnest money deposit to title company\n2. Schedule home inspection\n3. Forward homeowners insurance quote to lender\n\nI\'ll be with you every step of the way. Congratulations on this exciting milestone!\n\nBest,\n{agent}', tags: ['contract', 'buyer', 'milestone'] },
  { id: 7, name: 'Closing Reminder', category: 'text', subject: '', content: 'Hi {name}! 🔑 Just a reminder - closing is scheduled for {date} at {time}. Don\'t forget to bring your ID and any remaining funds (cashier\'s check or wire). Can\'t wait to hand you those keys! - {agent}', tags: ['closing', 'reminder'] },
  { id: 8, name: 'Anniversary Check-In', category: 'email', subject: 'Happy Home Anniversary! 🏠', content: 'Hi {name},\n\nHappy Home Anniversary! 🎉 Can you believe it\'s been a year since you got the keys to {property}?\n\nI hope you\'ve been enjoying your home and creating wonderful memories there.\n\nIf you ever need recommendations for home services, have questions about the market, or know anyone looking to buy or sell, I\'m always here to help!\n\nWishing you many more happy years in your home.\n\nWarmly,\n{agent}', tags: ['anniversary', 'past-client', 'nurture'] },
  { id: 9, name: 'Market Update', category: 'email', subject: 'Your {area} Market Update', content: 'Hi {name},\n\nHere\'s what\'s happening in the {area} real estate market:\n\n📊 This Month\'s Stats:\n- Median Price: ${median_price}\n- Days on Market: {dom} days\n- Active Listings: {active}\n\n🏠 What This Means for You:\n{market_insight}\n\nInterested in knowing your home\'s current value? I\'d be happy to provide a complimentary market analysis.\n\nBest,\n{agent}', tags: ['market-update', 'nurture'] },
  { id: 10, name: '55+ Community Info', category: 'email', subject: 'Active Adult Communities in Florida', content: 'Hi {name},\n\nThank you for your interest in 55+ communities! Here are some top options I recommend:\n\n🏌️ Golf Communities:\n- Solivita - Poinciana\n- Del Webb - Daytona Beach\n\n🎾 Active Lifestyle:\n- On Top of the World - Ocala\n- The Villages\n\nI specialize in helping buyers find the perfect active adult community. Would you like to schedule tours?\n\nBest,\n{agent}', tags: ['55+', 'buyer', 'community'] },
  { id: 11, name: 'Investor Property Analysis', category: 'email', subject: 'Investment Property Analysis: {property}', content: 'Hi {name},\n\nHere\'s the analysis for {property}:\n\n💰 Financials:\n- Purchase Price: ${price}\n- Estimated Rent: ${rent}/month\n- Cap Rate: {cap_rate}%\n- Cash-on-Cash: {coc}%\n\n📊 Comparable Rents in Area: ${comp_rent}/month\n\nI can provide more detailed numbers including expenses, insurance estimates, and property management costs.\n\nWant to discuss this opportunity?\n\nBest,\n{agent}', tags: ['investor', 'analysis'] },
  { id: 12, name: 'Referral Thank You', category: 'text', subject: '', content: 'Hi {name}! I just wanted to say THANK YOU for referring {referral_name} to me! 🙏 Referrals from clients like you mean the world to me. I promise to take great care of them! - {agent}', tags: ['referral', 'thank-you'] }
]

const categories = [
  { value: 'text', label: '💬 Text/SMS', color: '#4A9B7F' },
  { value: 'email', label: '📧 Email', color: '#6B8DD6' },
  { value: 'script', label: '📞 Phone Script', color: '#9B59B6' }
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '', category: 'text', subject: '', content: '', tags: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('repal_templates')
    if (saved) {
      const parsed = JSON.parse(saved)
      setTemplates(parsed.length > 0 ? parsed : sampleTemplates)
    } else {
      setTemplates(sampleTemplates)
    }
  }, [])

  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem('repal_templates', JSON.stringify(templates))
    }
  }, [templates])

  const getCategoryInfo = (cat: string) => categories.find(c => c.value === cat) || categories[0]

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const resetForm = () => {
    setFormData({ name: '', category: 'text', subject: '', content: '', tags: '' })
    setShowForm(false)
    setEditingTemplate(null)
  }

  const openEditForm = (template: any) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name || '',
      category: template.category || 'text',
      subject: template.subject || '',
      content: template.content || '',
      tags: template.tags?.join(', ') || ''
    })
    setShowForm(true)
  }

  const saveTemplate = () => {
    const templateData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    }
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...templateData, id: editingTemplate.id } : t))
    } else {
      setTemplates([...templates, { ...templateData, id: Date.now() }])
    }
    resetForm()
  }

  const deleteTemplate = (id: number) => {
    if (confirm('Delete this template?')) setTemplates(templates.filter(t => t.id !== id))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#fff', padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard" style={{ color: '#D4AF37', fontSize: '1.5rem' }}>←</Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📝 Quick Reply Templates</h1>
            <span style={{ backgroundColor: '#333', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem' }}>{templates.length} templates</span>
          </div>
          <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#D4AF37', color: '#000', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600' }}>+ Create Template</button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, minWidth: '200px', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff' }} />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff' }}>
            <option value="all">All Types</option>
            {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filteredTemplates.map(template => {
            const catInfo = getCategoryInfo(template.category)
            return (
              <div key={template.id} onClick={() => openEditForm(template)} className="group" style={{ backgroundColor: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #333', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600' }}>{template.name}</span>
                      <span style={{ backgroundColor: catInfo.color, padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>{catInfo.label}</span>
                    </div>
                    {template.subject && <div style={{ fontSize: '0.875rem', color: '#D4AF37', marginBottom: '0.25rem' }}>Subject: {template.subject}</div>}
                    <div style={{ fontSize: '0.875rem', color: '#999', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{template.content}</div>
                    {template.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {template.tags.map((tag: string) => (
                          <span key={tag} style={{ backgroundColor: '#333', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', color: '#999' }}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button onClick={(e) => { e.stopPropagation(); copyToClipboard(template.content) }} style={{ backgroundColor: '#4A9B7F', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem' }}>📋 Copy</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id) }} className="delete-btn" style={{ backgroundColor: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.25rem', padding: '0.5rem', opacity: 0, transition: 'opacity 0.2s' }}>🗑️</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
            <div style={{ backgroundColor: '#2a2a2a', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{editingTemplate ? '✏️ Edit Template' : '➕ Create Template'}</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input type="text" placeholder="Template Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', width: '100%' }} />
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }}>
                  {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
                {formData.category === 'email' && (
                  <input type="text" placeholder="Subject Line" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                )}
                <textarea placeholder="Template Content *&#10;&#10;Use variables like {name}, {property}, {agent}, {date}" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={8} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff', resize: 'vertical', fontFamily: 'inherit' }} />
                <input type="text" placeholder="Tags (comma separated)" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={resetForm} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={saveTemplate} disabled={!formData.name || !formData.content} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#D4AF37', color: '#000', cursor: 'pointer', fontWeight: '600', opacity: formData.name && formData.content ? 1 : 0.5 }}>{editingTemplate ? 'Save Changes' : 'Create Template'}</button>
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
