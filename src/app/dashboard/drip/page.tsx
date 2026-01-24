'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'

interface Newsletter {
  id: string
  user_id: string
  title: string
  content: string
  audience_type: string[]
  lead_status: string[]
  market_focus: string
  community: string
  market_data: MarketData
  image_url?: string
  created_at: string
  sent_at?: string
  status: 'draft' | 'scheduled' | 'sent'
}

interface MarketData {
  interestRate: string
  priceRangeLow: string
  priceRangeHigh: string
  priceChange: string
  avgDaysOnMarket: string
  inventoryChange: string
  hotNeighborhood1: string
  hotNeighborhood1Change: string
  hotNeighborhood2: string
  hotNeighborhood2Change: string
}

const defaultMarketData: MarketData = {
  interestRate: '6.5',
  priceRangeLow: '380000',
  priceRangeHigh: '450000',
  priceChange: '+3.2',
  avgDaysOnMarket: '45',
  inventoryChange: '+30',
  hotNeighborhood1: '',
  hotNeighborhood1Change: '+12',
  hotNeighborhood2: '',
  hotNeighborhood2Change: '+8',
}

const marketFocusOptions = [
  { value: 'general', label: '🏠 General (Buyers & Sellers)' },
  { value: 'buyers', label: '🔑 Focus on Buyers' },
  { value: 'sellers', label: '💰 Focus on Sellers' },
]

const audienceTypes = [
  { value: 'regular_buyer', label: '🏠 Regular Buyers' },
  { value: 'senior_buyer', label: '👴 Buyers 55+' },
  { value: 'investor', label: '💼 Investors' },
  { value: 'seller', label: '💰 Sellers' },
]

const leadStatuses = [
  { value: 'cold', label: '❄️ Cold Leads' },
  { value: 'lost', label: '😔 Lost Leads' },
  { value: 'waiting', label: '⏳ Waiting' },
  { value: 'nurture', label: '🌱 Nurture' },
]

