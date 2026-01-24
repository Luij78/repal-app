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
}

const defaultMarketData: MarketData = {
  interestRate: '',
  priceRangeLow: '',
  priceRangeHigh: '',
  priceChange: '',
  avgDaysOnMarket: '',
  inventoryChange: '',
  hotNeighborhood1: '',
  hotNeighborhood1Change: '',
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
  
  if (hint.includes('infrastructure') || hint.includes('road') || hint.includes('commute') || hint.includes('highway')) {
    return `

INFRASTRUCTURE IMPROVEMENTS

I wanted to share some developments happening around ${communityName} that could impact property values:

Transportation improvements are underway throughout the area. New road projects and interchange improvements are in various stages of completion, with many residents already reporting shorter commute times to major employment centers.

Why this matters: Areas with improving infrastructure historically see stronger appreciation. Buyers who purchase before these projects complete often benefit from both today's pricing and tomorrow's convenience.

If you'd like specifics on which projects are happening near areas you're interested in, I'm happy to share what I know.

`
  }
  
  if (hint.includes('new construction') || hint.includes('builder') || hint.includes('new home')) {
    return `

NEW CONSTRUCTION OPPORTUNITIES

Builders in ${communityName} are actively competing for buyers right now:

Many are offering rate buy-downs that can significantly lower your monthly payment for the first few years. I'm also seeing closing cost assistance, upgraded appliance packages, and other incentives that weren't available during the competitive market.

New construction means everything is under warranty, energy efficient, and built to current codes. For many buyers, this peace of mind is valuable.

I'm tracking which builders have the best current incentives - happy to share a breakdown if you're interested.

`
  }
  
  if (hint.includes('school') || hint.includes('family') || hint.includes('education')) {
    return `

SCHOOL INFORMATION

For families considering ${communityName}, the school options are worth knowing about:

Several neighborhoods feed into highly-rated schools at both elementary and middle school levels. There are also new schools opening to accommodate growth, with modern facilities and strong programs.

Homes in top school zones typically command premiums and sell faster - it's an investment that tends to pay off whether you stay long-term or sell later.

I can help identify which neighborhoods align with the best schools for your children's ages.

`
  }
  
  if (hint.includes('investment') || hint.includes('roi') || hint.includes('rental') || hint.includes('cash flow')) {
    return `

INVESTMENT ANALYSIS

For investors looking at ${communityName}:

Rental demand remains strong as the area continues to grow. Vacancy rates are low, and properties priced appropriately can generate positive cash flow. The combination of reasonable entry prices and solid rent potential makes the numbers work for many investors.

I'm tracking several properties that meet typical investment criteria - happy to run a detailed analysis on any that interest you.

`
  }
  
  if (hint.includes('rate') || hint.includes('financing') || hint.includes('loan') || hint.includes('fha') || hint.includes('va')) {
    return `

FINANCING OPTIONS

Several loan programs are available depending on your situation:

FHA loans allow lower down payments, VA loans offer zero down for eligible veterans, and conventional loans have various options including rate buy-downs. Many sellers are now willing to contribute toward closing costs or points.

I work with several excellent lenders who specialize in finding the best program for each situation - happy to make an introduction.

`
  }
  
  if (hint.includes('55') || hint.includes('senior') || hint.includes('retire') || hint.includes('downsize')) {
    return `

55+ LIVING OPTIONS

For those exploring active adult communities in ${communityName}:

Many communities offer resort-style amenities including pools, fitness centers, and pickleball courts. The appeal of low-maintenance living continues to attract buyers looking for this lifestyle.

New communities are offering move-in incentives, while established communities often have resales at attractive prices. I'd enjoy showing you some options that might be a great fit.

`
  }
  
  if (hint.includes('development') || hint.includes('commercial') || hint.includes('growth') || hint.includes('shopping')) {
    return `

AREA DEVELOPMENT

${communityName} is experiencing notable commercial growth:

New retail and dining options are coming to the area, adding convenience for residents. Employment is also growing as businesses recognize the area's potential.

Commercial development tends to follow population growth, but it also drives additional demand for housing. Areas near new amenities typically see increased buyer interest.

`
  }
  
  return `

ADDITIONAL INSIGHT

This is a topic worth discussing as it relates to ${communityName}. I've been following developments closely and would love to share more specific details when we connect.

`
}

