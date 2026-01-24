'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: '', lastName: '', email: '', phone: '', brokerage: '', licenseNumber: '',
    website: '', bio: '', profilePhoto: '', specialties: [] as string[]
  })
  const [isSaving, setIsSaving] = useState(false)

  const specialtyOptions = [
    'Residential', 'Commercial', 'Luxury', 'Investment', 'First-Time Buyers',
    'Relocation', 'New Construction', 'Condos', '55+ Communities', 'Waterfront'
  ]

  useEffect(() => {
    const saved = localStorage.getItem('repal_profile')
    if (saved) setProfile(JSON.parse(saved))
  }, [])

  const saveProfile = () => {
    setIsSaving(true)
    localStorage.setItem('repal_profile', JSON.stringify(profile))
    setTimeout(() => {
      setIsSaving(false)
      alert('Profile saved!')
    }, 500)
  }

  const toggleSpecialty = (specialty: string) => {
    if (profile.specialties.includes(specialty)) {
      setProfile({ ...profile, specialties: profile.specialties.filter(s => s !== specialty) })
    } else {
      setProfile({ ...profile, specialties: [...profile.specialties, specialty] })
    }
  }

  return (
    <div className="animate-fade-in pb-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">👤 My Profile</h1>
          <p className="text-gray-400 text-sm">Manage your agent information</p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
      </div>

      {/* Profile Photo Section */}
      <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 border border-dark-border mb-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary-500/20 flex items-center justify-center text-4xl border-2 border-primary-500/30">
            {profile.profilePhoto ? (
              <img src={profile.profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{profile.firstName ? profile.firstName[0]?.toUpperCase() : '👤'}</span>
            )}
          </div>
          <div>
            <h2 className="font-playfair text-xl text-white mb-1">
              {profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}` : 'Your Name'}
            </h2>
            <p className="text-gray-400 text-sm">{profile.brokerage || 'Your Brokerage'}</p>
            <button className="mt-3 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg text-sm font-semibold hover:bg-primary-500/30 transition-colors">
              📷 Change Photo
            </button>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 border border-dark-border mb-6">
        <h3 className="text-primary-400 font-semibold mb-4 text-sm">👤 Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">First Name</label>
            <input type="text" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} placeholder="John" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Last Name</label>
            <input type="text" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} placeholder="Doe" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Email</label>
            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="john@realty.com" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Phone</label>
            <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="(555) 123-4567" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 border border-dark-border mb-6">
        <h3 className="text-primary-400 font-semibold mb-4 text-sm">🏢 Professional Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Brokerage</label>
            <input type="text" value={profile.brokerage} onChange={(e) => setProfile({ ...profile, brokerage: e.target.value })} placeholder="ABC Realty" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">License Number</label>
            <input type="text" value={profile.licenseNumber} onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })} placeholder="SL123456" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Website</label>
            <input type="url" value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} placeholder="https://yourwebsite.com" className="w-full px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500" />
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 border border-dark-border mb-6">
        <h3 className="text-primary-400 font-semibold mb-4 text-sm">⭐ Specialties</h3>
        <div className="flex flex-wrap gap-2">
          {specialtyOptions.map(specialty => (
            <button
              key={specialty}
              onClick={() => toggleSpecialty(specialty)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                profile.specialties.includes(specialty)
                  ? 'bg-primary-500 text-dark-bg'
                  : 'bg-dark-border text-gray-400 hover:text-white'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-6 border border-dark-border mb-6">
        <h3 className="text-primary-400 font-semibold mb-4 text-sm">📝 Bio</h3>
        <textarea
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          placeholder="Tell clients about yourself, your experience, and what makes you the right agent for them..."
          className="w-full min-h-[120px] px-4 py-3 bg-[#0D0D0D] border border-dark-border rounded-lg text-white outline-none focus:border-primary-500 resize-y"
        />
        <p className="text-xs text-gray-500 mt-2">{profile.bio?.length || 0}/500 characters</p>
      </div>

      {/* Save Button */}
      <button
        onClick={saveProfile}
        disabled={isSaving}
        className="w-full py-4 bg-primary-500 text-dark-bg rounded-xl font-semibold text-lg hover:bg-primary-400 transition-colors disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : '💾 Save Profile'}
      </button>

      {/* Account Settings */}
      <div className="mt-8 p-4 bg-dark-card rounded-xl border border-dark-border">
        <h3 className="text-white font-semibold mb-4">⚙️ Account Settings</h3>
        <div className="space-y-3">
          <button className="w-full p-3 bg-[#0D0D0D] rounded-lg text-left hover:bg-dark-border transition-colors flex justify-between items-center">
            <span className="text-gray-400">🔔 Notification Preferences</span>
            <span className="text-gray-600">→</span>
          </button>
          <button className="w-full p-3 bg-[#0D0D0D] rounded-lg text-left hover:bg-dark-border transition-colors flex justify-between items-center">
            <span className="text-gray-400">🔐 Change Password</span>
            <span className="text-gray-600">→</span>
          </button>
          <button className="w-full p-3 bg-[#0D0D0D] rounded-lg text-left hover:bg-dark-border transition-colors flex justify-between items-center">
            <span className="text-gray-400">📤 Export Data</span>
            <span className="text-gray-600">→</span>
          </button>
          <button className="w-full p-3 bg-[#E74C3C]/10 rounded-lg text-left hover:bg-[#E74C3C]/20 transition-colors">
            <span className="text-[#E74C3C]">🚪 Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