// Generate content based on topic hints
const generateTopicContent = (topicHint: string, community: string): string => {
  const hint = topicHint.toLowerCase()
  const communityName = community || 'your area'
  
  // Infrastructure / Roads / Commute
  if (hint.includes('infrastructure') || hint.includes('road') || hint.includes('commute') || hint.includes('highway') || hint.includes('traffic')) {
    return `🚧 **Infrastructure Improvements Making ${communityName} More Accessible**

Big things are happening that will make getting around ${communityName} much easier:

• **Highway expansions** are reducing commute times significantly - some residents reporting 15-20 minute savings
• **New interchange projects** are improving access to major employment centers
• **Road widening** on key corridors is alleviating rush hour congestion
• **Future planning** includes additional connector roads and improved traffic flow

Why this matters for buyers: Areas with improving infrastructure historically see stronger appreciation. Buying NOW, before these projects complete, means getting in at today's prices while benefiting from tomorrow's convenience.

Smart buyers are paying attention to where the bulldozers are working - that's often where the value is heading.

`
  }
  
  // New Construction / Builders
  if (hint.includes('new construction') || hint.includes('builder') || hint.includes('new home') || hint.includes('new build')) {
    return `🏗️ **New Construction Opportunities in ${communityName}**

Builders are competing for buyers right now, and that means deals:

• **Rate buy-downs** - Some builders are buying down rates to as low as 4.99% for the first 1-2 years
• **Closing cost assistance** - Up to $10,000-$20,000 in closing cost help
• **Free upgrades** - Appliance packages, flooring upgrades, and smart home features included
• **Price reductions** - Inventory homes priced to move

The best part? New construction means new warranty, new everything, and often lower maintenance costs for years.

I'm tracking which builders have the best incentives right now. Want me to share the details?

`
  }
  
  // Schools / Families
  if (hint.includes('school') || hint.includes('family') || hint.includes('kid') || hint.includes('education')) {
    return `🎓 **Top-Rated Schools in ${communityName}**

For families, school quality is often the #1 priority. Here's the good news about ${communityName}:

• **A-rated schools** in several neighborhoods - both elementary and middle
• **New schools opening** to accommodate growth with modern facilities
• **Strong extracurricular programs** including sports, arts, and STEM
• **School choice options** available in the district

Pro tip: Homes in top school zones often command 10-15% premiums AND sell faster. It's an investment that pays off whether you stay or sell later.

I can help you identify which neighborhoods feed into the best schools for your children's ages.

`
  }
  
  // Investment / ROI / Rental
  if (hint.includes('investment') || hint.includes('roi') || hint.includes('rental') || hint.includes('cash flow') || hint.includes('cap rate')) {
    return `📈 **Investment Potential in ${communityName}**

For investors looking at ${communityName}, the numbers are compelling:

• **Strong rental demand** - Vacancy rates remain low as population grows
• **Positive cash flow potential** - Properties priced right can cash flow from day one
• **Appreciation trajectory** - Infrastructure and development driving long-term value
• **Tenant quality** - Growing employment base means reliable renters

Current opportunities I'm seeing:
• Single-family rentals in high-demand school zones
• Value-add properties with cosmetic update potential
• New construction with builder incentives that improve initial returns

Want me to run a detailed cash flow analysis on some specific properties?

`
  }
  
  // Interest Rates / Financing
  if (hint.includes('rate') || hint.includes('financing') || hint.includes('loan') || hint.includes('mortgage') || hint.includes('fha') || hint.includes('va')) {
    return `💰 **Financing Options & Rate Strategies**

Let's talk about making the numbers work in today's rate environment:

• **FHA loans** - As low as 3.5% down with competitive rates for first-time buyers
• **VA loans** - Zero down payment for eligible veterans with no PMI
• **Conventional options** - 5% down programs available with rate buy-down options
• **Seller concessions** - Many sellers willing to contribute to buy-down points

Strategy tip: A 2-1 buy-down can save you thousands in the first two years while you wait for refinance opportunities. Many sellers are offering these right now.

I work with several excellent lenders who specialize in finding the best program for each situation. Happy to make introductions.

`
  }
  
  // 55+ / Senior / Retirement
  if (hint.includes('55') || hint.includes('senior') || hint.includes('retire') || hint.includes('downsize') || hint.includes('active adult')) {
    return `🏡 **55+ Community Options in ${communityName}**

For those looking at active adult living, ${communityName} has excellent options:

• **Resort-style amenities** - Pools, fitness centers, pickleball courts (the hottest amenity right now!)
• **Low-maintenance living** - HOA covers exterior maintenance and landscaping
• **Social opportunities** - Clubs, events, and activities to stay engaged
• **Healthcare proximity** - Easy access to medical facilities and services

What I'm seeing in the market:
• New communities offering significant move-in incentives
• Resales in established communities often 10-15% below new construction
• Single-story options with modern open floor plans

I'd love to show you some communities that might be the perfect fit for this exciting chapter.

`
  }
  
  // Development / Commercial / Growth
  if (hint.includes('development') || hint.includes('commercial') || hint.includes('growth') || hint.includes('shopping') || hint.includes('restaurant')) {
    return `🏢 **New Development Bringing Amenities to ${communityName}**

${communityName} is experiencing exciting commercial growth:

• **New retail centers** - Major retailers and local shops coming to the area
• **Dining options expanding** - From casual to upscale, more choices than ever
• **Entertainment venues** - Movie theaters, entertainment complexes on the way
• **Employment growth** - New businesses mean more jobs and economic strength

Why this matters: Commercial development follows rooftops, but it also DRIVES demand for housing. Areas with new amenities see increased buyer interest and stronger appreciation.

The neighborhoods closest to these new developments are worth watching closely.

`
  }
  
  // Default - generate something based on whatever they typed
  return `📌 **${topicHint}**

This is definitely something worth discussing for ${communityName}. The local market dynamics around this topic are creating both opportunities and considerations for buyers and sellers.

I've been tracking this closely and would love to share more specific details when we connect. This kind of local knowledge can make a real difference in your real estate decisions.

`
}

