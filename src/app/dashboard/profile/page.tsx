'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  brokerage: string | null
  license_number: string | null
  phone: string | null
  email: string | null
  photo_url: string | null
  bio: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const { user } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    brokerage: '',
    license_number: '',
    phone: '',
    email: '',
    bio: '',
    website: ''
  })

  const supabase = createClient()

  useEffect(() => {
    if (user) fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', error)
    } else if (data) {
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        brokerage: data.brokerage || '',
        license_number: data.license_number || '',
        phone: data.phone || '',
        email: data.email || user.primaryEmailAddress?.emailAddress || '',
        bio: data.bio || '',
        website: data.website || ''
      })
    } else {
      // No profile yet, use Clerk data
      setFormData(prev => ({
        ...prev,
        full_name: user.fullName || '',
        email: user.primaryEmailAddress?.emailAddress || ''
      }))
    }
    setLoading(false)
  }

  const saveProfile = async () => {
    if (!user) return

    setSaving(true)
    const profileData = {
      user_id: user.id,
      full_name: formData.full_name || null,
      brokerage: formData.brokerage || null,
      license_number: formData.license_number || null,
      phone: formData.phone || null,
      email: formData.email || null,
      bio: formData.bio || null,
      website: formData.website || null,
      updated_at: new Date().toISOString()
    }

    if (profile) {
      const { error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', profile.id)

      if (error) {
        console.error('Error updating profile:', error)
      } else {
        setProfile({ ...profile, ...profileData })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } else {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
      } else if (data) {
        setProfile(data)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    }
    setSaving(false)
  }

  const generateSignature = () => {
    const lines = [
      formData.full_name,
      formData.brokerage && `${formData.brokerage}`,
      formData.license_number && `License #${formData.license_number}`,
      formData.phone && `📱 ${formData.phone}`,
      formData.email && `✉️ ${formData.email}`,
      formData.website && `🌐 ${formData.website}`
    ].filter(Boolean)
    return lines.join('\n')
  }

  const copySignature = async () => {
    try {
      await navigator.clipboard.writeText(generateSignature())
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const generateVCard = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${formData.full_name || ''}`,
      formData.brokerage && `ORG:${formData.brokerage}`,
      formData.phone && `TEL:${formData.phone}`,
      formData.email && `EMAIL:${formData.email}`,
      formData.website && `URL:${formData.website}`,
      formData.license_number && `NOTE:License #${formData.license_number}`,
      'END:VCARD'
    ].filter(Boolean).join('\n')

    const blob = new Blob([vcard], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${formData.full_name || 'contact'}.vcf`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">👤 My Profile</h1>
          <p className="text-gray-400">Your professional information</p>
        </div>
        {saved && (
          <span className="text-green-400 flex items-center gap-2">
            ✓ Saved!
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input-field w-full"
                  placeholder="John Smith"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Brokerage</label>
                  <input
                    type="text"
                    value={formData.brokerage}
                    onChange={(e) => setFormData({ ...formData, brokerage: e.target.value })}
                    className="input-field w-full"
                    placeholder="RE/MAX, Keller Williams..."
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">License Number</label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="input-field w-full"
                    placeholder="SL12345678"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field w-full"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field w-full"
                    placeholder="agent@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="input-field w-full"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Bio</h3>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="input-field w-full"
              rows={4}
              placeholder="Tell clients about yourself and your experience..."
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Preview & Export */}
        <div className="space-y-6">
          {/* Business Card Preview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">📇 Business Card Preview</h3>
            <div className="bg-gradient-to-br from-primary-500/20 to-dark-bg border border-primary-500/30 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-500/30 flex items-center justify-center text-2xl">
                  {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : '👤'}
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">{formData.full_name || 'Your Name'}</h4>
                  <p className="text-primary-500">Real Estate Agent</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {formData.brokerage && (
                  <p className="text-gray-300">🏢 {formData.brokerage}</p>
                )}
                {formData.license_number && (
                  <p className="text-gray-400">License #{formData.license_number}</p>
                )}
                {formData.phone && (
                  <p className="text-gray-300">📱 {formData.phone}</p>
                )}
                {formData.email && (
                  <p className="text-gray-300">✉️ {formData.email}</p>
                )}
                {formData.website && (
                  <p className="text-gray-300">🌐 {formData.website}</p>
                )}
              </div>
            </div>
            <button
              onClick={generateVCard}
              className="btn-secondary w-full mt-4"
              disabled={!formData.full_name}
            >
              📥 Download vCard
            </button>
          </div>

          {/* Email Signature */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">✉️ Email Signature</h3>
            <div className="bg-dark-bg rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono">
              {generateSignature() || 'Fill in your profile to generate a signature'}
            </div>
            <button
              onClick={copySignature}
              className="btn-secondary w-full mt-4"
              disabled={!formData.full_name}
            >
              📋 Copy Signature
            </button>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Your Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Profile Created</span>
                <span className="text-white">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString() 
                    : 'Not saved yet'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Updated</span>
                <span className="text-white">
                  {profile?.updated_at 
                    ? new Date(profile.updated_at).toLocaleDateString() 
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
