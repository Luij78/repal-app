'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CoachPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [customQuestion, setCustomQuestion] = useState('')
  const [coachResponse, setCoachResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const topics = [
    { id: 'objections', icon: '🛡️', title: 'Handle Objections', desc: 'Scripts for common buyer/seller objections' },
    { id: 'listing', icon: '🏠', title: 'Listing Presentation', desc: 'Win more listings with proven scripts' },
    { id: 'fsbo', icon: '📋', title: 'FSBO Conversion', desc: 'Convert For Sale By Owners' },
    { id: 'expired', icon: '⏰', title: 'Expired Listings', desc: 'Scripts for expired listing outreach' },
    { id: 'cold-calling', icon: '📞', title: 'Cold Calling', desc: 'Effective phone prospecting scripts' },
    { id: 'negotiation', icon: '🤝', title: 'Negotiation', desc: 'Close deals with better terms' },
    { id: 'sphere', icon: '👥', title: 'Sphere of Influence', desc: 'Nurture your network for referrals' },
    { id: 'buyer', icon: '🔑', title: 'Buyer Consultation', desc: 'Convert buyer leads to clients' },
  ]

  const scripts: Record<string, { title: string; content: string }[]> = {
    objections: [
      { title: '"I want to think about it"', content: 'I completely understand. What specific aspects would you like to think through? Sometimes talking through concerns can help bring clarity.' },
      { title: '"Your commission is too high"', content: 'I appreciate you bringing that up. My commission reflects the comprehensive marketing plan, professional photography, and full-time dedication I provide. Would you like me to walk you through exactly what you\'re getting for that investment?' },
      { title: '"We\'re just looking right now"', content: 'That\'s great! The best time to start is before you\'re under pressure. Would it be helpful if I sent you listings that match your criteria so you can see what\'s available in your price range?' },
    ],
    listing: [
      { title: 'Opening Statement', content: 'Thank you for inviting me to your beautiful home today. I\'ve done my research on your neighborhood and I\'m excited to share my marketing plan. Before I begin, what questions do you have for me?' },
      { title: 'Why Choose Me', content: 'What sets me apart is my proactive communication style and aggressive marketing approach. I don\'t just list homes, I market them. My average days on market is significantly lower than the area average because of my targeted digital marketing strategy.' },
    ],
    fsbo: [
      { title: 'Initial Contact', content: 'Hi, I noticed your home is for sale. I\'m not calling to list your property - I actually have buyers looking in your area. Would you be open to allowing me to show your home to my qualified buyers?' },
      { title: 'Follow Up', content: 'How\'s your sale going? I\'ve been tracking your listing and wanted to check in. The market has shifted a bit recently - would you be open to a quick call to discuss what I\'m seeing?' },
    ],
    expired: [
      { title: 'First Call', content: 'Hi, I noticed your listing expired and I\'m sure that\'s frustrating. I\'ve been studying your property and I have some ideas on what might have been missing from the marketing. Would you be open to a brief meeting?' },
    ],
    'cold-calling': [
      { title: 'Circle Prospecting', content: 'Hi, I\'m [Name] with [Brokerage]. I just sold a home in your neighborhood and I\'m calling to see if you know anyone thinking about buying or selling?' },
    ],
    negotiation: [
      { title: 'Multiple Offers', content: 'Great news! We have multiple offers. To give you the strongest position, I recommend we call for highest and best by [time]. This creates urgency while being fair to all parties.' },
    ],
    sphere: [
      { title: 'Monthly Check-in', content: 'Hi [Name]! I was just thinking about you and wanted to check in. How are things going? By the way, if you know anyone thinking about buying or selling, I\'d love an introduction!' },
    ],
    buyer: [
      { title: 'Opening', content: 'Thanks for meeting with me today! Before we look at homes, I want to understand exactly what you\'re looking for so I can find the perfect match. Tell me about your ideal home...' },
    ],
  }

  const getCoachingAdvice = async () => {
    if (!customQuestion.trim()) return
    
    setIsLoading(true)
    setCoachResponse('')
    
    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: customQuestion })
      })
      
      if (!response.ok) throw new Error('Failed to get advice')
      
      const data = await response.json()
      setCoachResponse(data.advice)
    } catch (error) {
      setCoachResponse('Sorry, I couldn\'t get coaching advice right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">🎯 REPal Coach</h1>
          <p className="text-gray-400 text-sm">Scripts, tips, and guidance for real estate success</p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
      </div>

      {/* Topic Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {topics.map(topic => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedTopic === topic.id 
                ? 'bg-primary-500/20 border-primary-500' 
                : 'bg-gradient-to-br from-dark-card to-[#1F1F1F] border-dark-border hover:border-primary-500/30'
            }`}
          >
            <span className="text-2xl mb-2 block">{topic.icon}</span>
            <h3 className="text-white font-medium text-sm mb-1">{topic.title}</h3>
            <p className="text-xs text-gray-500">{topic.desc}</p>
          </button>
        ))}
      </div>

      {/* Scripts Section */}
      {selectedTopic && scripts[selectedTopic] && (
        <div className="space-y-4 mb-8">
          <h2 className="font-playfair text-xl text-white mb-4">
            {topics.find(t => t.id === selectedTopic)?.icon} {topics.find(t => t.id === selectedTopic)?.title} Scripts
          </h2>
          {scripts[selectedTopic].map((script, idx) => (
            <div key={idx} className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-5 border border-dark-border">
              <h3 className="text-primary-400 font-semibold mb-3">{script.title}</h3>
              <p className="text-gray-300 leading-relaxed mb-4">{script.content}</p>
              <button 
                onClick={() => navigator.clipboard.writeText(script.content)}
                className="px-4 py-2 bg-[#4ECDC4]/20 text-[#4ECDC4] rounded-lg text-sm font-semibold hover:bg-[#4ECDC4]/30 transition-colors"
              >
                📋 Copy Script
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ask a Question */}
      <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-5 border border-dark-border">
        <h3 className="text-primary-400 font-semibold mb-4">💬 Ask REPal Coach</h3>
        <p className="text-gray-400 text-sm mb-4">Have a specific scenario? Describe it and get personalized guidance.</p>
        <textarea
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          placeholder="e.g., A seller says my commission is too high and their neighbor only paid 4%. How should I respond?"
          className="w-full min-h-[100px] px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500 resize-y mb-4"
        />
        <button 
          onClick={getCoachingAdvice}
          disabled={isLoading || !customQuestion.trim()}
          className="w-full py-3 bg-primary-500 text-dark-bg rounded-lg font-semibold hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '⏳ Getting advice...' : '🎯 Get Coaching Advice'}
        </button>
        
        {coachResponse && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <h4 className="text-green-400 font-semibold mb-2">🎯 Coach Says:</h4>
            <p className="text-gray-300 whitespace-pre-wrap">{coachResponse}</p>
            <button 
              onClick={() => navigator.clipboard.writeText(coachResponse)}
              className="mt-3 px-4 py-2 bg-[#4ECDC4]/20 text-[#4ECDC4] rounded-lg text-sm font-semibold hover:bg-[#4ECDC4]/30 transition-colors"
            >
              📋 Copy Response
            </button>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
        <h3 className="text-blue-400 font-semibold mb-3">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• Practice scripts out loud until they feel natural</li>
          <li>• Personalize scripts with client-specific details</li>
          <li>• Focus on building rapport before pitching</li>
          <li>• Always follow up within 24 hours of any contact</li>
        </ul>
      </div>
    </div>
  )
}