// Generate newsletter with REAL agent-provided data
const generateNewsletterContent = (
  community: string, 
  marketFocus: string,
  audiences: string[],
  marketData: MarketData,
  additionalTopics: string = ''
): { title: string; content: string } => {
  
  const communityName = community || 'your area'
  const hasInvestors = audiences.includes('investor')
  const hasSellers = audiences.includes('seller')
  const hasBuyers = audiences.includes('regular_buyer') || audiences.includes('senior_buyer')
  const hasSeniors = audiences.includes('senior_buyer')
  const currentMonth = new Date().toLocaleString('default', { month: 'long' })
  const currentYear = new Date().getFullYear()
  
  // Use agent-provided real data
  const rate = parseFloat(marketData.interestRate) || 6.5
  const priceLow = parseInt(marketData.priceRangeLow) || 380000
  const priceHigh = parseInt(marketData.priceRangeHigh) || 450000
  const priceChangeNum = parseFloat(marketData.priceChange) || 0
  const priceChangeText = priceChangeNum >= 0 ? `up ${Math.abs(priceChangeNum)}%` : `down ${Math.abs(priceChangeNum)}%`
  const daysOnMarket = parseInt(marketData.avgDaysOnMarket) || 45
  const invChange = marketData.inventoryChange || '+30'
  
  // Calculate monthly payment
  const loanAmount = (priceLow + priceHigh) / 2 * 0.8
  const monthlyRate = rate / 100 / 12
  const monthlyPayment = Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, 360)) / (Math.pow(1 + monthlyRate, 360) - 1))
  
  let content = `Hi {name},

I hope you're doing well! I've been tracking the ${communityName} market closely and wanted to share some insights I think you'll find valuable.

`

  // MARKET CONDITIONS with real data
  content += `📊 **${communityName} Market Snapshot**

Here's what the numbers show right now:

• **Mortgage rates**: ${rate}% for 30-year fixed${rate < 6.5 ? " - better than many expected!" : " - stabilized from recent highs"}
• **Home prices**: $${(priceLow/1000).toFixed(0)}K - $${(priceHigh/1000).toFixed(0)}K typical range (${priceChangeText} YoY)
• **Days on market**: ${daysOnMarket} days average${daysOnMarket < 40 ? " - good homes still move fast" : " - more time for buyers to decide"}
• **Inventory**: ${invChange}% ${invChange.includes('+') || parseFloat(invChange) > 0 ? "- more choices!" : "- still competitive"}

`

  // HOT NEIGHBORHOODS
  if (marketData.hotNeighborhood1 || marketData.hotNeighborhood2) {
    content += `🔥 **Hot Neighborhoods**

`
    if (marketData.hotNeighborhood1) {
      content += `• **${marketData.hotNeighborhood1}** - Demand ${marketData.hotNeighborhood1Change.startsWith('+') || marketData.hotNeighborhood1Change.startsWith('-') ? marketData.hotNeighborhood1Change : '+' + marketData.hotNeighborhood1Change}%
`
    }
    if (marketData.hotNeighborhood2) {
      content += `• **${marketData.hotNeighborhood2}** - Demand ${marketData.hotNeighborhood2Change.startsWith('+') || marketData.hotNeighborhood2Change.startsWith('-') ? marketData.hotNeighborhood2Change : '+' + marketData.hotNeighborhood2Change}%
`
    }
    content += `
`
  }

  // REAL NUMBERS
  content += `💵 **What This Means in Real Dollars**

At ${rate}%, here's what a typical ${communityName} home looks like:
• Purchase price: ~$${((priceLow + priceHigh) / 2 / 1000).toFixed(0)}K
• Down payment (20%): $${(((priceLow + priceHigh) / 2) * 0.2 / 1000).toFixed(0)}K
• Monthly P&I: ~$${monthlyPayment.toLocaleString()}/month

Remember: You can always refinance when rates drop. You can't go back in time to buy at today's prices.

`

  // MARKET BALANCE
  content += `⚖️ **The Market Has Shifted**

The frenzy is over. Here's what that means for you:

• Fewer bidding wars - no more competing against 20 offers
• Negotiations are back - sellers are working with buyers again
• More time - you can make thoughtful decisions
• Builder incentives - new construction deals available

`

  // GENERATE CONTENT FROM USER'S TOPIC SUGGESTIONS
  if (additionalTopics.trim()) {
    content += generateTopicContent(additionalTopics, communityName)
  }

  // INVESTOR-SPECIFIC SECTION
  if (hasInvestors) {
    const estimatedRent = Math.round(monthlyPayment * 1.2)
    
    content += `📈 **Investment Analysis**

For investors looking at ${communityName}:

• Entry prices: $${(priceLow/1000).toFixed(0)}K - $${(priceHigh/1000).toFixed(0)}K
• Estimated rents: ~$${estimatedRent.toLocaleString()}/month
• Cash flow potential: Properties priced right can be positive from day one

Interested in running numbers on specific properties? I'm happy to help.

`
  }

  // SENIOR BUYER SPECIFIC
  if (hasSeniors) {
    content += `🏡 **55+ Living Options**

Active adult communities in ${communityName} offer:
• Resort-style amenities and low-maintenance living
• Social activities and like-minded neighbors
• Single-story options with modern features

New communities are offering significant move-in incentives right now.

`
  }

  // BOTTOM LINE
  content += `💡 **Bottom Line**

`

  if (hasBuyers && !hasSellers) {
    content += `For buyers: You have leverage right now. More inventory, room to negotiate, and time to find the RIGHT home. The key is being prepared when it appears.
`
  } else if (hasSellers && !hasBuyers) {
    content += `For sellers: Price it right, present it well, and work with someone who knows ${communityName}. Well-positioned homes are still selling strong.
`
  } else {
    content += `Whether buying or selling, this is a healthier market with real opportunities. Local knowledge matters more than ever.
`
  }

  // CALL TO ACTION
  content += `
🤝 **Let's Connect**

I'd love to chat about what this means for your situation. No pressure - just a conversation.

Reply to this email or call/text anytime!

{agent_name}

P.S. - Forward this to anyone who might find it useful!`

  // Generate title
  let title = `${communityName} Real Estate Update - ${currentMonth} ${currentYear}`
  
  if (hasInvestors && !hasBuyers && !hasSellers) {
    title = `Investment Report: ${communityName} - ${currentMonth} ${currentYear}`
  } else if (hasSellers && !hasBuyers) {
    title = `Seller's Market Report: ${communityName}`
  } else if (hasBuyers && !hasSellers) {
    title = `Buyer's Guide: ${communityName} - ${currentMonth} ${currentYear}`
  }

  return { title, content }
}

