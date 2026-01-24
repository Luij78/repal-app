'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Tile {
  id: string
  title: string
  icon: string
  desc: string
  color: string
  href: string
}

const defaultTiles: Tile[] = [
  { id: 'tasker', title: 'Tasker', icon: '✓', desc: 'Track tasks & to-dos', color: '#27AE60', href: '/dashboard/tasker' },
  { id: 'investment', title: 'Investment Calculator', icon: '📊', desc: 'Analyze ROI, cash flow & cap rates', color: '#D4AF55', href: '/dashboard/investment' },
  { id: 'mortgage', title: 'Mortgage Calculator', icon: '🏦', desc: 'Monthly payment estimator', color: '#2563EB', href: '/dashboard/mortgage' },
  { id: 'expenses', title: 'Expense Tracker', icon: '🧾', desc: 'Track tax-deductible expenses', color: '#E74C3C', href: '/dashboard/expenses' },
  { id: 'mileage', title: 'Mileage Tracker', icon: '🚗', desc: 'Log business miles driven', color: '#3498DB', href: '/dashboard/mileage' },
  { id: 'coach', title: 'Coach', icon: '🎯', desc: 'Your path to real estate success', color: '#8B5CF6', href: '/dashboard/coach' },
  { id: 'leads', title: 'Lead Manager', icon: '👥', desc: 'Organize contacts & notes', color: '#22C55E', href: '/dashboard/leads' },
  { id: 'appointments', title: 'Appointments', icon: '📅', desc: 'Schedule & track meetings', color: '#06B6D4', href: '/dashboard/appointments' },
  { id: 'openhouse', title: 'Open House Sign-In', icon: '🏡', desc: 'Digital sign-in & QR codes', color: '#FF6B6B', href: '/dashboard/openhouse' },
  { id: 'transactions', title: 'Transaction Tracker', icon: '📋', desc: 'Manage deals to closing', color: '#45B7D1', href: '/dashboard/transactions' },
  { id: 'buyercosts', title: 'Buyer Closing Costs', icon: '💵', desc: 'Estimate cash to close', color: '#96CEB4', href: '/dashboard/buyercosts' },
  { id: 'dates', title: 'Important Dates', icon: '🎂', desc: 'Birthdays & anniversaries', color: '#FF85A2', href: '/dashboard/dates' },
  { id: 'seller', title: 'Seller Net Sheet', icon: '🏠', desc: 'Calculate seller proceeds', color: '#EF4444', href: '/dashboard/seller' },
  { id: 'commercial', title: 'Triple Net (NNN)', icon: '🏢', desc: 'Commercial lease calculator', color: '#A855F7', href: '/dashboard/commercial' },
  { id: 'templates', title: 'Quick Replies', icon: '⚡', desc: 'One-tap message templates', color: '#F39C12', href: '/dashboard/templates' },
  { id: 'drip', title: 'Drip Campaign', icon: '📧', desc: 'AI newsletters for cold leads', color: '#4ECDC4', href: '/dashboard/drip' },
  { id: 'integrations', title: 'Lead Sources', icon: '🔗', desc: 'IDX/MLS, Zillow, Realtor.com & more', color: '#9B59B6', href: '/dashboard/integrations' },
  { id: 'profile', title: 'My Profile', icon: '👤', desc: 'Signature & business card', color: '#E91E63', href: '/dashboard/profile' },
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [tileOrder, setTileOrder] = useState<string[]>(defaultTiles.map(t => t.id))
  const [draggedTile, setDraggedTile] = useState<string | null>(null)
  const [dragOverTile, setDragOverTile] = useState<string | null>(null)
  const [greeting, setGreeting] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    setMounted(true)
    
    // Load saved tile order
    const saved = localStorage.getItem('repal_tile_order')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure all tiles are included (in case new ones were added)
        const allTileIds = defaultTiles.map(t => t.id)
        const validOrder = parsed.filter((id: string) => allTileIds.includes(id))
        const missingTiles = allTileIds.filter(id => !validOrder.includes(id))
        setTileOrder([...validOrder, ...missingTiles])
      } catch {
        setTileOrder(defaultTiles.map(t => t.id))
      }
    }

    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    // Set current date
    setCurrentDate(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }))
  }, [])

  // Save tile order when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('repal_tile_order', JSON.stringify(tileOrder))
    }
  }, [tileOrder, mounted])

  // Get tiles in current order
  const tiles = tileOrder
    .map(id => defaultTiles.find(t => t.id === id))
    .filter((t): t is Tile => t !== undefined)

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, tileId: string) => {
    setDraggedTile(tileId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, tileId: string) => {
    e.preventDefault()
    if (tileId !== draggedTile) {
      setDragOverTile(tileId)
    }
  }

  const handleDragLeave = () => {
    setDragOverTile(null)
  }

  const handleDrop = (e: React.DragEvent, targetTileId: string) => {
    e.preventDefault()
    if (draggedTile && targetTileId && draggedTile !== targetTileId) {
      const newOrder = [...tileOrder]
      const draggedIdx = newOrder.indexOf(draggedTile)
      const targetIdx = newOrder.indexOf(targetTileId)
      newOrder.splice(draggedIdx, 1)
      newOrder.splice(targetIdx, 0, draggedTile)
      setTileOrder(newOrder)
    }
    setDraggedTile(null)
    setDragOverTile(null)
  }

  const handleDragEnd = () => {
    setDraggedTile(null)
    setDragOverTile(null)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-primary-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Header */}
      <div 
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.1) 100%)' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, #D4AF55 0%, #B8962E 100%)' }}
            >
              🏠
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
                <span>🌙</span> {greeting}, Agent!
              </h1>
              <p className="text-gray-400 mt-1">{currentDate}</p>
            </div>
          </div>
          <Link 
            href="/dashboard/alerts"
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            style={{ background: 'rgba(212, 175, 85, 0.2)', color: '#D4AF55' }}
          >
            AI Digest <span>🔔</span>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <Link href="/dashboard/appointments" className="bg-dark-card/50 backdrop-blur rounded-xl p-4 text-center border border-dark-border hover:border-primary-500/50 transition-colors">
            <div className="text-2xl font-bold text-cyan-400">0</div>
            <div className="text-xs text-gray-500 mt-1">Today's Appts</div>
          </Link>
          <Link href="/dashboard/leads" className="bg-dark-card/50 backdrop-blur rounded-xl p-4 text-center border border-dark-border hover:border-primary-500/50 transition-colors">
            <div className="text-2xl font-bold text-green-400">0</div>
            <div className="text-xs text-gray-500 mt-1">Need Follow-up</div>
          </Link>
          <Link href="/dashboard/tasker" className="bg-dark-card/50 backdrop-blur rounded-xl p-4 text-center border border-dark-border hover:border-primary-500/50 transition-colors">
            <div className="text-2xl font-bold text-orange-400">0</div>
            <div className="text-xs text-gray-500 mt-1">Overdue Tasks</div>
          </Link>
          <Link href="/dashboard/leads?filter=hot" className="bg-dark-card/50 backdrop-blur rounded-xl p-4 text-center border border-dark-border hover:border-primary-500/50 transition-colors">
            <div className="text-2xl font-bold text-red-400">0</div>
            <div className="text-xs text-gray-500 mt-1">Hot Leads</div>
          </Link>
        </div>

        {/* All Caught Up Message */}
        <div 
          className="mt-6 rounded-xl p-4 text-center"
          style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}
        >
          <span className="text-2xl">✨</span>
          <p className="text-green-400 font-medium mt-1">You're all caught up!</p>
          <p className="text-gray-500 text-sm">No urgent items. Great job staying on top of things!</p>
        </div>
      </div>

      {/* Tools & Calculators Section */}
      <div>
        <h2 
          className="text-2xl mb-6 text-white"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Tools & Calculators{' '}
          <span className="text-xs font-normal text-gray-500 ml-2">Drag to rearrange</span>
        </h2>

        <div 
          className="grid gap-5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
        >
          {tiles.map((tile, idx) => (
            <Link
              key={tile.id}
              href={tile.href}
              draggable
              onDragStart={(e) => handleDragStart(e, tile.id)}
              onDragOver={(e) => handleDragOver(e, tile.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tile.id)}
              onDragEnd={handleDragEnd}
              className="block relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{
                background: '#1a1a1a',
                borderColor: dragOverTile === tile.id ? '#D4AF55' : '#2a2a2a',
                borderWidth: dragOverTile === tile.id ? '2px' : '1px',
                borderStyle: dragOverTile === tile.id ? 'dashed' : 'solid',
                opacity: draggedTile === tile.id ? 0.5 : 1,
                transform: dragOverTile === tile.id ? 'scale(1.02)' : 'scale(1)',
                cursor: 'grab',
                animationDelay: `${idx * 0.05}s`
              }}
            >
              {/* Colored accent bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: tile.color }}
              />
              
              {/* Icon */}
              <span className="text-4xl block mb-3">{tile.icon}</span>
              
              {/* Title */}
              <h3 
                className="text-lg mb-2 text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {tile.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed">{tile.desc}</p>
              
              {/* Arrow */}
              <span 
                className="absolute bottom-5 right-5 text-xl"
                style={{ color: '#D4AF55' }}
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