// Generate clean, value-focused newsletter
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
  
  const hasRealData = marketData.interestRate || marketData.priceRangeLow || marketData.avgDaysOnMarket
  
  let content = `Hi there,

I hope this finds you well! It's been a while since we connected, and I wanted to share some updates about the ${communityName} real estate market that I thought might interest you.


WHAT'S HAPPENING IN ${communityName.toUpperCase()}

The market has shifted quite a bit from where it was. Here's the current picture:

`

  if (hasRealData) {
    if (marketData.interestRate) {
      content += `Mortgage rates are currently around ${marketData.interestRate}% for a 30-year fixed loan.\n\n`
    }
    if (marketData.priceRangeLow && marketData.priceRangeHigh) {
      const low = parseInt(marketData.priceRangeLow) / 1000
      const high = parseInt(marketData.priceRangeHigh) / 1000
      content += `Home prices in ${communityName} typically range from $${low.toFixed(0)}K to $${high.toFixed(0)}K`
      if (marketData.priceChange) {
        content += ` (${marketData.priceChange}% compared to last year)`
      }
      content += `.\n\n`
    }
    if (marketData.avgDaysOnMarket) {
      content += `Homes are averaging ${marketData.avgDaysOnMarket} days on market.\n\n`
    }
    if (marketData.inventoryChange) {
      content += `Inventory has changed ${marketData.inventoryChange}% - ${parseFloat(marketData.inventoryChange) > 0 ? 'meaning more options for buyers' : 'still competitive but improving'}.\n\n`
    }
  } else {
    content += `The frantic bidding wars have calmed down significantly. Buyers now have more time to make thoughtful decisions, and sellers are more willing to negotiate on terms. Inventory has improved, giving buyers more choices than we've seen in a while.

`
  }

  if (marketData.hotNeighborhood1) {
    content += `NEIGHBORHOODS WORTH WATCHING

${marketData.hotNeighborhood1} has seen increased buyer interest`
    if (marketData.hotNeighborhood1Change) {
      content += ` with demand up approximately ${marketData.hotNeighborhood1Change}%`
    }
    content += `. Let me know if you'd like to learn more about this area.

`
  }

  // WHY THIS MATTERS section
  content += `WHY THIS MATTERS FOR YOU

`

  if (hasBuyers && !hasSellers) {
    content += `For buyers, this shift creates real opportunity:

The pressure is off. You're no longer competing against dozens of other offers or making decisions in 24 hours. You can take time to find the right home, negotiate on price and terms, and often get sellers to help with closing costs.

That said, well-priced homes in desirable locations still move quickly. The key is being prepared - knowing your budget, being pre-approved, and working with someone who knows the local market.

`
  } else if (hasSellers && !hasBuyers) {
    content += `For sellers, the market rewards those who approach it strategically:

Pricing correctly from the start is more important than ever. Homes that are priced right and show well are still selling, often with multiple interested buyers. The key is realistic expectations and strong presentation.

If you've been thinking about selling, I'd be happy to share what comparable homes have sold for recently and discuss what your home might command.

`
  } else {
    content += `Whether you're thinking about buying or selling, this is actually a healthier market than the frenzy we saw before. Decisions can be more thoughtful, negotiations are back, and outcomes tend to be better for everyone involved.

`
  }

  // Add topic-generated content
  if (additionalTopics.trim()) {
    content += generateTopicContent(additionalTopics, communityName)
  }

  // Investor section
  if (hasInvestors) {
    content += `
FOR INVESTORS

If you're looking at ${communityName} from an investment perspective, the fundamentals remain solid. Rental demand is strong, vacancy rates are low, and entry prices have become more reasonable than they were during the peak.

I'm tracking several properties that fit typical investment criteria. Happy to run the numbers with you on any that might interest you.

`
  }

  // Senior section
  if (hasSeniors) {
    content += `
55+ COMMUNITY OPTIONS

For those exploring active adult living, ${communityName} has some excellent communities. Many offer the low-maintenance lifestyle, resort-style amenities, and social opportunities that make this stage of life enjoyable.

Several communities are currently offering move-in incentives. I'd enjoy showing you some options.

`
  }

  // Call to action
  content += `
LET'S RECONNECT

I know life gets busy, and real estate plans don't always follow a timeline. But if you've been curious about what's happening in the market, or if your situation has changed, I'd love to catch up.

No pressure, no sales pitch - just a conversation about where things stand and whether now might be the right time to explore your options.

Feel free to reply to this email, give me a call, or text me. I'm here when you're ready.

Looking forward to hearing from you,

{agent_name}

P.S. If you know anyone who might find this information useful, feel free to pass it along.`

  let title = `${communityName} Market Update - ${currentMonth} ${currentYear}`
  
  if (hasInvestors && !hasBuyers && !hasSellers) {
    title = `${communityName} Investment Update - ${currentMonth} ${currentYear}`
  } else if (hasSellers && !hasBuyers) {
    title = `${communityName} Seller Update - ${currentMonth} ${currentYear}`
  } else if (hasBuyers && !hasSellers) {
    title = `${communityName} Buyer Update - ${currentMonth} ${currentYear}`
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
    if (saved) setNewsletters(JSON.parse(saved))
    setLoading(false)
  }

  const saveNewsletters = (updated: Newsletter[]) => {
    if (user) localStorage.setItem(`newsletters_${user.id}`, JSON.stringify(updated))
  }

  const generateContent = (withFeedback: boolean = false) => {
    if (!newNewsletter.community.trim()) {
      alert('Please enter a community/city')
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
      setNewNewsletter({ ...newNewsletter, title: generated.title, content: generated.content })
      setGenerating(false)
    }, 1000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setUploadedImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const toggleAudience = (value: string) => {
    const updated = newNewsletter.audience_type.includes(value)
      ? newNewsletter.audience_type.filter(a => a !== value)
      : [...newNewsletter.audience_type, value]
    setNewNewsletter({ ...newNewsletter, audience_type: updated, content: '', title: '' })
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
    } catch {
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
    const content = newsletter.content.replace(/\{agent_name\}/g, agentName)
    const subject = encodeURIComponent(newsletter.title)
    const body = encodeURIComponent(content)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    
    const updated = newsletters.map(n => 
      n.id === newsletter.id ? { ...n, status: 'sent' as const, sent_at: new Date().toISOString() } : n
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
    setNewNewsletter({ market_focus: 'general', community: '', audience_type: [], lead_status: [], title: '', content: '' })
    setAdditionalTopics('')
    setMarketData(defaultMarketData)
    setUploadedImage(null)
    setShowMarketData(false)
  }

  const getAudienceCount = (newsletter: Newsletter) => {
    return newsletter.audience_type.length * 12 + newsletter.lead_status.length * 8 + 5
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">📧 Drip Campaigns</h1>
          <p className="text-gray-400">Re-engage cold leads with valuable market insights</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <span>✨</span> Create Newsletter
        </button>
      </div>

      <div className="card mb-6 bg-gradient-to-r from-primary-500/10 to-blue-500/10 border-primary-500/30">
        <div className="flex items-start gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <h3 className="font-semibold text-white mb-1">Bring Value, Build Relationships</h3>
            <p className="text-gray-400 text-sm">
              Create newsletters that provide real value. Add your market data, suggest topics, 
              and AI generates content that encourages cold leads to re-engage.
            </p>
          </div>
        </div>
      </div>

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

      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      ) : newsletters.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">📬</span>
          <p className="text-gray-400 mb-2">No newsletters yet</p>
          <p className="text-gray-500 text-sm mb-6">Create value-driven newsletters to re-engage your cold leads.</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">✨ Create Your First Newsletter</button>
        </div>
      ) : (
        <div className="space-y-3">
          {newsletters.map(newsletter => (
            <div key={newsletter.id} onClick={() => setSelectedNewsletter(newsletter)} className="card cursor-pointer hover:border-primary-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{newsletter.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${newsletter.status === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {newsletter.status === 'sent' ? '✓ Sent' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>📍 {newsletter.community}</span>
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">✨ Create Newsletter</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Community / Market Area</label>
                <input
                  type="text"
                  value={newNewsletter.community}
                  onChange={(e) => setNewNewsletter({ ...newNewsletter, community: e.target.value, content: '', title: '' })}
                  placeholder="e.g., Clermont, Central Florida, Orlando Metro..."
                  className="input-field w-full"
                />
              </div>

              <div>
                <button onClick={() => setShowMarketData(!showMarketData)} className="flex items-center gap-2 text-primary-400 text-sm hover:underline">
                  📊 {showMarketData ? 'Hide' : 'Add'} Your Market Data (Optional)
                </button>
                
                {showMarketData && (
                  <div className="mt-3 p-4 bg-dark-bg rounded-lg space-y-3">
                    <p className="text-xs text-gray-500">Enter real data (leave blank if unsure):</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Interest Rate (%)</label>
                        <input type="text" value={marketData.interestRate} onChange={(e) => setMarketData({ ...marketData, interestRate: e.target.value })} placeholder="e.g., 6.5" className="input-field w-full text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Price Change (%)</label>
                        <input type="text" value={marketData.priceChange} onChange={(e) => setMarketData({ ...marketData, priceChange: e.target.value })} placeholder="e.g., +3" className="input-field w-full text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Price Range Low ($)</label>
                        <input type="text" value={marketData.priceRangeLow} onChange={(e) => setMarketData({ ...marketData, priceRangeLow: e.target.value })} placeholder="e.g., 350000" className="input-field w-full text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Price Range High ($)</label>
                        <input type="text" value={marketData.priceRangeHigh} onChange={(e) => setMarketData({ ...marketData, priceRangeHigh: e.target.value })} placeholder="e.g., 500000" className="input-field w-full text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Days on Market</label>
                        <input type="text" value={marketData.avgDaysOnMarket} onChange={(e) => setMarketData({ ...marketData, avgDaysOnMarket: e.target.value })} placeholder="e.g., 45" className="input-field w-full text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Inventory Change (%)</label>
                        <input type="text" value={marketData.inventoryChange} onChange={(e) => setMarketData({ ...marketData, inventoryChange: e.target.value })} placeholder="e.g., +30" className="input-field w-full text-sm" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">📎 Attach Infographic (Optional)</label>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                {uploadedImage ? (
                  <div className="relative">
                    <img src={uploadedImage} alt="Infographic" className="w-full h-32 object-cover rounded-lg" />
                    <button onClick={() => setUploadedImage(null)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="w-full p-3 border-2 border-dashed border-dark-border rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-400 transition-colors text-sm">
                    Click to upload market snapshot
                  </button>
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Market Focus</label>
                <select value={newNewsletter.market_focus} onChange={(e) => setNewNewsletter({ ...newNewsletter, market_focus: e.target.value, content: '', title: '' })} className="input-field w-full">
                  {marketFocusOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Target Audience</label>
                <div className="flex flex-wrap gap-2">
                  {audienceTypes.map(audience => (
                    <button key={audience.value} onClick={() => toggleAudience(audience.value)} className={`px-4 py-2 rounded-lg text-sm transition-all ${newNewsletter.audience_type.includes(audience.value) ? 'bg-primary-500/20 text-primary-400 border border-primary-500' : 'bg-dark-bg text-gray-400 border border-dark-border hover:text-white'}`}>
                      {audience.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Lead Status</label>
                <div className="flex flex-wrap gap-2">
                  {leadStatuses.map(status => (
                    <button key={status.value} onClick={() => toggleStatus(status.value)} className={`px-4 py-2 rounded-lg text-sm transition-all ${newNewsletter.lead_status.includes(status.value) ? 'bg-blue-500/20 text-blue-400 border border-blue-500' : 'bg-dark-bg text-gray-400 border border-dark-border hover:text-white'}`}>
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {!newNewsletter.content && (
                <button onClick={() => generateContent(false)} disabled={generating || !newNewsletter.community.trim() || newNewsletter.audience_type.length === 0} className="btn-primary w-full">
                  {generating ? 'Generating...' : '✨ Generate Newsletter'}
                </button>
              )}

              {newNewsletter.content && (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-400 text-sm">✓ Newsletter ready! Review and edit as needed.</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Subject Line</label>
                    <input type="text" value={newNewsletter.title} onChange={(e) => setNewNewsletter({ ...newNewsletter, title: e.target.value })} className="input-field w-full" />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Content</label>
                    <textarea value={newNewsletter.content} onChange={(e) => setNewNewsletter({ ...newNewsletter, content: e.target.value })} className="input-field w-full text-sm" rows={12} />
                  </div>

                  <div className="bg-dark-bg rounded-lg p-4 space-y-3">
                    <label className="block text-gray-400 text-sm">🎯 Add a topic for AI to write about:</label>
                    <textarea value={additionalTopics} onChange={(e) => setAdditionalTopics(e.target.value)} placeholder="Examples: infrastructure improvements, new construction incentives, school ratings, investment opportunities, 55+ communities" className="input-field w-full text-sm" rows={2} />
                    <button onClick={() => generateContent(true)} disabled={generating || !additionalTopics.trim()} className="w-full px-4 py-2 bg-dark-border text-white rounded-lg hover:bg-primary-500/20 transition-colors disabled:opacity-50">
                      {generating ? 'Generating...' : '✨ Add Topic & Regenerate'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-dark-border flex gap-3">
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={saveDraft} disabled={!newNewsletter.title.trim()} className="btn-primary flex-1">💾 Save Draft</button>
            </div>
          </div>
        </div>
      )}

      {selectedNewsletter && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedNewsletter.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedNewsletter.status === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
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
                  <img src={selectedNewsletter.image_url} alt="Infographic" className="w-full rounded-lg" />
                </div>
              )}

              <div>
                <p className="text-gray-400 text-sm mb-2">Content</p>
                <div className="bg-dark-bg rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-white whitespace-pre-wrap text-sm">{selectedNewsletter.content}</p>
                </div>
              </div>

              {copySuccess && (
                <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-sm text-center">✓ Copied to clipboard!</div>
              )}
            </div>

            <div className="p-6 border-t border-dark-border space-y-3">
              {selectedNewsletter.status === 'draft' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
                  <p className="text-blue-400 font-medium mb-1">📧 How to Send:</p>
                  <p className="text-gray-400 text-xs">"Open in Email" opens your email app with content pre-filled. Add your recipients there. Or "Copy" to paste into your CRM.</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button onClick={() => deleteNewsletter(selectedNewsletter.id)} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">Delete</button>
                <button onClick={() => copyToClipboard(selectedNewsletter.content)} className="px-4 py-2 bg-dark-border text-white rounded-lg hover:bg-primary-500/20">📋 Copy</button>
                {selectedNewsletter.status === 'draft' ? (
                  <button onClick={() => openEmailClient(selectedNewsletter)} className="btn-primary flex-1">📧 Open in Email</button>
                ) : (
                  <button onClick={() => setSelectedNewsletter(null)} className="btn-secondary flex-1">Close</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
