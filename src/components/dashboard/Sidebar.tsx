'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/dashboard/leads', label: 'Leads', icon: '👥' },
  { href: '/dashboard/appointments', label: 'Appointments', icon: '📅' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: '📋' },
  { href: '/dashboard/tasker', label: 'Tasks', icon: '✓' },
  { href: '/dashboard/coach', label: 'Coach', icon: '🎯' },
  { divider: true },
  { href: '/dashboard/investment-calculator', label: 'Investment Calc', icon: '📊' },
  { href: '/dashboard/mortgage-calculator', label: 'Mortgage Calc', icon: '🏦' },
  { href: '/dashboard/seller', label: 'Seller Net Sheet', icon: '💰' },
  { href: '/dashboard/buyercosts', label: 'Buyer Costs', icon: '💵' },
  { href: '/dashboard/commercial', label: 'Triple Net (NNN)', icon: '🏢' },
  { divider: true },
  { href: '/dashboard/expenses', label: 'Expenses', icon: '🧾' },
  { href: '/dashboard/mileage', label: 'Mileage', icon: '🚗' },
  { href: '/dashboard/templates', label: 'Quick Replies', icon: '⚡' },
  { href: '/dashboard/drip', label: 'Drip Campaigns', icon: '📧' },
  { divider: true },
  { href: '/dashboard/openhouse', label: 'Open House', icon: '🏡' },
  { href: '/dashboard/dates', label: 'Important Dates', icon: '🎂' },
  { href: '/dashboard/profile', label: 'My Profile', icon: '👤' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-dark-card border-r border-dark-border">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-dark-border">
          <span className="text-2xl">🏠</span>
          <span className="text-xl font-bold text-white">REPal</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item, idx) => {
              if (item.divider) {
                return <li key={idx} className="my-3 border-t border-dark-border" />
              }
              
              const isActive = pathname === item.href
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href!}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
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

        {/* Footer */}
        <div className="p-4 border-t border-dark-border">
          <p className="text-xs text-gray-500 text-center">
            REPal v1.0
          </p>
        </div>
      </div>
    </aside>
  )
}