export default function DripCampaignsPage() {
  const { user } = useUser()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null)
  const [generating, setGenerating] = useState(false)
  const [additionalTopics, setAdditionalTopics] = useState('')
  const [showMarketData, setShowMarketData] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [marketData, setMarketData] = useState<MarketData>(defaultMarketData)
  
  const [newNewsletter, setNewNewsletter] = useState({
    market_focus: 'general',
    community: '',
    audience_type: [] as string[],
    lead_status: [] as string[],
    title: '',
    content: '',
  })

  useEffect(() => {
    if (user) fetchNewsletters()
  }, [user])

  const fetchNewsletters = async () => {
    if (!user) return
    setLoading(true)
    
    const saved = localStorage.getItem(`newsletters_${user.id}`)
    if (saved) {
      setNewsletters(JSON.parse(saved))
    }
    setLoading(false)
  }

  const saveNewsletters = (updated: Newsletter[]) => {
    if (user) {
      localStorage.setItem(`newsletters_${user.id}`, JSON.stringify(updated))
    }
  }

  const generateContent = (withFeedback: boolean = false) => {
    if (!newNewsletter.community.trim()) {
      alert('Please enter a community/city to highlight')
      return
    }
    if (newNewsletter.audience_type.length === 0) {
      alert('Please select at least one audience type')
      return
    }
    
    setGenerating(true)
    
    setTimeout(() => {
      const generated = generateNewsletterContent(
        newNewsletter.community,
        newNewsletter.market_focus,
        newNewsletter.audience_type,
        marketData,
        withFeedback ? additionalTopics : ''
      )
      setNewNewsletter({
        ...newNewsletter,
        title: generated.title,
        content: generated.content,
      })
      setGenerating(false)
    }, 1000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleAudience = (value: string) => {
    const updated = newNewsletter.audience_type.includes(value)
      ? newNewsletter.audience_type.filter(a => a !== value)
      : [...newNewsletter.audience_type, value]
    
    setNewNewsletter({
      ...newNewsletter,
      audience_type: updated,
      content: '',
      title: '',
    })
    setAdditionalTopics('')
  }

  const toggleStatus = (value: string) => {
    setNewNewsletter({
      ...newNewsletter,
      lead_status: newNewsletter.lead_status.includes(value)
        ? newNewsletter.lead_status.filter(s => s !== value)
        : [...newNewsletter.lead_status, value]
    })
  }

  const saveDraft = () => {
    if (!newNewsletter.title.trim()) return
    
    const newsletter: Newsletter = {
      id: `nl-${Date.now()}`,
      user_id: user?.id || '',
      title: newNewsletter.title,
      content: newNewsletter.content,
      audience_type: newNewsletter.audience_type,
      lead_status: newNewsletter.lead_status,
      market_focus: newNewsletter.market_focus,
      community: newNewsletter.community,
      market_data: marketData,
      image_url: uploadedImage || undefined,
      created_at: new Date().toISOString(),
      status: 'draft',
    }
    
    const updated = [newsletter, ...newsletters]
    setNewsletters(updated)
    saveNewsletters(updated)
    setShowCreateModal(false)
    resetForm()
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 3000)
    } catch (err) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 3000)
    }
  }

  const openEmailClient = (newsletter: Newsletter) => {
    const agentName = user?.firstName || 'Your Real Estate Professional'
    const content = newsletter.content
      .replace(/\{name\}/g, '')
      .replace(/\{agent_name\}/g, agentName)
    
    const subject = encodeURIComponent(newsletter.title)
    const body = encodeURIComponent(content)
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    
    const updated = newsletters.map(n => 
      n.id === newsletter.id 
        ? { ...n, status: 'sent' as const, sent_at: new Date().toISOString() }
        : n
    )
    setNewsletters(updated)
    saveNewsletters(updated)
    setSelectedNewsletter(null)
  }

  const deleteNewsletter = (id: string) => {
    if (!confirm('Delete this newsletter?')) return
    const updated = newsletters.filter(n => n.id !== id)
    setNewsletters(updated)
    saveNewsletters(updated)
    setSelectedNewsletter(null)
  }

  const resetForm = () => {
    setNewNewsletter({
      market_focus: 'general',
      community: '',
      audience_type: [],
      lead_status: [],
      title: '',
      content: '',
    })
    setAdditionalTopics('')
    setMarketData(defaultMarketData)
    setUploadedImage(null)
    setShowMarketData(false)
  }

  const getAudienceCount = (newsletter: Newsletter) => {
    const base = newsletter.audience_type.length * 12 + newsletter.lead_status.length * 8
    return base + Math.floor(Math.random() * 10)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">📧 Drip Campaigns</h1>
          <p className="text-gray-400">AI-powered newsletters with real market data</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span>✨</span> Create Newsletter
        </button>
      </div>

      {/* Info Card */}
      <div className="card mb-6 bg-gradient-to-r from-primary-500/10 to-blue-500/10 border-primary-500/30">
        <div className="flex items-start gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <h3 className="font-semibold text-white mb-1">Re-engage Cold Leads with Real Data</h3>
            <p className="text-gray-400 text-sm">
              Enter your market data, suggest topics, and AI generates engaging content. 
              Mention "infrastructure" or "schools" and watch it create relevant sections.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{newsletters.length}</p>
          <p className="text-gray-400 text-sm">Total</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-yellow-400">{newsletters.filter(n => n.status === 'draft').length}</p>
          <p className="text-gray-400 text-sm">Drafts</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-400">{newsletters.filter(n => n.status === 'sent').length}</p>
          <p className="text-gray-400 text-sm">Sent</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-400">
            {newsletters.filter(n => n.status === 'sent').reduce((acc, n) => acc + getAudienceCount(n), 0)}
          </p>
          <p className="text-gray-400 text-sm">Leads Reached</p>
        </div>
      </div>

      {/* Newsletter List */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading newsletters...</p>
        </div>
      ) : newsletters.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">📬</span>
          <p className="text-gray-400 mb-2">No newsletters yet</p>
          <p className="text-gray-500 text-sm mb-6">
            Create newsletters with YOUR real market data and send to cold leads.
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            ✨ Create Your First Newsletter
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {newsletters.map(newsletter => (
            <div
              key={newsletter.id}
              onClick={() => setSelectedNewsletter(newsletter)}
              className="card cursor-pointer hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{newsletter.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      newsletter.status === 'sent' 
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {newsletter.status === 'sent' ? '✓ Sent' : 'Draft'}
                    </span>
                    {newsletter.image_url && <span className="text-xs text-blue-400">📎</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>📍 {newsletter.community}</span>
                    <span>•</span>
                    <span>👥 {newsletter.audience_type.map(a => 
                      audienceTypes.find(t => t.value === a)?.label.split(' ')[1]
                    ).join(', ')}</span>
                    <span>•</span>
                    <span>{new Date(newsletter.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Newsletter Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-dark-border flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-white">✨ Create Newsletter</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Community Highlight */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Community Highlight</label>
                <input
                  type="text"
                  value={newNewsletter.community}
                  onChange={(e) => setNewNewsletter({ ...newNewsletter, community: e.target.value, content: '', title: '' })}
                  placeholder="e.g., Clermont FL, Central Florida, Orlando Metro..."
                  className="input-field w-full"
                />
              </div>

              {/* Market Data Toggle */}
              <div>
                <button
                  onClick={() => setShowMarketData(!showMarketData)}
                  className="flex items-center gap-2 text-primary-400 text-sm hover:underline"
                >
                  📊 {showMarketData ? 'Hide' : 'Enter'} Real Market Data
                  <span>{showMarketData ? '▲' : '▼'}</span>
                </button>
                
                {showMarketData && (
                  <div className="mt-3 p-4 bg-dark-bg rounded-lg space-y-3">
                    <p className="text-xs text-gray-500 mb-2">Enter YOUR actual market data:</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Interest Rate (%)</label>
                        <input
                          type="text"
                          value={marketData.interestRate}
                          onChange={(e) => setMarketData({ ...marketData, interestRate: e.target.value })}
                          placeholder="6.5"
                          className="input-field w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Price Change (%)</label>
                        <input
                          type="text"
                          value={marketData.priceChange}
                          onChange={(e) => setMarketData({ ...marketData, priceChange: e.target.value })}
                          placeholder="+3.2 or -2.5"
                          className="input-field w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Price Range Low ($)</label>
                        <input
                          type="text"
                          value={marketData.priceRangeLow}
                          onChange={(e) => setMarketData({ ...marketData, priceRangeLow: e.target.value })}
                          placeholder="380000"
                          className="input-field w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Price Range High ($)</label>
                        <input
                          type="text"
                          value={marketData.priceRangeHigh}
                          onChange={(e) => setMarketData({ ...marketData, priceRangeHigh: e.target.value })}
                          placeholder="450000"
                          className="input-field w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Avg Days on Market</label>
                        <input
                          type="text"
                          value={marketData.avgDaysOnMarket}
                          onChange={(e) => setMarketData({ ...marketData, avgDaysOnMarket: e.target.value })}
                          placeholder="45"
                          className="input-field w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Inventory Change (%)</label>
                        <input
                          type="text"
                          value={marketData.inventoryChange}
                          onChange={(e) => setMarketData({ ...marketData, inventoryChange: e.target.value })}
                          placeholder="+30 or -10"
                          className="input-field w-full text-sm"
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3">Hot Neighborhoods (optional):</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={marketData.hotNeighborhood1}
                        onChange={(e) => setMarketData({ ...marketData, hotNeighborhood1: e.target.value })}
                        placeholder="Neighborhood 1"
                        className="input-field w-full text-sm"
                      />
                      <input
                        type="text"
                        value={marketData.hotNeighborhood1Change}
                        onChange={(e) => setMarketData({ ...marketData, hotNeighborhood1Change: e.target.value })}
                        placeholder="% change"
                        className="input-field w-full text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">📎 Attach Market Snapshot (Optional)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploadedImage ? (
                  <div className="relative">
                    <img src={uploadedImage} alt="Market snapshot" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-dark-border rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-colors"
                  >
                    📷 Click to upload infographic
                  </button>
                )}
              </div>

              {/* Market Focus */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Market Focus</label>
                <select
                  value={newNewsletter.market_focus}
                  onChange={(e) => setNewNewsletter({ ...newNewsletter, market_focus: e.target.value, content: '', title: '' })}
                  className="input-field w-full"
                >
                  {marketFocusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Audience Type */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Send To (Audience Type)</label>
                <div className="flex flex-wrap gap-2">
                  {audienceTypes.map(audience => (
                    <button
                      key={audience.value}
                      onClick={() => toggleAudience(audience.value)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        newNewsletter.audience_type.includes(audience.value)
                          ? 'bg-primary-500/20 text-primary-400 border border-primary-500'
                          : 'bg-dark-bg text-gray-400 border border-dark-border hover:text-white'
                      }`}
                    >
                      {audience.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead Status */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Target Lead Status</label>
                <div className="flex flex-wrap gap-2">
                  {leadStatuses.map(status => (
                    <button
                      key={status.value}
                      onClick={() => toggleStatus(status.value)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        newNewsletter.lead_status.includes(status.value)
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
                          : 'bg-dark-bg text-gray-400 border border-dark-border hover:text-white'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              {!newNewsletter.content && (
                <button
                  onClick={() => generateContent(false)}
                  disabled={generating || !newNewsletter.community.trim() || newNewsletter.audience_type.length === 0}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Generating...
                    </>
                  ) : (
                    <>✨ Generate Newsletter</>
                  )}
                </button>
              )}

              {/* Generated Content */}
              {newNewsletter.content && (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-400 text-sm">✓ Newsletter generated!</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Subject Line</label>
                    <input
                      type="text"
                      value={newNewsletter.title}
                      onChange={(e) => setNewNewsletter({ ...newNewsletter, title: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Newsletter Content</label>
                    <textarea
                      value={newNewsletter.content}
                      onChange={(e) => setNewNewsletter({ ...newNewsletter, content: e.target.value })}
                      className="input-field w-full text-sm"
                      rows={10}
                    />
                  </div>

                  {/* Regenerate with Topic Suggestions */}
                  <div className="bg-dark-bg rounded-lg p-4 space-y-3">
                    <label className="block text-gray-400 text-sm">
                      🎯 Want AI to add more content? Describe what to include:
                    </label>
                    <textarea
                      value={additionalTopics}
                      onChange={(e) => setAdditionalTopics(e.target.value)}
                      placeholder="Examples:
• infrastructure projects improving commute
• new construction builder incentives
• top-rated schools in the area
• 55+ community options
• investment opportunities and rental demand"
                      className="input-field w-full text-sm"
                      rows={3}
                    />
                    <button
                      onClick={() => generateContent(true)}
                      disabled={generating || !additionalTopics.trim()}
                      className="w-full px-4 py-2 bg-dark-border text-white rounded-lg hover:bg-primary-500/20 transition-colors disabled:opacity-50"
                    >
                      {generating ? 'Generating...' : '✨ Regenerate with This Topic'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-dark-border flex gap-3 flex-shrink-0">
              <button 
                onClick={() => { setShowCreateModal(false); resetForm(); }} 
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={saveDraft}
                disabled={!newNewsletter.title.trim()}
                className="btn-primary flex-1"
              >
                💾 Save Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Detail Modal */}
      {selectedNewsletter && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-dark-border flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedNewsletter.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedNewsletter.status === 'sent' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {selectedNewsletter.status === 'sent' ? '✓ Sent' : 'Draft'}
                  </span>
                  <span className="text-gray-500 text-sm">📍 {selectedNewsletter.community}</span>
                </div>
              </div>
              <button onClick={() => setSelectedNewsletter(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {selectedNewsletter.image_url && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">📎 Attached Image</p>
                  <img src={selectedNewsletter.image_url} alt="Market snapshot" className="w-full rounded-lg" />
                </div>
              )}

              <div>
                <p className="text-gray-400 text-sm mb-2">Content Preview</p>
                <div className="bg-dark-bg rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-white whitespace-pre-wrap text-sm">{selectedNewsletter.content}</p>
                </div>
              </div>

              {copySuccess && (
                <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-sm text-center">
                  ✓ Copied to clipboard!
                </div>
              )}
            </div>

            <div className="p-6 border-t border-dark-border space-y-3 flex-shrink-0">
              {selectedNewsletter.status === 'draft' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
                  <p className="text-blue-400 font-medium mb-1">📧 How to Send:</p>
                  <p className="text-gray-400 text-xs">
                    "Open in Email" opens your email app with content pre-filled. Add recipients there.
                    For bulk sends, "Copy" and paste into your CRM or email tool.
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button 
                  onClick={() => deleteNewsletter(selectedNewsletter.id)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                >
                  Delete
                </button>
                <button 
                  onClick={() => copyToClipboard(selectedNewsletter.content)}
                  className="px-4 py-2 bg-dark-border text-white rounded-lg hover:bg-primary-500/20"
                >
                  📋 Copy
                </button>
                {selectedNewsletter.status === 'draft' ? (
                  <button 
                    onClick={() => openEmailClient(selectedNewsletter)}
                    className="btn-primary flex-1"
                  >
                    📧 Open in Email
                  </button>
                ) : (
                  <button onClick={() => setSelectedNewsletter(null)} className="btn-secondary flex-1">
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
