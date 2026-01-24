'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function IntegrationsPage() {
  const [connectedSources, setConnectedSources] = useState<string[]>(['zillow'])

  const leadSources = [
    { id: 'zillow', name: 'Zillow', icon: '🏠', desc: 'Import leads from Zillow Premier Agent', color: '#006AFF', connected: true },
    { id: 'realtor', name: 'Realtor.com', icon: '🔑', desc: 'Sync leads from Realtor.com', color: '#D92228', connected: false },
    { id: 'redfin', name: 'Redfin', icon: '🏡', desc: 'Import Redfin partner leads', color: '#A02021', connected: false },
    { id: 'facebook', name: 'Facebook Leads', icon: '📘', desc: 'Sync Facebook Lead Form submissions', color: '#1877F2', connected: false },
    { id: 'google', name: 'Google Ads', icon: '🔍', desc: 'Import Google Ads lead forms', color: '#4285F4', connected: false },
    { id: 'website', name: 'Website Forms', icon: '🌐', desc: 'Capture leads from your website', color: '#4A9B7F', connected: false },
    { id: 'openhouse', name: 'Open House', icon: '📋', desc: 'Import from REPal Open House sign-in', color: '#D4AF37', connected: true },
    { id: 'csv', name: 'CSV Import', icon: '📊', desc: 'Bulk import leads from spreadsheet', color: '#27AE60', connected: false },
  ]

  const toggleConnection = (sourceId: string) => {
    if (connectedSources.includes(sourceId)) {
      setConnectedSources(connectedSources.filter(s => s !== sourceId))
    } else {
      setConnectedSources([...connectedSources, sourceId])
    }
  }

  const importStats = {
    total: 156,
    thisMonth: 23,
    topSource: 'Zillow'
  }

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">🔗 Lead Sources</h1>
          <p className="text-gray-400 text-sm">Connect and manage your lead generation channels</p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-white">{importStats.total}</span>
          <p className="text-xs text-gray-400 mt-1">Total Leads Imported</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-[#4A9B7F]">{importStats.thisMonth}</span>
          <p className="text-xs text-gray-400 mt-1">This Month</p>
        </div>
        <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-4 border border-dark-border">
          <span className="text-2xl font-bold text-primary-400">{connectedSources.length}</span>
          <p className="text-xs text-gray-400 mt-1">Connected Sources</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
        <h3 className="text-blue-400 font-semibold text-sm mb-2">💡 Centralize Your Leads</h3>
        <p className="text-sm text-gray-400">Connect your lead sources to automatically import new leads into REPal. All leads will be added to your Lead Manager with source tracking.</p>
      </div>

      {/* Lead Sources Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {leadSources.map(source => {
          const isConnected = connectedSources.includes(source.id)
          return (
            <div key={source.id} className={`bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-5 border transition-all ${isConnected ? 'border-[#4A9B7F]' : 'border-dark-border hover:border-primary-500/30'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: source.color + '20' }}>
                    {source.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{source.name}</h3>
                    <p className="text-xs text-gray-500">{source.desc}</p>
                  </div>
                </div>
                {isConnected && <span className="px-2 py-1 bg-[#4A9B7F]/20 text-[#4A9B7F] rounded text-xs font-semibold">Connected</span>}
              </div>
              
              <button
                onClick={() => toggleConnection(source.id)}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                  isConnected 
                    ? 'bg-[#E74C3C]/20 text-[#E74C3C] hover:bg-[#E74C3C]/30' 
                    : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                }`}
              >
                {isConnected ? '✕ Disconnect' : '+ Connect'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Manual Import Section */}
      <div className="mt-8 bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-xl p-5 border border-dark-border">
        <h3 className="text-white font-semibold mb-4">📥 Manual Import</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0D0D0D] rounded-lg border border-dashed border-dark-border text-center">
            <span className="text-3xl mb-2 block">📊</span>
            <p className="text-white font-medium mb-1">Import from CSV</p>
            <p className="text-xs text-gray-500 mb-3">Upload a spreadsheet with lead data</p>
            <button className="px-4 py-2 bg-primary-500 text-dark-bg rounded-lg text-sm font-semibold hover:bg-primary-400 transition-colors">
              Choose File
            </button>
          </div>
          <div className="p-4 bg-[#0D0D0D] rounded-lg border border-dashed border-dark-border text-center">
            <span className="text-3xl mb-2 block">✍️</span>
            <p className="text-white font-medium mb-1">Add Manually</p>
            <p className="text-xs text-gray-500 mb-3">Enter lead information directly</p>
            <Link href="/dashboard/leads" className="inline-block px-4 py-2 bg-[#4ECDC4] text-white rounded-lg text-sm font-semibold hover:bg-[#4ECDC4]/80 transition-colors">
              Add Lead
            </Link>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-primary-500/10 rounded-xl border border-primary-500/30">
        <h3 className="text-primary-400 font-semibold text-sm mb-2">🔧 Need Help Connecting?</h3>
        <p className="text-sm text-gray-400 mb-3">Each lead source requires API credentials or OAuth authentication. Follow the setup guide for each platform.</p>
        <button className="text-sm text-primary-400 hover:text-primary-300 font-semibold">View Setup Guides →</button>
      </div>
    </div>
  )
}
