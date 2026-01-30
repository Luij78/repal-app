'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'

interface Template {
  id: string
  user_id: string
  name: string
  category: string
  message: string
  created_at: string
}

const categories = [
  { value: 'greeting', label: '👋 Greeting', color: '#3498DB' },
  { value: 'followup', label: '📞 Follow-up', color: '#4A9B7F' },
  { value: 'showing', label: '🏠 Showing', color: '#9B59B6' },
  { value: 'offer', label: '📝 Offer', color: '#E67E22' },
  { value: 'closing', label: '🔑 Closing', color: '#D4AF37' },
  { value: 'marketing', label: '📢 Marketing', color: '#E74C3C' },
  { value: 'thank-you', label: '🙏 Thank You', color: '#2ECC71' },
  { value: 'other', label: '📋 Other', color: '#666' }
]

const defaultTemplates = [
  { name: 'New Lead Intro', category: 'greeting', message: "Hi {name}! 👋 This is Luis Garcia with [Brokerage]. I saw you're interested in {area} properties. I'd love to help you find the perfect home! When would be a good time for a quick call?" },
  { name: 'Showing Confirmation', category: 'showing', message: "Hi {name}! Just confirming our showing tomorrow at {time} for {address}. I'll meet you there! Let me know if anything changes. 🏠" },
  { name: 'After Showing', category: 'followup', message: "Hi {name}! Thanks for touring {address} today! What did you think? I have a few more properties that might interest you. Let me know if you'd like to see them! 🏡" },
  { name: 'Weekly Check-in', category: 'followup', message: "Hey {name}! Just checking in on your home search. Any changes to what you're looking for? New listings are coming up and I want to make sure you don't miss anything! 📱" },
  { name: 'Offer Submitted', category: 'offer', message: "Great news {name}! 🎉 I just submitted your offer on {address}. I'll keep you posted as soon as I hear back from the seller's agent. Fingers crossed! 🤞" },
  { name: 'Under Contract', category: 'closing', message: "🎊 Congratulations {name}! Your offer was ACCEPTED! We're officially under contract on {address}. I'll send over the timeline and next steps shortly. Exciting times ahead!" },
  { name: 'Closing Day', category: 'closing', message: "It's closing day {name}! 🔑🎉 Can't wait to hand you the keys to your new home at {address}. See you at {time}!" },
  { name: 'Thank You - Closed', category: 'thank-you', message: "Hi {name}! Congratulations again on your new home! 🏠 It was an absolute pleasure working with you. If you know anyone looking to buy or sell, I'd love to help them too! Here's to new beginnings! 🥂" },
  { name: 'Market Update', category: 'marketing', message: "Hi {name}! Quick market update: {area} is seeing {trend}. Your home could be worth more than you think! Would you like a free home valuation? 📊" },
  { name: 'Birthday', category: 'other', message: "Happy Birthday {name}! 🎂🎉 Wishing you an amazing day filled with joy. Hope this year brings you everything you're looking for! 🎈" }
]

