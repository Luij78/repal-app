import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const tiles = [
  { id: 'leads', title: 'Lead Manager', icon: '👥', desc: 'CRM with AI assistant', color: '#D4AF37', href: '/dashboard/leads' },
  { id: 'appointments', title: 'Appointments', icon: '📅', desc: 'Schedule & manage', color: '#4ECDC4', href: '/dashboard/appointments' },
  { id: 'transactions', title: 'Transactions', icon: '📋', desc: 'Track your deals', color: '#9B59B6', href: '/dashboard/transactions' },
  { id: 'tasks', title: 'Tasker', icon: '✓', desc: 'Stay organized', color: '#27AE60', href: '/dashboard/tasks' },
  { id: 'coach', title: 'Coach', icon: '🎯', desc: 'Your success guide', color: '#8B5CF6', href: '/dashboard/coach' },
  { id: 'investment', title: 'Investment Calculator', icon: '📊', desc: 'Analyze ROI & cash flow', color: '#3498DB', href: '/dashboard/investment' },
  { id: 'mortgage', title: 'Mortgage Calculator', icon: '🏦', desc: 'Monthly payments', color: '#2563EB', href: '/dashboard/mortgage' },
  { id: 'seller', title: 'Seller Net Sheet', icon: '💰', desc: 'Calculate proceeds', color: '#E67E22', href: '/dashboard/seller-net' },
  { id: 'buyer', title: 'Buyer Closing Costs', icon: '💵', desc: 'Estimate cash to close', color: '#96CEB4', href: '/dashboard/buyer-costs' },
  { id: 'expenses', title: 'Expense Tracker', icon: '🧾', desc: 'Tax deductions', color: '#E74C3C', href: '/dashboard/expenses' },
  { id: 'mileage', title: 'Mileage Tracker', icon: '🚗', desc: 'Log business miles', color: '#3498DB', href: '/dashboard/mileage' },
  { id: 'templates', title: 'Quick Replies', icon: '⚡', desc: 'Response templates', color: '#F39C12', href: '/dashboard/templates' },
  { id: 'drip', title: 'Drip Campaigns', icon: '📧', desc: 'Automated follow-up', color: '#1ABC9C', href: '/dashboard/drip' },
  { id: 'openhouse', title: 'Open House Sign-In', icon: '🏡', desc: 'Capture leads', color: '#2ECC71', href: '/dashboard/open-house' },
]

export default async function DashboardPage() {
  const user = await currentUser()
  const firstName = user?.firstName || 'Agent'

  // Get time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="text-gray-400">
          Here&apos;s your real estate command center.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-gray-400 text-sm mb-1">Active Leads</p>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm mb-1">Today&apos;s Appointments</p>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm mb-1">Pending Tasks</p>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm mb-1">Active Transactions</p>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
      </div>

      {/* Tools Grid */}
      <h2 className="text-lg font-semibold text-white mb-4">Your Tools</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tiles.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href}
            className="tile group"
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${tile.color}20` }}
            >
              {tile.icon}
            </div>
            <h3 className="font-semibold text-white mb-1 text-sm">{tile.title}</h3>
            <p className="text-gray-500 text-xs">{tile.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
