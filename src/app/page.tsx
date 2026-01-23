import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { userId } = auth()
  
  if (userId) {
    redirect('/dashboard')
  }

  const features = [
    { icon: '👥', title: 'Lead Manager', desc: 'CRM with AI assistant & speech-to-text' },
    { icon: '📊', title: 'Investment Calculator', desc: 'Analyze ROI, cash flow & cap rates' },
    { icon: '🏦', title: 'Mortgage Calculator', desc: 'Monthly payment estimator' },
    { icon: '📋', title: 'Transaction Tracker', desc: 'Track deals from contract to close' },
    { icon: '🎯', title: 'Coach', desc: 'Your path to real estate success' },
    { icon: '💰', title: 'Seller Net Sheet', desc: 'Calculate seller proceeds' },
    { icon: '🧾', title: 'Expense Tracker', desc: 'Track tax-deductible expenses' },
    { icon: '🚗', title: 'Mileage Tracker', desc: 'Log business miles driven' },
    { icon: '📧', title: 'Drip Campaigns', desc: 'Automated follow-up sequences' },
    { icon: '⚡', title: 'Quick Replies', desc: 'Pre-built response templates' },
    { icon: '📅', title: 'Appointments', desc: 'Schedule and manage showings' },
    { icon: '🏡', title: 'Open House Sign-In', desc: 'Capture leads at open houses' },
  ]

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              <span className="text-xl font-bold text-white">REPal</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/sign-in"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/sign-up"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Your Complete
            <span className="text-primary-500"> Real Estate </span>
            Toolkit
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Everything you need to manage leads, track transactions, calculate investments, 
            and grow your real estate business—all in one powerful app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="btn-primary text-lg px-8 py-3">
              Start Free Trial
            </Link>
            <Link href="/sign-in" className="btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Everything You Need to Succeed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="tile text-center"
              >
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-500/10 to-primary-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Level Up Your Real Estate Business?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of agents using REPal to close more deals.
          </p>
          <Link href="/sign-up" className="btn-primary text-lg px-8 py-3">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>© 2024 REPal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
