'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/types/database'

const priorityDescriptions: Record<number, string> = {
  1: '🔥 Buying in 1-2 months',
  2: '🔥 Very Hot - Actively looking',
  3: '🔥 Hot - Serious buyer',
  4: '☀️ Warm - Interested',
  5: '☀️ Moderate - Considering',
  6: '☀️ Lukewarm - Future buyer (6+ months)',
  7: '❄️ Cool - Just browsing',
  8: '❄️ Cold - Not ready yet',
  9: '❄️ Very Cold - Long term',
  10: '❄️ Coldest - Unresponsive'
}

// Brivity-style Status options
const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'unqualified', label: 'Unqualified', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'hot', label: 'Hot', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'nurture', label: 'Nurture', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'watch', label: 'Watch', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'pending', label: 'Pending', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'past_client', label: 'Past Client', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-600/20 text-gray-500 border-gray-600/30' },
]

const statusColors: Record<string, string> = {
  // New Brivity-style statuses
  ...Object.fromEntries(statusOptions.map(s => [s.value, s.color])),
  // Legacy statuses (for existing leads)
  contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  qualified: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  negotiating: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  closed: 'bg-green-500/20 text-green-400 border-green-500/30',
  lost: 'bg-red-500/20 text-red-400 border-red-500/30',
}

// Brivity-style Stage options  
const stageOptions = [
  { value: 'new_lead', label: 'New Lead' },
  { value: 'attempted_contact', label: 'Attempted Contact' },
  { value: 'spoke_with_customer', label: 'Spoke with Customer' },
  { value: 'appointment_set', label: 'Appointment Set' },
  { value: 'met_with_customer', label: 'Met with Customer' },
  { value: 'showing_homes', label: 'Showing Homes' },
  { value: 'listing_agreement', label: 'Listing Agreement' },
  { value: 'active_listing', label: 'Active Listing' },
  { value: 'submitting_offers', label: 'Submitting Offers' },
  { value: 'under_contract', label: 'Under Contract' },
  { value: 'sale_closed', label: 'Sale Closed' },
  { value: 'nurture', label: 'Nurture' },
  { value: 'rejected', label: 'Rejected' },
]

// Brivity-style Intent options
const intentOptions = [
  { value: 'buyer', label: 'Buyer', icon: '🏠' },
  { value: 'seller', label: 'Seller', icon: '💰' },
  { value: 'seller_buyer', label: 'Seller/Buyer', icon: '🔄' },
  { value: 'tenant', label: 'Tenant', icon: '🔑' },
  { value: 'landlord', label: 'Landlord', icon: '🏢' },
  { value: 'na', label: 'N/A', icon: '➖' },
]

// Brivity-style Source options
const sourceOptions = [
  { value: 'manual', label: 'Manual Entry' },
  { value: 'realtor_com', label: 'Realtor.com' },
  { value: 'zillow', label: 'Zillow' },
  { value: 'trulia', label: 'Trulia' },
  { value: 'redfin', label: 'Redfin' },
  { value: 'friend_family', label: 'Friend or Family' },
  { value: 'sphere', label: 'Sphere of Influence' },
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'open_house', label: 'Open House' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'other', label: 'Other' },
]

// Combined type labels (old + new intent options)
const typeLabels: Record<string, { label: string; icon: string }> = {
  // New Brivity-style intents
  buyer: { label: 'Buyer', icon: '🏠' },
  seller: { label: 'Seller', icon: '💰' },
  seller_buyer: { label: 'Seller/Buyer', icon: '🔄' },
  tenant: { label: 'Tenant', icon: '🔑' },
  landlord: { label: 'Landlord', icon: '🏢' },
  na: { label: 'N/A', icon: '➖' },
  // Legacy types (for existing leads)
  buyer55: { label: 'Buyer 55+', icon: '🏡' },
  investor: { label: 'Investor', icon: '📈' },
  renter: { label: 'Renter', icon: '🔑' },
  both: { label: 'Buyer/Seller', icon: '🔄' },
}

const getPriorityColor = (p: number) => {
  if (p <= 3) return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' }
  if (p <= 6) return { bg: 'bg-primary-500/20', text: 'text-primary-500', border: 'border-primary-500/30' }
  return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
}

const getPriorityEmoji = (p: number) => {
  if (p <= 3) return '🔥'
  if (p <= 6) return '☀️'
  return '❄️'
}

// Get initials from name
const getInitials = (name: string) => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// Format currency
const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return null
  return '$' + amount.toLocaleString()
}

// Speech-to-text hook
function useSpeechToText() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const toggleListening = useCallback(() => {
    if (!isSupported) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript)
        }
      }

      recognitionRef.current.onerror = () => setIsListening(false)
      recognitionRef.current.onend = () => setIsListening(false)

      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening, isSupported])

  return { isListening, transcript, isSupported, toggleListening, setTranscript }
}

