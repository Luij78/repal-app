'use client'

import { useState, useEffect } from 'react'

const categories = [
  { id: 'daily', name: 'Daily Habits', icon: '☀️', color: '#F59E0B' },
  { id: 'prospecting', name: 'Prospecting', icon: '🎯', color: '#3B82F6' },
  { id: 'farming', name: 'Farming', icon: '🌾', color: '#10B981' },
  { id: 'scripts', name: 'Scripts', icon: '📝', color: '#8B5CF6' },
  { id: 'listing', name: 'Listing', icon: '🏠', color: '#EC4899' },
  { id: 'buyer', name: 'Buyer', icon: '🔑', color: '#06B6D4' },
  { id: 'mindset', name: 'Mindset', icon: '🧠', color: '#F97316' },
]

const dailyChecklist = [
  { id: 1, task: 'Review your goals and affirmations', time: '5 min', priority: 'high' },
  { id: 2, task: 'Check and respond to all leads within 5 minutes', time: '15 min', priority: 'high' },
  { id: 3, task: 'Make 10-20 prospecting calls', time: '1-2 hrs', priority: 'high' },
  { id: 4, task: 'Follow up with active clients', time: '30 min', priority: 'high' },
  { id: 5, task: 'Add 5 new contacts to your database', time: '15 min', priority: 'medium' },
  { id: 6, task: 'Send 3 handwritten notes or cards', time: '15 min', priority: 'medium' },
  { id: 7, task: 'Post on social media (value content)', time: '15 min', priority: 'medium' },
  { id: 8, task: 'Preview 2-3 new listings in your market', time: '1 hr', priority: 'medium' },
  { id: 9, task: 'Practice scripts for 10 minutes', time: '10 min', priority: 'low' },
  { id: 10, task: 'Plan tomorrow before leaving office', time: '10 min', priority: 'high' },
]

const prospectingGuide = [
  { id: 1, category: 'Cold Calling', items: [
    { task: 'Call expired listings (highest priority)', tip: 'Best time: 4-6 PM' },
    { task: 'Call FSBOs (For Sale By Owner)', tip: 'Offer free CMA' },
    { task: 'Circle prospect around new listings', tip: '50-100 homes radius' },
    { task: 'Call past clients for referrals', tip: 'Every 90 days minimum' },
    { task: 'Call sphere of influence', tip: 'Weekly touches' },
  ]},
  { id: 2, category: 'Door Knocking', items: [
    { task: 'Just Listed announcements', tip: 'Knock 50 doors around listing' },
    { task: 'Just Sold announcements', tip: 'Leverage your success' },
    { task: 'Open house invitations', tip: 'Invite neighbors personally' },
    { task: 'Market update drops', tip: 'Monthly in farm area' },
    { task: 'Holiday pop-bys', tip: 'Pie at Thanksgiving, flags July 4th' },
  ]},
  { id: 3, category: 'Open Houses', items: [
    { task: 'Host 2+ open houses per week', tip: 'Weekends 1-4 PM ideal' },
    { task: 'Promote on social media 3 days before', tip: 'Boost posts for $20-50' },
    { task: 'Invite neighbors personally', tip: 'Door knock 50 homes' },
    { task: 'Capture every visitor\'s info', tip: 'Digital sign-in required' },
    { task: 'Follow up within 24 hours', tip: 'Text first, then call' },
  ]},
]

const farmingGuide = [
  { id: 1, title: 'Choose Your Farm Area', items: [
    '500-1000 homes is ideal size',
    'Pick an area you know or want to know',
    'Check turnover rate (aim for 5%+ annually)',
    'Consider proximity to your home/office',
    'Avoid areas dominated by other agents',
  ]},
  { id: 2, title: 'Monthly Farming Activities', items: [
    'Mail market update postcards',
    'Door knock 100+ homes',
    'Sponsor local events/sports teams',
    'Attend HOA and community meetings',
    'Host neighborhood appreciation events',
  ]},
  { id: 3, title: 'Farm Domination Timeline', items: [
    'Month 1-3: Introduce yourself to everyone',
    'Month 4-6: Become known as "the realtor"',
    'Month 7-12: Start getting referrals',
    'Year 2+: Dominate with 20%+ market share',
  ]},
]