export default function TemplatesPage() {
  const { user } = useUser()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'greeting',
    message: ''
  })

  const supabase = createClient()

  useEffect(() => {
    if (user) fetchTemplates()
  }, [user])

  const fetchTemplates = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('quick_reply_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('category', { ascending: true })

    if (error) {
      console.error('Error fetching templates:', error)
    } else {
      setTemplates(data || [])
    }
    setLoading(false)
  }

  const getCategoryInfo = (cat: string) => categories.find(c => c.value === cat) || categories[categories.length - 1]

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'greeting',
      message: ''
    })
    setEditingTemplate(null)
    setShowForm(false)
  }

  const openEditForm = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      category: template.category,
      message: template.message
    })
    setShowForm(true)
  }

  const saveTemplate = async () => {
    if (!user || !formData.name.trim() || !formData.message.trim()) return

    const templateData = {
      user_id: user.id,
      name: formData.name,
      category: formData.category,
      message: formData.message
    }

    if (editingTemplate) {
      const { error } = await supabase
        .from('quick_reply_templates')
        .update(templateData)
        .eq('id', editingTemplate.id)

      if (error) {
        console.error('Error updating template:', error)
      } else {
        setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...templateData } : t))
        resetForm()
      }
    } else {
      const { data, error } = await supabase
        .from('quick_reply_templates')
        .insert(templateData)
        .select()
        .single()

      if (error) {
        console.error('Error adding template:', error)
      } else if (data) {
        setTemplates([...templates, data])
        resetForm()
      }
    }
  }

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Delete this template?')) return

    const { error } = await supabase
      .from('quick_reply_templates')
      .delete()
      .eq('id', templateId)

    if (error) {
      console.error('Error deleting template:', error)
    } else {
      setTemplates(templates.filter(t => t.id !== templateId))
    }
  }

  const copyToClipboard = async (message: string, id: string) => {
    try {
      await navigator.clipboard.writeText(message)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const addDefaultTemplates = async () => {
    if (!user) return
    
    const templatesWithUserId = defaultTemplates.map(t => ({
      ...t,
      user_id: user.id
    }))

    const { data, error } = await supabase
      .from('quick_reply_templates')
      .insert(templatesWithUserId)
      .select()

    if (error) {
      console.error('Error adding default templates:', error)
    } else if (data) {
      setTemplates([...templates, ...data])
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.message.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Group templates by category
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const cat = template.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(template)
    return acc
  }, {} as Record<string, Template[]>)

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">⚡ Quick Replies</h1>
          <p className="text-gray-400">One-tap message templates</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> Add Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field flex-1"
        />
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
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">⚡</span>
          <p className="text-gray-400 mb-4">
            {searchTerm || filterCategory !== 'all' ? 'No templates match your search' : 'No templates yet'}
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setShowForm(true)} className="btn-secondary">
                Create Your Own
              </button>
              <button onClick={addDefaultTemplates} className="btn-primary">
                Add Starter Templates
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
            const catInfo = getCategoryInfo(category)
            return (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: catInfo.color }}>
                  {catInfo.label}
                </h3>
                <div className="grid gap-3">
                  {categoryTemplates.map(template => (
                    <div key={template.id} className="card group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white mb-2">{template.name}</h4>
                          <p className="text-gray-400 text-sm whitespace-pre-wrap line-clamp-3">
                            {template.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyToClipboard(template.message, template.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              copiedId === template.id 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-dark-border text-gray-400 hover:text-white'
                            }`}
                            title="Copy to clipboard"
                          >
                            {copiedId === template.id ? '✓' : '📋'}
                          </button>
                          <button
                            onClick={() => openEditForm(template)}
                            className="p-2 bg-dark-border text-gray-400 hover:text-white rounded-lg transition-colors"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="p-2 bg-dark-border text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      {/* Quick Copy Button - always visible on mobile */}
                      <button
                        onClick={() => copyToClipboard(template.message, template.id)}
                        className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors sm:hidden ${
                          copiedId === template.id 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-primary-500/20 text-primary-500'
                        }`}
                      >
                        {copiedId === template.id ? '✓ Copied!' : '📋 Copy Message'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Variables Help */}
      {templates.length > 0 && (
        <div className="mt-8 card bg-dark-bg/50">
          <h4 className="text-white font-semibold mb-2">💡 Template Variables</h4>
          <p className="text-gray-400 text-sm mb-3">
            Use these placeholders in your templates and replace them when sending:
          </p>
          <div className="flex flex-wrap gap-2">
            {['{name}', '{address}', '{area}', '{time}', '{date}', '{price}', '{trend}'].map(v => (
              <code key={v} className="px-2 py-1 bg-dark-border rounded text-primary-500 text-sm">{v}</code>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-card">
              <h2 className="text-xl font-bold text-white">{editingTemplate ? 'Edit Template' : 'Add Template'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Follow-up After Showing"
                />
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
                <label className="block text-gray-400 text-sm mb-1">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-field w-full"
                  rows={6}
                  placeholder="Hi {name}! Thanks for..."
                />
                <p className="text-gray-500 text-xs mt-1">
                  Tip: Use {'{name}'}, {'{address}'}, {'{time}'} as placeholders
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-dark-border flex gap-3 sticky bottom-0 bg-dark-card">
              <button onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
              <button 
                onClick={saveTemplate} 
                className="btn-primary flex-1"
                disabled={!formData.name.trim() || !formData.message.trim()}
              >
                {editingTemplate ? 'Save Changes' : 'Add Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