export default function LeadsPage() {
  const { user } = useUser()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterFollowupToday, setFilterFollowupToday] = useState(false)
  const [showDetailFields, setShowDetailFields] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [viewTab, setViewTab] = useState<'overview' | 'activity' | 'tasks'>('overview')
  const [importStatus, setImportStatus] = useState('')
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null)
  const [inlineNotes, setInlineNotes] = useState('')
  const [inlinePriority, setInlinePriority] = useState(5)
  const notesScrollRef = useRef<HTMLDivElement>(null)
  const editNotesRef = useRef<HTMLTextAreaElement>(null)
  const editModalRef = useRef<HTMLDivElement>(null)
  
  // Timeline notes state
  const [leadNotes, setLeadNotes] = useState<any[]>([])
  const [newNoteContent, setNewNoteContent] = useState('')
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteContent, setEditingNoteContent] = useState('')
  const [noteMenuOpen, setNoteMenuOpen] = useState<string | null>(null)
  
  const { isListening, transcript, isSupported, toggleListening, setTranscript } = useSpeechToText()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailPersonal: '',
    emailWork: '',
    phoneMobile: '',
    phoneHome: '',
    type: 'buyer' as Lead['type'],
    source: 'manual',
    status: 'new' as Lead['status'],
    stage: 'new_lead' as string,
    intent: 'buyer' as string,
    notes: '',
    description: '',
    company: '',
    property_interest: '',
    budget_min: '',
    budget_max: '',
    priority: 5,
    follow_up_date: '',
    preferred_area: '',
    birthday: '',
    home_anniversary: '',
  })

  const supabase = createClient()

  // Fetch lead notes from lead_notes table
  const fetchLeadNotes = async (leadId: string) => {
    if (!user) return
    setLoadingNotes(true)
    const { data, error } = await supabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching lead notes:', error)
      setLeadNotes([])
    } else {
      setLeadNotes(data || [])
    }
    setLoadingNotes(false)
  }

  // Save a new lead note
  const saveLeadNote = async () => {
    if (!user || !selectedLead || !newNoteContent.trim()) return
    
    const { data, error } = await supabase
      .from('lead_notes')
      .insert({
        lead_id: selectedLead.id,
        user_id: user.id,
        content: newNoteContent.trim()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error saving note:', error)
      setImportStatus('Failed to save note')
      setTimeout(() => setImportStatus(''), 2000)
    } else {
      setLeadNotes([data, ...leadNotes])
      setNewNoteContent('')
      setImportStatus('Note saved!')
      setTimeout(() => setImportStatus(''), 2000)
    }
  }

  const updateLeadNote = async (noteId: string, content: string) => {
    const { error } = await supabase
      .from('lead_notes')
      .update({ content: content.trim(), updated_at: new Date().toISOString() })
      .eq('id', noteId)
    if (error) {
      console.error('Error updating note:', error)
    } else {
      setLeadNotes(leadNotes.map(n => n.id === noteId ? { ...n, content: content.trim() } : n))
    }
    setEditingNoteId(null)
    setEditingNoteContent('')
  }

  const deleteLeadNote = async (noteId: string) => {
    const { error } = await supabase
      .from('lead_notes')
      .delete()
      .eq('id', noteId)
    if (error) {
      console.error('Error deleting note:', error)
    } else {
      setLeadNotes(leadNotes.filter(n => n.id !== noteId))
    }
    setNoteMenuOpen(null)
  }

  // Fetch notes when selectedLead changes
  useEffect(() => {
    if (selectedLead) {
      fetchLeadNotes(selectedLead.id)
      setInlineNotes(selectedLead.notes || '')
      setInlinePriority(selectedLead.priority || 5)
    } else {
      setLeadNotes([])
      setNewNoteContent('')
    }
  }, [selectedLead])

  // Handle speech-to-text transcript
  useEffect(() => {
    if (transcript) {
      setFormData(prev => ({ ...prev, notes: (prev.notes + ' ' + transcript).trim() }))
      setTranscript('')
    }
  }, [transcript, setTranscript])

  // Auto-scroll notes to bottom when lead is selected (view mode)
  useEffect(() => {
    if (selectedLead && notesScrollRef.current) {
      setTimeout(() => {
        notesScrollRef.current?.scrollTo({ top: notesScrollRef.current.scrollHeight, behavior: 'smooth' })
      }, 100)
    }
  }, [selectedLead])

  // Auto-scroll notes textarea to bottom when editing a lead
  useEffect(() => {
    if (editingLead && editNotesRef.current) {
      setTimeout(() => {
        const textarea = editNotesRef.current
        if (textarea) {
          textarea.scrollTop = textarea.scrollHeight
          // Also place cursor at the end
          textarea.setSelectionRange(textarea.value.length, textarea.value.length)
        }
      }, 150)
    }
  }, [editingLead])

  useEffect(() => {
    if (user) fetchLeads()
  }, [user])

  const fetchLeads = async () => {
    if (!user) return
    
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leads:', error)
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      emailPersonal: '',
      emailWork: '',
      phoneMobile: '',
      phoneHome: '',
      type: 'buyer',
      source: 'manual',
      status: 'new',
      stage: 'new_lead',
      intent: 'buyer',
      notes: '',
      description: '',
      company: '',
      property_interest: '',
      budget_min: '',
      budget_max: '',
      priority: 5,
      follow_up_date: '',
      preferred_area: '',
      birthday: '',
      home_anniversary: '',
    })
    setEditingLead(null)
    setShowAddModal(false)
    setShowDetailFields(false)
  }

  const saveLead = async () => {
    if (!user || !formData.firstName.trim()) return

    // Combine first + last name for storage
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim()
    // Use primary email/phone (first one filled)
    const primaryEmail = formData.emailPersonal || formData.emailWork || null
    const primaryPhone = formData.phoneMobile || formData.phoneHome || null

    const leadData = {
      user_id: user.id,
      name: fullName,
      email: primaryEmail,
      phone: primaryPhone,
      type: formData.type,
      source: formData.source,
      status: formData.status,
      notes: formData.notes || null,
      property_interest: formData.property_interest || null,
      budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
      budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
      priority: formData.priority,
      follow_up_date: formData.follow_up_date || null,
      preferred_area: formData.preferred_area || null,
      birthday: formData.birthday || null,
      home_anniversary: formData.home_anniversary || null,
    }

    if (editingLead) {
      const { error } = await supabase
        .from('leads')
        .update(leadData)
        .eq('id', editingLead.id)

      if (error) {
        console.error('Error updating lead:', error)
      } else {
        setLeads(leads.map(l => l.id === editingLead.id ? { ...l, ...leadData } : l))
        resetForm()
      }
    } else {
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single()

      if (error) {
        console.error('Error adding lead:', error)
      } else if (data) {
        setLeads([data, ...leads])
        resetForm()
      }
    }
  }

  const editLead = (lead: Lead) => {
    // Split name into first/last
    const nameParts = lead.name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    setFormData({
      firstName,
      lastName,
      emailPersonal: lead.email || '',
      emailWork: '',
      phoneMobile: lead.phone || '',
      phoneHome: '',
      type: lead.type,
      source: lead.source,
      status: lead.status,
      stage: (lead as any).stage || 'new_lead',
      intent: lead.type, // Use type as intent for now
      notes: lead.notes || '',
      description: (lead as any).description || '',
      company: (lead as any).company || '',
      property_interest: lead.property_interest || '',
      budget_min: lead.budget_min?.toString() || '',
      budget_max: lead.budget_max?.toString() || '',
      priority: lead.priority || 5,
      follow_up_date: lead.follow_up_date || '',
      preferred_area: lead.preferred_area || '',
      birthday: lead.birthday || '',
      home_anniversary: lead.home_anniversary || '',
    })
    setEditingLead(lead)
    setSelectedLead(null)
    setShowAddModal(true)
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId)

    if (error) {
      console.error('Error updating lead:', error)
    } else {
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus as Lead['status'] } : l))
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus as Lead['status'] })
      }
    }
  }

  const deleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId)

    if (error) {
      console.error('Error deleting lead:', error)
    } else {
      setLeads(leads.filter(l => l.id !== leadId))
      setSelectedLead(null)
    }
  }

  // Quick message generation
  const getQuickMessage = (lead: Lead) => {
    const name = lead.name.split(' ')[0]
    const priority = lead.priority || 5
    const isBuyer = lead.type === 'buyer' || lead.type === 'buyer55'
    
    if (priority <= 3) {
      return `Hi ${name}! 🔥 You're on my priority list today. ${isBuyer ? "I found some great properties I'd love to show you!" : "Let's discuss your listing strategy."} When are you free to connect?`
    } else if (priority <= 6) {
      return `Hey ${name}! Just checking in as promised. ${isBuyer ? "Any updates on your home search?" : "How are things going with your real estate plans?"} Let me know how I can help!`
    } else {
      return `Hi ${name}, hope you're doing well! Wanted to touch base and see if you have any questions about ${isBuyer ? "the market" : "your property"}. I'm here when you're ready!`
    }
  }

  const copyQuickMessage = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message)
      setImportStatus('✓ Copied!')
      setTimeout(() => setImportStatus(''), 2000)
    } catch {
      setImportStatus('Failed to copy')
      setTimeout(() => setImportStatus(''), 2000)
    }
  }

  const sendQuickMessage = (lead: Lead, message: string) => {
    const phone = lead.phone?.replace(/\D/g, '')
    if (phone) {
      window.open(`sms:${phone}?body=${encodeURIComponent(message)}`, '_blank')
    } else if (lead.email) {
      window.open(`mailto:${lead.email}?subject=${encodeURIComponent('Following Up')}&body=${encodeURIComponent(message)}`, '_blank')
    }
  }

  // Add timestamp to notes (appends to end)
  const addTimestampToNotes = () => {
    const now = new Date()
    const timestamp = `\n\n[${now.toLocaleDateString('en-US')} ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}] `
    setFormData(prev => ({ 
      ...prev, 
      notes: prev.notes ? prev.notes.trimEnd() + timestamp : timestamp.trim() 
    }))
    
    // Scroll modal to notes section and focus textarea
    setTimeout(() => {
      if (editNotesRef.current) {
        // Scroll the textarea into view within the modal
        editNotesRef.current.scrollIntoView({ behavior: 'instant', block: 'center' })
        editNotesRef.current.scrollTop = editNotesRef.current.scrollHeight
        editNotesRef.current.focus()
        editNotesRef.current.setSelectionRange(
          editNotesRef.current.value.length, 
          editNotesRef.current.value.length
        )
      }
    }, 50)
  }

  // Clean AI response - remove preambles AND trailing explanations
  const cleanAiResponse = (text: string) => {
    if (!text) return text
    let cleaned = text
    
    // Remove lines that look like introductions (end with colon) at the start
    const lines = cleaned.split('\n')
    while (lines.length > 0 && lines[0].trim().endsWith(':')) {
      lines.shift()
    }
    cleaned = lines.join('\n').trim()
    
    // Remove inline preambles
    cleaned = cleaned
      .replace(/^Here['']s a slightly refined version.*?:/i, '')
      .replace(/^Here['']s a refined version.*?:/i, '')
      .replace(/^Here['']s a personalized.*?:/i, '')
      .replace(/^Here['']s a follow-up.*?:/i, '')
      .replace(/^Here['']s the.*?:/i, '')
      .replace(/^Here['']s a.*?:/i, '')
      .replace(/^Here is a.*?:/i, '')
      .replace(/^Here is the.*?:/i, '')
      .replace(/^The following.*?:/i, '')
      .replace(/^Below is.*?:/i, '')
      .replace(/^Sure[,!].*?:/i, '')
      .replace(/^Certainly[,!].*?:/i, '')
      .trim()
    
    // Remove trailing explanations (paragraphs that explain the message)
    const paragraphs = cleaned.split('\n\n')
    const filteredParagraphs = paragraphs.filter(p => {
      const lower = p.toLowerCase().trim()
      // Filter out explanation paragraphs
      if (lower.startsWith('this text message')) return false
      if (lower.startsWith('this message')) return false
      if (lower.startsWith('the tone')) return false
      if (lower.startsWith('i hope this')) return false
      if (lower.startsWith('feel free to')) return false
      if (lower.startsWith('you can adjust')) return false
      if (lower.startsWith('let me know')) return false
      if (lower.includes('personalized') && lower.includes('professional')) return false
      return true
    })
    
    return filteredParagraphs.join('\n\n').trim()
  }

  // AI Follow-up: Generate a follow-up message based on notes
  const generateAiFollowup = async (lead: Lead) => {
    if (!lead.notes) {
      setAiResponse('No notes to base follow-up on. Add some notes first!')
      return
    }
    setAiLoading('followup')
    setAiResponse(null)
    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: `Based on these notes about my client ${lead.name}, write ONLY the text message itself (2-3 sentences max). Be warm and professional. DO NOT include any introduction, title, or preamble like "Here's a message". DO NOT use any emojis. Just write the actual message to send. Notes: ${lead.notes}`
        })
      })
      const data = await response.json()
      setAiResponse(cleanAiResponse(data.advice))
    } catch {
      setAiResponse('Failed to generate follow-up. Try again.')
    } finally {
      setAiLoading(null)
    }
  }

  // AI Rewrite: Clean up and improve notes
  const generateAiRewrite = async (lead: Lead) => {
    if (!lead.notes) {
      setAiResponse('No notes to rewrite!')
      return
    }
    setAiLoading('rewrite')
    setAiResponse(null)
    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: `Rewrite and organize these client notes to be clearer and more professional. Keep all important details, fix any typos, and format with timestamps preserved. DO NOT include any introduction or preamble. DO NOT use any emojis. Just output the rewritten notes directly. Notes: ${lead.notes}`
        })
      })
      const data = await response.json()
      setAiResponse(cleanAiResponse(data.advice))
    } catch {
      setAiResponse('Failed to rewrite notes. Try again.')
    } finally {
      setAiLoading(null)
    }
  }

  // Copy AI response to notes with timestamp
  const copyToNotes = async (lead: Lead, text: string) => {
    const now = new Date()
    const timestamp = `[${now.toLocaleDateString('en-US')} @ ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}] `
    const newNote = lead.notes ? lead.notes.trimEnd() + '\n\n' + timestamp + text : timestamp + text
    
    const { error } = await supabase
      .from('leads')
      .update({ notes: newNote })
      .eq('id', lead.id)

    if (!error) {
      setLeads(leads.map(l => l.id === lead.id ? { ...l, notes: newNote } : l))
      if (selectedLead?.id === lead.id) {
        setSelectedLead({ ...selectedLead, notes: newNote })
      }
      setAiResponse(null)
      setImportStatus('Added to notes!')
      setTimeout(() => setImportStatus(''), 2000)
    }
  }

  // Filter and sort leads
  const today = new Date().toISOString().split('T')[0]
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone?.includes(searchTerm))
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus
    const matchesPriority = filterPriority === 'all' || 
      (filterPriority === 'hot' && (lead.priority || 5) <= 3) ||
      (filterPriority === 'warm' && (lead.priority || 5) >= 4 && (lead.priority || 5) <= 6) ||
      (filterPriority === 'cold' && (lead.priority || 5) >= 7)
    const matchesFollowup = !filterFollowupToday || lead.follow_up_date === today
    return matchesSearch && matchesStatus && matchesPriority && matchesFollowup
  }).sort((a, b) => (a.priority || 10) - (b.priority || 10))

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Stats
  const hotLeads = leads.filter(l => (l.priority || 5) <= 3)
  const warmLeads = leads.filter(l => (l.priority || 5) >= 4 && (l.priority || 5) <= 6)
  const todayFollowUps = leads.filter(l => l.follow_up_date === today)

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">👥 Lead Manager</h1>
          <p className="text-gray-400">Manage your clients and prospects</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span>+</span> Add Lead
        </button>
      </div>

      {/* Import Status Toast */}
      {importStatus && (
        <div className="fixed top-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-lg z-50 animate-fade-in">
          {importStatus}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="negotiating">Negotiating</option>
          <option value="closed">Closed</option>
          <option value="lost">Lost</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="input-field"
        >
          <option value="all">All Priority</option>
          <option value="hot">🔥 Hot (1-3)</option>
          <option value="warm">☀️ Warm (4-6)</option>
          <option value="cold">❄️ Cold (7-10)</option>
        </select>
      </div>

      {/* Stats - Clickable to filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <button 
          onClick={() => { setFilterPriority('all'); setFilterStatus('all'); setFilterFollowupToday(false); }}
          className={`card text-center transition-all hover:scale-105 ${filterPriority === 'all' && filterStatus === 'all' && !filterFollowupToday ? 'ring-2 ring-white/50' : ''}`}
        >
          <p className="text-2xl font-bold text-white">{leads.length}</p>
          <p className="text-gray-400 text-sm">Total Leads</p>
        </button>
        <button 
          onClick={() => { setFilterPriority('hot'); setFilterStatus('all'); setFilterFollowupToday(false); }}
          className={`card text-center border-orange-500/30 transition-all hover:scale-105 hover:border-orange-500 ${filterPriority === 'hot' ? 'ring-2 ring-orange-500' : ''}`}
        >
          <p className="text-2xl font-bold text-orange-400">🔥 {hotLeads.length}</p>
          <p className="text-gray-400 text-sm">Hot Leads</p>
        </button>
        <button 
          onClick={() => { setFilterPriority('warm'); setFilterStatus('all'); setFilterFollowupToday(false); }}
          className={`card text-center border-primary-500/30 transition-all hover:scale-105 hover:border-primary-500 ${filterPriority === 'warm' ? 'ring-2 ring-primary-500' : ''}`}
        >
          <p className="text-2xl font-bold text-primary-500">☀️ {warmLeads.length}</p>
          <p className="text-gray-400 text-sm">Warm Leads</p>
        </button>
        <button 
          onClick={() => { setFilterPriority('all'); setFilterStatus('all'); setFilterFollowupToday(!filterFollowupToday); }}
          className={`card text-center border-green-500/30 transition-all hover:scale-105 hover:border-green-500 ${filterFollowupToday ? 'ring-2 ring-green-500' : ''}`}
        >
          <p className="text-2xl font-bold text-green-400">{todayFollowUps.length}</p>
          <p className="text-gray-400 text-sm">Follow-ups Today</p>
        </button>
      </div>

      {/* Today's Follow-ups Alert */}
      {todayFollowUps.length > 0 && (
        <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
          <h3 className="text-primary-500 font-semibold mb-2">📞 Today&apos;s Follow-ups</h3>
          <div className="space-y-2">
            {todayFollowUps.map(lead => (
              <div key={lead.id} className="flex items-center justify-between">
                <span className="text-white">{lead.name}</span>
                <button
                  onClick={() => setSelectedLead(lead)}
                  className="text-primary-500 hover:underline text-sm"
                >
                  View →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leads List */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">👥</span>
          <p className="text-gray-400 mb-4">
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' ? 'No leads match your filters' : 'No leads yet'}
          </p>
          {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              Add Your First Lead
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map(lead => {
            const priority = lead.priority || 5
            const priorityColors = getPriorityColor(priority)
            const isExpanded = expandedLeadId === lead.id
            return (
              <div
                key={lead.id}
                onClick={() => {
                  setSelectedLead(lead)
                }}
                className={`relative card transition-all cursor-pointer hover:border-primary-500/30 pr-12 ${isExpanded ? 'border-primary-500/50' : ''}`}
              >
                {/* Edit Pencil - Top Right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingLead(lead)
                  }}
                  className="absolute top-3 right-3 text-gray-500 hover:text-primary-500 p-1.5 rounded-lg hover:bg-primary-500/10 transition-colors text-sm z-10"
                  title="Edit lead"
                >
                  ✏️
                </button>

                {/* Lead Header Row */}
                <div className="flex items-center gap-3">
                  {/* Avatar with Initials + Gradient */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                    priority <= 3 ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                    priority <= 6 ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
                    'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}>
                    {getInitials(lead.name)}
                  </div>
                  
                  {/* Lead Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">{lead.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold flex-shrink-0 ${
                        priority <= 3 ? 'bg-red-500/15 text-red-400' :
                        priority <= 6 ? 'bg-amber-500/15 text-amber-400' :
                        'bg-gray-500/15 text-gray-400'
                      }`}>
                        P{priority}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span>{typeLabels[lead.type]?.icon} {typeLabels[lead.type]?.label}</span>
                      {lead.preferred_area && <><span className="text-gray-600">•</span><span>{lead.preferred_area}</span></>}
                      {(lead.budget_min || lead.budget_max) && (
                        <><span className="text-gray-600">•</span><span>{formatCurrency(lead.budget_min)}–{formatCurrency(lead.budget_max)}</span></>
                      )}
                    </p>
                  </div>

                  {/* Right Side - Status + Follow-up */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide ${statusColors[lead.status]}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                    {lead.follow_up_date && (
                      <span className={`text-xs hidden sm:block ${
                        new Date(lead.follow_up_date) < new Date() ? 'text-red-400' :
                        new Date(lead.follow_up_date).toDateString() === new Date().toDateString() ? 'text-amber-400' :
                        'text-gray-500'
                      }`}>
                        📅 {formatDate(lead.follow_up_date)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Notes Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-dark-border space-y-3">
                    {/* AI Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => generateAiFollowup(lead)}
                        disabled={aiLoading !== null}
                        className="px-3 py-1.5 bg-dark-border text-gray-300 rounded-lg text-sm hover:bg-dark-border/80 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        {aiLoading === 'followup' ? '⏳' : '📁'} AI Follow-up
                      </button>
                      <button
                        onClick={() => generateAiRewrite(lead)}
                        disabled={aiLoading !== null}
                        className="px-3 py-1.5 bg-dark-border text-gray-300 rounded-lg text-sm hover:bg-dark-border/80 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        {aiLoading === 'rewrite' ? '⏳' : '✨'} AI Rewrite
                      </button>
                      {isSupported && (
                        <button
                          onClick={toggleListening}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                            isListening ? 'bg-orange-500 text-white' : 'bg-dark-border text-gray-300 hover:bg-dark-border/80'
                          }`}
                        >
                          🎤 Voice
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const now = new Date()
                          const timestamp = `\n\n[${now.toLocaleDateString('en-US')} ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}] `
                          setInlineNotes(prev => prev ? prev.trimEnd() + timestamp : timestamp.trim())
                        }}
                        className="px-3 py-1.5 bg-teal-500/20 text-teal-400 rounded-lg text-sm hover:bg-teal-500/30 transition-colors flex items-center gap-1 border border-teal-500/30"
                      >
                        ⏱️ Add Timestamp
                      </button>
                    </div>

                    {/* AI Response */}
                    {aiResponse && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-purple-400 text-xs font-semibold">AI Response</p>
                          <button onClick={() => setAiResponse(null)} className="text-gray-400 hover:text-white text-xs">✕</button>
                        </div>
                        <p className="text-white text-sm whitespace-pre-wrap mb-2">{aiResponse}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              await navigator.clipboard.writeText(aiResponse)
                              setImportStatus('Copied!')
                              setTimeout(() => setImportStatus(''), 2000)
                            }}
                            className="flex-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => {
                              const now = new Date()
                              const timestamp = `[${now.toLocaleDateString('en-US')} @ ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}] `
                              setInlineNotes(prev => prev ? prev.trimEnd() + '\n\n' + timestamp + aiResponse : timestamp + aiResponse)
                              setAiResponse(null)
                            }}
                            className="flex-1 px-2 py-1 bg-teal-500/20 text-teal-400 rounded text-xs hover:bg-teal-500/30"
                          >
                            Add to Notes
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Notes Textarea */}
                    <textarea
                      value={inlineNotes}
                      onChange={(e) => setInlineNotes(e.target.value)}
                      className="input-field w-full font-mono text-sm"
                      rows={5}
                      placeholder="[1/27/2026 @ 9:00 AM] Met at open house..."
                    />

                    {/* Priority Selector - Below Notes */}
                    <div className="pt-2">
                      <label className="block text-gray-400 text-sm mb-2">Priority (1 = Hottest, 10 = Coldest)</label>
                      <div className="flex gap-1 flex-wrap">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                          const colors = getPriorityColor(num)
                          const isSelected = inlinePriority === num
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setInlinePriority(num)}
                              className={`w-8 h-8 rounded-lg font-semibold transition-all text-sm ${
                                isSelected 
                                  ? `${colors.bg} ${colors.text} ${colors.border} border-2` 
                                  : 'bg-dark-border text-gray-400 hover:text-white border border-transparent'
                              }`}
                            >
                              {num}
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{priorityDescriptions[inlinePriority]}</p>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => {
                          setExpandedLeadId(null)
                          setInlineNotes('')
                          setInlinePriority(5)
                          setAiResponse(null)
                        }}
                        className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          const { error } = await supabase
                            .from('leads')
                            .update({ notes: inlineNotes, priority: inlinePriority })
                            .eq('id', lead.id)
                          if (!error) {
                            setLeads(leads.map(l => l.id === lead.id ? { ...l, notes: inlineNotes, priority: inlinePriority } : l))
                            setExpandedLeadId(null)
                            setInlineNotes('')
                            setInlinePriority(5)
                            setAiResponse(null)
                            setImportStatus('Saved!')
                            setTimeout(() => setImportStatus(''), 2000)
                          }
                        }}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
                      >
                        💾 Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Lead Modal - Centered Slide-up Panel */}
      {showAddModal && (
        <div 
          className="modal-panel-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}
        >
          <div ref={editModalRef} className="modal-panel">
            {/* Header with Avatar */}
            <div className="p-4 md:p-6 border-b border-dark-border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* Avatar - only show when editing, not creating */}
                  {editingLead && (
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0 ${
                      (editingLead.priority || 5) <= 3 ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                      (editingLead.priority || 5) <= 6 ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
                      'bg-gradient-to-br from-gray-500 to-gray-600'
                    }`}>
                      {getInitials(editingLead.name)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      {editingLead ? 'Edit Contact' : 'Create Contact'}
                    </h2>
                    {editingLead && (
                      <p className="text-gray-400 text-sm mt-1">{editingLead.name}</p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={resetForm} 
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
              {/* === CONTACT INFO SECTION === */}
              <div className="text-xs uppercase tracking-wider text-gray-600 mb-3 pb-2 border-b border-dark-border">Contact Info</div>
              
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">First Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-field w-full"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Last Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-field w-full"
                    placeholder="Smith"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">📧 Personal Email</label>
                  <input
                    type="email"
                    value={formData.emailPersonal}
                    onChange={(e) => setFormData({ ...formData, emailPersonal: e.target.value })}
                    className="input-field w-full"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">📧 Work Email</label>
                  <input
                    type="email"
                    value={formData.emailWork}
                    onChange={(e) => setFormData({ ...formData, emailWork: e.target.value })}
                    className="input-field w-full"
                    placeholder="email@work.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">📱 Mobile</label>
                  <input
                    type="tel"
                    value={formData.phoneMobile}
                    onChange={(e) => setFormData({ ...formData, phoneMobile: e.target.value })}
                    className="input-field w-full"
                    placeholder="555-555-5555"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">📱 Home</label>
                  <input
                    type="tel"
                    value={formData.phoneHome}
                    onChange={(e) => setFormData({ ...formData, phoneHome: e.target.value })}
                    className="input-field w-full"
                    placeholder="555-555-5555"
                  />
                </div>
              </div>

              {/* === STATUS & PRIORITY SECTION === */}
              <div className="text-xs uppercase tracking-wider text-gray-600 mb-3 pb-2 border-b border-dark-border mt-6">Status & Priority</div>
              
              {/* Status Pills */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'hot' as Lead['status'] })}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      formData.status === 'hot'
                        ? 'bg-red-500/20 text-red-400 border-red-500/50'
                        : 'bg-dark-card text-gray-500 border-dark-border hover:border-gray-600'
                    }`}
                  >
                    🔥 Hot
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'new' as Lead['status'] })}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      formData.status === 'new'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                        : 'bg-dark-card text-gray-500 border-dark-border hover:border-gray-600'
                    }`}
                  >
                    New
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'nurture' as Lead['status'] })}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      formData.status === 'nurture'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                        : 'bg-dark-card text-gray-500 border-dark-border hover:border-gray-600'
                    }`}
                  >
                    Nurture
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'watch' as Lead['status'] })}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      formData.status === 'watch'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                        : 'bg-dark-card text-gray-500 border-dark-border hover:border-gray-600'
                    }`}
                  >
                    Watch
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'pending' as Lead['status'] })}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      formData.status === 'pending'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                        : 'bg-dark-card text-gray-500 border-dark-border hover:border-gray-600'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'past_client' as Lead['status'] })}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      formData.status === 'past_client'
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : 'bg-dark-card text-gray-500 border-dark-border hover:border-gray-600'
                    }`}
                  >
                    Past Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'inactive' as Lead['status'] })}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      formData.status === 'inactive'
                        ? 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                        : 'bg-dark-card text-gray-500 border-dark-border hover:border-gray-600'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              {/* Intent / Stage Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Intent</label>
                  <select
                    value={formData.intent}
                    onChange={(e) => setFormData({ ...formData, intent: e.target.value, type: e.target.value as Lead['type'] })}
                    className="input-field w-full"
                  >
                    {intentOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Stage <span className="text-red-400">*</span></label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="input-field w-full"
                  >
                    {stageOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority Track */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Priority</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`flex-1 h-9 rounded-md text-xs font-bold transition-all flex items-center justify-center ${
                        formData.priority === p
                          ? p <= 3
                            ? 'bg-red-500/25 text-red-400 border-2 border-red-500'
                            : p <= 6
                            ? 'bg-amber-500/25 text-amber-400 border-2 border-amber-500'
                            : 'bg-gray-500/25 text-gray-400 border-2 border-gray-500'
                          : p <= 3
                          ? 'bg-red-500/10 text-red-400/60 border border-white/5 hover:bg-red-500/20'
                          : p <= 6
                          ? 'bg-amber-500/10 text-amber-400/60 border border-white/5 hover:bg-amber-500/20'
                          : 'bg-gray-500/10 text-gray-400/60 border border-white/5 hover:bg-gray-500/20'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <p className={`text-xs mt-2 ${
                  formData.priority <= 3 ? 'text-red-400' : 
                  formData.priority <= 6 ? 'text-amber-400' : 'text-gray-400'
                }`}>
                  {priorityDescriptions[formData.priority]}
                </p>
              </div>

              {/* === PROPERTY PREFERENCES SECTION === */}
              <div className="text-xs uppercase tracking-wider text-gray-600 mb-3 pb-2 border-b border-dark-border mt-6">Property Preferences</div>
              
              {/* Area & Follow-up */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Preferred Area</label>
                  <input
                    type="text"
                    value={formData.preferred_area}
                    onChange={(e) => setFormData({ ...formData, preferred_area: e.target.value })}
                    className="input-field w-full"
                    placeholder="Winter Park, FL"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Follow-up</label>
                  <input
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Budget Min</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.budget_min ? `$${Number(formData.budget_min).toLocaleString()}` : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '')
                      setFormData({ ...formData, budget_min: raw })
                    }}
                    className="input-field w-full"
                    placeholder="$250,000"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Budget Max</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.budget_max ? `$${Number(formData.budget_max).toLocaleString()}` : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '')
                      setFormData({ ...formData, budget_max: raw })
                    }}
                    className="input-field w-full"
                    placeholder="$400,000"
                  />
                </div>
              </div>

              {/* Property Interest */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Property Interest</label>
                <input
                  type="text"
                  value={formData.property_interest}
                  onChange={(e) => setFormData({ ...formData, property_interest: e.target.value })}
                  className="input-field w-full"
                  placeholder="3BR in Winter Park, pool preferred"
                />
              </div>

              {/* === PERSONAL DETAILS SECTION === */}
              <div className="text-xs uppercase tracking-wider text-gray-600 mb-3 pb-2 border-b border-dark-border mt-6">Personal Details</div>
              
              {/* Birthday & Anniversary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">🎂 Birthday</label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">🏠 Home Anniversary</label>
                  <input
                    type="date"
                    value={formData.home_anniversary}
                    onChange={(e) => setFormData({ ...formData, home_anniversary: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input-field w-full"
                  placeholder="Company name"
                />
              </div>

              {/* Source */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Source <span className="text-red-400">*</span></label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="input-field w-full"
                >
                  {sourceOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field w-full h-20 resize-none"
                  placeholder="Quick notes about this contact..."
                />
              </div>

              {/* Notes with Voice */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-400 text-sm">Notes</label>
                  {isSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        isListening 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' 
                          : 'bg-dark-border text-gray-400 hover:text-white hover:bg-dark-hover'
                      }`}
                    >
                      {isListening ? '🔴 Stop' : '🎤 Voice'}
                    </button>
                  )}
                </div>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field w-full h-28 resize-none"
                  placeholder="Add notes about this contact..."
                />
                {isListening && (
                  <p className="text-xs text-red-400 mt-1 animate-pulse">🎤 Listening... speak now</p>
                )}
              </div>

            </div>
            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-dark-border flex items-center justify-between gap-3 bg-dark-card">
              {/* Left: Delete (only when editing) */}
              <div className="footer-left">
                {editingLead && (
                  <button 
                    onClick={() => {
                      deleteLead(editingLead.id)
                      resetForm()
                    }} 
                    className="px-4 py-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium border border-red-500/20"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
              {/* Right: Cancel + Save Contact */}
              <div className="footer-right flex gap-3">
                <button 
                  onClick={resetForm} 
                  className="px-4 py-2.5 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveLead} 
                  className="px-4 py-2.5 bg-primary-500 text-dark-bg rounded-lg hover:bg-primary-600 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={!formData.firstName.trim()}
                >
                  💾 Save Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Lead Modal - Centered Slide-up */}
      {selectedLead && (
        <div 
          className="modal-panel-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) { setSelectedLead(null); setAiResponse(null); setInlineNotes(''); setInlinePriority(5); setViewTab('overview'); }}}
        >
          <div className="modal-panel">
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-dark-border flex items-center gap-4">
              <div className="avatar-initials w-12 h-12 md:w-14 md:h-14 text-lg md:text-xl flex-shrink-0">
                {getInitials(selectedLead.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-white truncate">{selectedLead.name}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[selectedLead.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                    {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1).replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(selectedLead.priority || 5).bg} ${getPriorityColor(selectedLead.priority || 5).text}`}>
                    P{selectedLead.priority || 5}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {typeLabels[selectedLead.type]?.icon} {typeLabels[selectedLead.type]?.label}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedLead(null); setAiResponse(null); setInlineNotes(''); setInlinePriority(5); setViewTab('overview'); }} 
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions */}
            <div className="px-4 md:px-5 py-3 border-b border-dark-border flex gap-2 overflow-x-auto">
              {selectedLead.phone && (
                <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm whitespace-nowrap transition-colors">
                  📞 Call
                </a>
              )}
              {selectedLead.phone && (
                <a href={`sms:${selectedLead.phone}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm whitespace-nowrap transition-colors">
                  💬 Text
                </a>
              )}
              {selectedLead.email && (
                <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm whitespace-nowrap transition-colors">
                  ✉️ Email
                </a>
              )}
              <button 
                onClick={() => editLead(selectedLead)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm whitespace-nowrap transition-colors"
              >
                ✏️ Edit
              </button>
            </div>

            {/* Tabs */}
            <div className="px-4 md:px-5 border-b border-dark-border flex gap-1">
              {(['overview', 'activity', 'tasks'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setViewTab(tab)}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                    viewTab === tab 
                      ? 'text-primary-500' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {viewTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5">
              {viewTab === 'overview' && (
                <div className="space-y-5">
                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLead.phone && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Phone</p>
                        <a href={`tel:${selectedLead.phone}`} className="text-white hover:text-primary-500 transition-colors">
                          {selectedLead.phone}
                        </a>
                      </div>
                    )}
                    {selectedLead.email && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Email</p>
                        <a href={`mailto:${selectedLead.email}`} className="text-white hover:text-primary-500 transition-colors text-sm break-all">
                          {selectedLead.email}
                        </a>
                      </div>
                    )}
                    {selectedLead.preferred_area && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Area</p>
                        <p className="text-white">{selectedLead.preferred_area}</p>
                      </div>
                    )}
                    {(selectedLead.budget_min || selectedLead.budget_max) && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Budget</p>
                        <p className="text-white">
                          {formatCurrency(selectedLead.budget_min) || '?'} – {formatCurrency(selectedLead.budget_max) || '?'}
                        </p>
                      </div>
                    )}
                    {selectedLead.follow_up_date && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Follow-up</p>
                        <p className="text-white">📅 {formatDate(selectedLead.follow_up_date)}</p>
                      </div>
                    )}
                    {selectedLead.source && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Source</p>
                        <p className="text-white">{sourceOptions.find(s => s.value === selectedLead.source)?.label || selectedLead.source}</p>
                      </div>
                    )}
                  </div>

                  {selectedLead.property_interest && (
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Property Interest</p>
                      <p className="text-white">{selectedLead.property_interest}</p>
                    </div>
                  )}

                  {/* Notes Timeline */}
                  <div className="border-t border-dark-border pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-400">Recent Notes</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => generateAiFollowup(selectedLead)}
                          disabled={aiLoading !== null}
                          className="px-2 py-1 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                        >
                          {aiLoading === 'followup' ? '⏳' : '✨'} AI Follow-up
                        </button>
                        <button
                          onClick={() => generateAiRewrite(selectedLead)}
                          disabled={aiLoading !== null}
                          className="px-2 py-1 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                        >
                          {aiLoading === 'rewrite' ? '⏳' : '🔄'} AI Rewrite
                        </button>
                        {isSupported && (
                          <button
                            type="button"
                            onClick={toggleListening}
                            className={`px-2 py-1 text-xs rounded-md border transition-all ${
                              isListening 
                                ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' 
                                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {isListening ? '🎤 Recording...' : '🎤 Voice'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI Response */}
                    {aiResponse && (
                      <div className="p-3 mb-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-purple-400 text-xs font-semibold">AI Response</p>
                          <button onClick={() => setAiResponse(null)} className="text-gray-400 hover:text-white text-xs">✕</button>
                        </div>
                        <p className="text-white text-sm whitespace-pre-wrap mb-2">{aiResponse}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              await navigator.clipboard.writeText(aiResponse)
                              setImportStatus('Copied!')
                              setTimeout(() => setImportStatus(''), 2000)
                            }}
                            className="flex-1 px-2 py-1.5 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => {
                              setNewNoteContent(aiResponse)
                              setAiResponse(null)
                            }}
                            className="flex-1 px-2 py-1.5 bg-teal-500/20 text-teal-400 rounded text-xs hover:bg-teal-500/30"
                          >
                            Use as Note
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="relative pl-5 mb-4">
                      {/* Timeline line */}
                      <div className="absolute left-1 top-2 bottom-2 w-px bg-white/10"></div>
                      
                      {loadingNotes ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Loading notes...</div>
                      ) : leadNotes.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">No notes yet. Add one below!</div>
                      ) : (
                        <>
                          {leadNotes.map((note, index) => {
                            const noteDate = new Date(note.created_at)
                            const now = new Date()
                            const daysDiff = Math.floor((now.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24))
                            const isRecent = daysDiff <= 7
                            
                            return (
                              <div key={note.id} className="relative pb-5 last:pb-0">
                                {/* Timeline dot */}
                                <div className={`absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                                  isRecent 
                                    ? 'bg-amber-500 border-amber-500' 
                                    : 'bg-gray-700 border-gray-600'
                                }`}></div>
                                
                                {/* Date */}
                                <div className="text-xs text-gray-600 mb-1">
                                  {noteDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {noteDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </div>
                                
                                {/* Note content card */}
                                <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2.5 relative group">
                                  {editingNoteId === note.id ? (
                                    <div>
                                      <textarea
                                        value={editingNoteContent}
                                        onChange={(e) => setEditingNoteContent(e.target.value)}
                                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2 text-sm text-white resize-none focus:outline-none focus:border-amber-500"
                                        rows={3}
                                        autoFocus
                                      />
                                      <div className="flex gap-2 mt-2">
                                        <button
                                          onClick={() => updateLeadNote(note.id, editingNoteContent)}
                                          className="px-3 py-1 bg-amber-500 text-black text-xs font-semibold rounded-md hover:bg-amber-600"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => { setEditingNoteId(null); setEditingNoteContent(''); }}
                                          className="px-3 py-1 bg-white/5 text-gray-400 text-xs rounded-md hover:bg-white/10"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-sm text-gray-300 leading-relaxed pr-6">{note.content}</p>
                                      {/* 3-dot menu */}
                                      <div className="absolute top-2 right-2">
                                        <button
                                          onClick={() => setNoteMenuOpen(noteMenuOpen === note.id ? null : note.id)}
                                          className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:text-gray-300 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                          ⋮
                                        </button>
                                        {noteMenuOpen === note.id && (
                                          <div className="absolute right-0 top-7 bg-dark-card border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden min-w-[100px]">
                                            <button
                                              onClick={() => { setEditingNoteId(note.id); setEditingNoteContent(note.content); setNoteMenuOpen(null); }}
                                              className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 transition-colors"
                                            >
                                              ✏️ Edit
                                            </button>
                                            <button
                                              onClick={() => deleteLeadNote(note.id)}
                                              className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                              🗑️ Delete
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </>
                      )}
                    </div>

                    {/* Add new note */}
                    <div className="flex gap-2 mt-4">
                      <textarea
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            saveLeadNote()
                          }
                        }}
                        className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg p-3 text-white text-base resize-none focus:outline-none focus:border-amber-500 transition-colors"
                        placeholder="Add a note..."
                        rows={2}
                      />
                      <button
                        onClick={saveLeadNote}
                        disabled={!newNoteContent.trim()}
                        className="bg-amber-500 text-black font-semibold rounded-lg px-4 h-11 self-end hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Tip: Press ⌘+Enter to save quickly</p>
                  </div>
                </div>
              )}

              {viewTab === 'activity' && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📋</p>
                  <p>Activity tracking coming soon</p>
                  <p className="text-sm mt-1">Call logs, emails, and interactions will appear here</p>
                </div>
              )}

              {viewTab === 'tasks' && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">✅</p>
                  <p>Tasks coming soon</p>
                  <p className="text-sm mt-1">Schedule follow-ups and reminders</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-dark-border flex gap-3 bg-dark-card">
              <button 
                onClick={() => deleteLead(selectedLead.id)} 
                className="px-4 py-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
              >
                🗑️ Delete
              </button>
              <div className="flex-1" />
              <button 
                onClick={() => { setSelectedLead(null); setAiResponse(null); setInlineNotes(''); setInlinePriority(5); setViewTab('overview'); setLeadNotes([]); setNewNoteContent(''); }} 
                className="px-4 py-2.5 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