const scripts = [
  { id: 'expired', title: 'Expired Listing Script', category: 'Cold Call',
    script: `Hi, this is [Name] with [Brokerage]. I noticed your home at [Address] came off the market. I'm not calling to ask for the listing - I'm calling because I work with buyers actively looking in your area. Would you be open to a quick conversation about what happened?

[If they share frustrations]
I hear that a lot. The market has shifted, and what worked before doesn't work now. I specialize in homes like yours and have a different approach. Would you be open to a 15-minute meeting where I can show you what I'd do differently? No pressure, no obligation.`
  },
  { id: 'fsbo', title: 'FSBO Script', category: 'Cold Call',
    script: `Hi, I'm [Name] with [Brokerage]. I saw your home for sale on [Zillow/sign]. I work with buyers in the area and wanted to ask - are you cooperating with agents who bring buyers?

[If yes]
Great! I have a few buyers who might be interested. What's the best way for agents to schedule showings?

[If no]
I understand wanting to save the commission. Most FSBOs I talk to end up selling for 15-20% less than market value. Would you be open to a free market analysis? No strings attached - just so you know exactly what your home is worth in today's market.`
  },
  { id: 'sphere', title: 'Sphere of Influence Script', category: 'Referral',
    script: `Hey [Name]! It's [Your Name]. How are you doing?

[Small talk]

Listen, I'm reaching out because I'm growing my real estate business this year, and you're someone I really trust. I wanted to ask - do you know anyone thinking about buying or selling in the next few months? I promise to take amazing care of anyone you send my way.

[If they say no]
No problem! Would you mind keeping me in mind if someone mentions real estate? I really appreciate your support.`
  },
  { id: 'buyerlead', title: 'Online Buyer Lead Script', category: 'Lead Response',
    script: `Hi [Name], this is [Your Name] with [Brokerage]. I saw you were looking at [Address/Area] online. Are you still interested in that home?

[If yes]
Great! That's a fantastic [neighborhood/property]. Are you working with an agent yet?

[If no agent]
Perfect. I specialize in that area and know it really well. Would you like to see it this [day]? I can also show you a few similar homes nearby.`
  },
]

const listingChecklist = [
  { id: 1, phase: 'Pre-Listing', items: [
    'Research comparable sales (last 6 months)',
    'Analyze days on market trends',
    'Prepare CMA presentation',
    'Research seller on social media',
    'Drive by property before appointment',
    'Prepare listing presentation materials',
  ]},
  { id: 2, phase: 'Listing Appointment', items: [
    'Tour the entire property first',
    'Compliment something genuine',
    'Ask about their motivation and timeline',
    'Present CMA and pricing strategy',
    'Explain your marketing plan in detail',
    'Handle objections confidently',
    'Get the signature!',
  ]},
  { id: 3, phase: 'Active Listing', items: [
    'Professional photos within 48 hours',
    'Launch on MLS with compelling description',
    'Social media campaign (boosted posts)',
    'Coming soon/Just Listed postcards',
    'Broker preview/caravan',
    'Weekly seller updates (call, not email)',
    'Open houses first 2 weekends',
  ]},
]

const buyerChecklist = [
  { id: 1, phase: 'Initial Consultation', items: [
    'Qualify buyer (timeline, motivation, finances)',
    'Explain buyer representation agreement',
    'Connect with preferred lender',
    'Set up automated MLS search',
    'Discuss realistic expectations',
  ]},
  { id: 2, phase: 'Active Search', items: [
    'Preview homes before showing',
    'Provide market insights during showings',
    'Send new listings within 1 hour',
    'Follow up after each showing',
    'Adjust search criteria as needed',
  ]},
  { id: 3, phase: 'Under Contract', items: [
    'Negotiate offer terms strategically',
    'Coordinate inspections immediately',
    'Monitor contingency deadlines',
    'Communicate with lender weekly',
    'Prepare buyer for closing process',
    'Final walkthrough before closing',
  ]},
]

