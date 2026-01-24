'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [formData, setFormData] = useState({ title: '', category: 'follow-up', content: '' })

  const categories = [
    { id: 'follow-up', name: 'Follow Up', icon: '📞' },
    { id: 'greeting', name: 'Greeting', icon: '👋' },
    { id: 'listing', name: 'Listing', icon: '🏠' },
    { id: 'showing', name: 'Showing', icon: '🔑' },
    { id: 'offer', name: 'Offer', icon: '📝' },
    { id: 'closing', name: 'Closing', icon: '🎉' },
    { id: 'marketing', name: 'Marketing', icon: '📢' },
    { id: 'other', name: 'Other', icon: '📋' }
  ]

  const defaultTemplates = [
    { id: 1, title: 'New Lead Greeting', category: 'greeting', content: 'Hi [Name]! Thanks for reaching out about real estate. I\'d love to learn more about what you\'re looking for. When would be a good time for a quick call?' },
    { id: 2, title: 'Showing Follow Up', category: 'showing', content: 'Hi [Name]! I hope you enjoyed the showing today. What did you think of the property? I\'d love to hear your thoughts and answer any questions you might have.' },
    { id: 3, title: 'Listing Appointment Confirm', category: 'listing', content: 'Hi [Name]! Just confirming our listing appointment for [Date] at [Time]. Looking forward to discussing how we can get your home sold quickly and for top dollar!' },
    { id: 4, title: 'Offer Submitted', category: 'offer', content: 'Great news! I just submitted your offer on [Address]. I\'ll keep you updated as soon as I hear back from the listing agent. Fingers crossed! 🤞' },
    { id: 5, title: 'Weekly Market Update', category: 'marketing', content: 'Hi [Name]! Quick market update: [X] new listings hit the market this week in your target area. Would you like me to send you the details on any that catch your eye?' },
  ]

  useEffect(() => {
    const saved = localStorage.getItem('repal_templates')
    if (saved) {
      setTemplates(JSON.parse(saved))
    } else {
      setTemplates(defaultTemplates)
      localStorage.setItem('repal_templates', JSON.stringify(defaultTemplates))
    }
  }, [])

  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem('repal_templates', JSON.stringify(templates))
    }
  }, [templates])

  const saveTemplate = () => {
    if (!formData.title || !formData.content) return alert('Please enter title and content')
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...formData, id: editingTemplate.id } : t))
    } else {
      setTemplates([...templates, { ...formData, id: Date.now() }])
    }
    resetForm()
  }

  const deleteTemplate = (id: number) => {
    if (confirm('Delete this template?')) setTemplates(templates.filter(t => t.id !== id))
  }

  const resetForm = () => {
    setFormData({ title: '', category: 'follow-up', content: '' })
    setEditingTemplate(null)
    setShowForm(false)
  }

  const openEditForm = (template: any) => {
    setEditingTemplate(template)
    setFormData(template)
    setShowForm(true)
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    alert('Copied to clipboard!')
  }

  const filteredTemplates = filterCategory === 'all' ? templates : templates.filter(t => t.category === filterCategory)

  const getCategoryIcon = (catId: string) => categories.find(c => c.id === catId)?.icon || '📋'

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">⚡ Quick Reply Templates</h1>
          <p className="text-gray-400 text-sm">Save time with pre-written message templates</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="px-5 py-2.5 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">+ Add Template</button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap overflow-x-auto pb-2">
        <button onClick={() => setFilterCategory('all')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filterCategory === 'all' ? 'bg-primary-500 text-dark-bg' : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'}`}>
          All
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setFilterCategory(cat.id)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filterCategory === cat.id ? 'bg-primary-500 text-dark-bg' : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'}`}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <span className="text-5xl mb-4 block">⚡</span>
            <p className="text-gray-400">No templates yet. Create your first quick reply!</p>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div 
              key={template.id} 
              onClick={() => openEditForm(template)}
              className="group bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-5 border border-dark-border hover:border-primary-500/30 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary-500/5"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getCategoryIcon(template.category)}</span>
                  <h3 className="font-medium text-white">{template.title}</h3>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id) }} className="text-gray-500 hover:text-[#E74C3C] transition-colors opacity-0 group-hover:opacity-100">🗑️</button>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">{template.content}</p>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); copyToClipboard(template.content) }} className="flex-1 py-2 bg-[#4ECDC4]/20 text-[#4ECDC4] rounded-lg text-sm font-semibold hover:bg-[#4ECDC4]/30 transition-colors">
                  📋 Copy
                </button>
                <button onClick={(e) => e.stopPropagation()} className="flex-1 py-2 bg-[#6B8DD6]/20 text-[#6B8DD6] rounded-lg text-sm font-semibold hover:bg-[#6B8DD6]/30 transition-colors">
                  💬 Use
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Template Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 max-w-lg w-full border border-dark-border">
            <h2 className="font-playfair text-xl text-primary-400 mb-6">{editingTemplate ? '✏️ Edit Template' : '➕ Create Template'}</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Template Name *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Follow Up After Showing" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white cursor-pointer">
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Message Content *</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Use [Name], [Address], [Date], [Time] as placeholders..." className="w-full min-h-[150px] px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500 resize-y" />
                <p className="text-xs text-gray-500 mt-2">💡 Tip: Use [brackets] for placeholders like [Name], [Address], [Date]</p>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button onClick={resetForm} className="px-6 py-3 text-sm font-semibold text-gray-400 border border-dark-border rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={saveTemplate} className="px-6 py-3 text-sm font-semibold bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-400 transition-colors">{editingTemplate ? 'Save Changes' : 'Save Template'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
