'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/dashboard/leads', label: 'Leads', icon: '👥' },
  { href: '/dashboard/appointments', label: 'Appointments', icon: '📅' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: '📋' },
  { href: '/dashboard/tasks', label: 'Tasks', icon: '✓' },
  { href: '/dashboard/coach', label: 'Coach', icon: '🎯' },
  { href: '/dashboard/investment', label: 'Investment Calc', icon: '📊' },
  { href: '/dashboard/mortgage', label: 'Mortgage Calc', icon: '🏦' },
  { href: '/dashboard/seller-net', label: 'Seller Net Sheet', icon: '💰' },
  { href: '/dashboard/buyer-costs', label: 'Buyer Costs', icon: '💵' },
  { href: '/dashboard/expenses', label: 'Expenses', icon: '🧾' },
  { href: '/dashboard/mileage', label: 'Mileage', icon: '🚗' },
  { href: '/dashboard/templates', label: 'Quick Replies', icon: '⚡' },
  { href: '/dashboard/drip', label: 'Drip Campaigns', icon: '📧' },
  { href: '/dashboard/profile', label: 'My Profile', icon: '👤' },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-white lg:hidden"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-dark-card border-r border-dark-border z-50 transform transition-transform duration-300 lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="text-xl font-bold text-white">REPal</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto max-h-[calc(100vh-80px)]">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-500'
                        : 'text-gray-400 hover:bg-dark-border hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}