const mindsetTips = [
  { id: 1, title: 'Morning Routine', tips: [
    'Wake up at the same time daily',
    'Exercise for at least 20 minutes',
    'Review your goals and visualize success',
    'Read 10 pages of a business book',
    'Plan your day before checking email',
  ]},
  { id: 2, title: 'Handling Rejection', tips: [
    'Every "no" gets you closer to "yes"',
    'Rejection is redirection',
    'Track your numbers - success is predictable',
    'Celebrate the activity, not just results',
    'Learn from every conversation',
  ]},
  { id: 3, title: 'Goal Setting', tips: [
    'Set income goal → calculate GCI needed',
    'GCI ÷ avg commission = transactions needed',
    'Transactions × 3 = appointments needed',
    'Appointments × 5 = leads needed',
    'Work backwards to daily activities',
  ]},
]

export default function CoachPage() {
  const [activeCategory, setActiveCategory] = useState('daily')
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({})
  const [showScript, setShowScript] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('repal_coach_progress')
    if (saved) setCompletedItems(JSON.parse(saved))
  }, [])

  const saveProgress = (newProgress: Record<string, boolean>) => {
    setCompletedItems(newProgress)
    localStorage.setItem('repal_coach_progress', JSON.stringify(newProgress))
  }

  const toggleItem = (category: string, itemId: number | string) => {
    const today = new Date().toDateString()
    const key = `${category}-${itemId}-${today}`
    const newProgress = { ...completedItems, [key]: !completedItems[key] }
    saveProgress(newProgress)
  }

  const isCompleted = (category: string, itemId: number | string) => {
    const today = new Date().toDateString()
    const key = `${category}-${itemId}-${today}`
    return completedItems[key] || false
  }

  const completedToday = dailyChecklist.filter(item => isCompleted('daily', item.id)).length
  const progressPercent = Math.round((completedToday / dailyChecklist.length) * 100)

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">🎯 Coach</h1>
        <p className="text-gray-400">Your personal guide to real estate success</p>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-purple-200 text-sm mb-1">Today&apos;s Progress</p>
            <p className="text-3xl font-bold text-white">{completedToday}/{dailyChecklist.length}</p>
          </div>
          <div className="text-5xl">
            {progressPercent >= 100 ? '🏆' : progressPercent >= 50 ? '💪' : '🚀'}
          </div>
        </div>
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-purple-200 text-sm mt-2 text-center">
          {progressPercent >= 100 ? "Outstanding! You've completed all tasks!" : 
           progressPercent >= 50 ? "Great progress! Keep pushing!" : 
           "Let's build momentum today!"}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap font-medium transition-all ${
              activeCategory === cat.id
                ? 'text-white'
                : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'
            }`}
            style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Daily Habits */}
      {activeCategory === 'daily' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary-500 mb-4">☀️ Daily Success Checklist</h3>
          <div className="space-y-3">
            {dailyChecklist.map(item => (
              <div
                key={item.id}
                onClick={() => toggleItem('daily', item.id)}
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                  isCompleted('daily', item.id)
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-dark-border/50 border border-transparent hover:border-dark-border'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isCompleted('daily', item.id)
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-500'
                }`}>
                  {isCompleted('daily', item.id) && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isCompleted('daily', item.id) ? 'text-green-400 line-through' : 'text-white'}`}>
                    {item.task}
                  </p>
                  <p className="text-gray-500 text-sm">⏱ {item.time}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {item.priority.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prospecting */}
      {activeCategory === 'prospecting' && (
        <div className="space-y-4">
          {prospectingGuide.map(section => (
            <div key={section.id} className="card">
              <h3 className="text-lg font-semibold text-primary-500 mb-4">{section.category}</h3>
              <div className="space-y-3">
                {section.items.map((item, idx) => (
                  <div key={idx} className="p-4 bg-dark-border/50 rounded-xl">
                    <p className="text-white font-medium">{item.task}</p>
                    <p className="text-blue-400 text-sm mt-1">💡 {item.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Farming */}
      {activeCategory === 'farming' && (
        <div className="space-y-4">
          {farmingGuide.map(section => (
            <div key={section.id} className="card">
              <h3 className="text-lg font-semibold text-primary-500 mb-4">{section.title}</h3>
              <div className="space-y-2">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-dark-border/50 rounded-lg">
                    <span className="text-green-400">✓</span>
                    <p className="text-white">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scripts */}
      {activeCategory === 'scripts' && (
        <div className="space-y-4">
          {scripts.map(script => (
            <div key={script.id} className="card overflow-hidden">
              <div 
                onClick={() => setShowScript(showScript === script.id ? null : script.id)}
                className="flex justify-between items-center cursor-pointer"
              >
                <div>
                  <span className="text-xs text-gray-500 bg-dark-border px-2 py-1 rounded">{script.category}</span>
                  <h3 className="text-white font-semibold mt-2">{script.title}</h3>
                </div>
                <span className="text-primary-500 text-2xl">{showScript === script.id ? '−' : '+'}</span>
              </div>
              {showScript === script.id && (
                <div className="mt-4 pt-4 border-t border-dark-border">
                  <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {script.script}
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(script.script)}
                    className="btn-primary mt-4"
                  >
                    📋 Copy Script
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Listing */}
      {activeCategory === 'listing' && (
        <div className="space-y-4">
          {listingChecklist.map(phase => (
            <div key={phase.id} className="card">
              <h3 className="text-lg font-semibold text-pink-400 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-pink-500/20 flex items-center justify-center text-sm">
                  {phase.id}
                </span>
                {phase.phase}
              </h3>
              <div className="space-y-2">
                {phase.items.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => toggleItem('listing', `${phase.id}-${idx}`)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      isCompleted('listing', `${phase.id}-${idx}`)
                        ? 'bg-pink-500/10'
                        : 'bg-dark-border/50 hover:bg-dark-border'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isCompleted('listing', `${phase.id}-${idx}`)
                        ? 'bg-pink-500 border-pink-500'
                        : 'border-gray-500'
                    }`}>
                      {isCompleted('listing', `${phase.id}-${idx}`) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <p className={isCompleted('listing', `${phase.id}-${idx}`) ? 'text-pink-400 line-through' : 'text-white'}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buyer */}
      {activeCategory === 'buyer' && (
        <div className="space-y-4">
          {buyerChecklist.map(phase => (
            <div key={phase.id} className="card">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm">
                  {phase.id}
                </span>
                {phase.phase}
              </h3>
              <div className="space-y-2">
                {phase.items.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => toggleItem('buyer', `${phase.id}-${idx}`)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      isCompleted('buyer', `${phase.id}-${idx}`)
                        ? 'bg-cyan-500/10'
                        : 'bg-dark-border/50 hover:bg-dark-border'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isCompleted('buyer', `${phase.id}-${idx}`)
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'border-gray-500'
                    }`}>
                      {isCompleted('buyer', `${phase.id}-${idx}`) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <p className={isCompleted('buyer', `${phase.id}-${idx}`) ? 'text-cyan-400 line-through' : 'text-white'}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mindset */}
      {activeCategory === 'mindset' && (
        <div className="space-y-4">
          {mindsetTips.map(section => (
            <div key={section.id} className="card">
              <h3 className="text-lg font-semibold text-orange-400 mb-4">{section.title}</h3>
              <div className="space-y-2">
                {section.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-dark-border/50 rounded-lg">
                    <span className="text-orange-400">★</span>
                    <p className="text-white">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Quote */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-center">
            <p className="text-white text-lg italic">
              &quot;Success is not final, failure is not fatal: It is the courage to continue that counts.&quot;
            </p>
            <p className="text-orange-200 mt-3">— Winston Churchill</p>
          </div>
        </div>
      )}
    </div>
  )
}
