'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  phone: string
  commission_split: number
  status: 'active' | 'inactive'
  join_date: string
  notes: string
  photo_url?: string
  specialties?: string[]
  transactions_ytd?: number
  volume_ytd?: number
}

const STORAGE_KEY = 'repal_team_members'

export default function TeamManagerPage() {
  const { user } = useUser()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')

  const [formData, setFormData] = useState({
    name: '',
    role: 'agent',
    email: '',
    phone: '',
    commission_split: 70,
    status: 'active' as 'active' | 'inactive',
    join_date: new Date().toISOString().split('T')[0],
    notes: '',
    specialties: ''
  })

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setMembers(JSON.parse(saved))
      }
    }
  }, [user])

  const saveMembers = (newMembers: TeamMember[]) => {
    setMembers(newMembers)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMembers))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const memberData: TeamMember = {
      id: editingMember?.id || Date.now().toString(),
      name: formData.name,
      role: formData.role,
      email: formData.email,
      phone: formData.phone,
      commission_split: formData.commission_split,
      status: formData.status,
      join_date: formData.join_date,
      notes: formData.notes,
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
      transactions_ytd: editingMember?.transactions_ytd || 0,
      volume_ytd: editingMember?.volume_ytd || 0
    }

    if (editingMember) {
      saveMembers(members.map(m => m.id === editingMember.id ? memberData : m))
    } else {
      saveMembers([memberData, ...members])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'agent',
      email: '',
      phone: '',
      commission_split: 70,
      status: 'active',
      join_date: new Date().toISOString().split('T')[0],
      notes: '',
      specialties: ''
    })
    setEditingMember(null)
    setShowModal(false)
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      commission_split: member.commission_split,
      status: member.status,
      join_date: member.join_date,
      notes: member.notes,
      specialties: member.specialties?.join(', ') || ''
    })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      saveMembers(members.filter(m => m.id !== id))
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    return matchesSearch && matchesRole
  })

  const roles = ['agent', 'team_lead', 'admin', 'assistant', 'coordinator']

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Manager</h1>
          <p className="text-gray-400 text-sm mt-1">{members.length} team member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <span>➕</span>
          <span>Add Member</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-4 block">👥</span>
          <p className="text-gray-400 mb-4">
            {searchTerm || filterRole !== 'all' 
              ? 'No team members match your filters' 
              : 'No team members yet'}
          </p>
          {!searchTerm && filterRole === 'all' && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Add Your First Team Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map(member => (
            <div 
              key={member.id} 
              className="card hover:border-primary-500/50 transition-all cursor-pointer"
              onClick={() => handleEdit(member)}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white truncate">{member.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                  <p className="text-sm text-primary-400 capitalize mt-0.5">
                    {member.role.replace('_', ' ')}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-400 truncate">📧 {member.email}</p>
                    <p className="text-xs text-gray-400">📱 {member.phone}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-dark-border flex justify-between text-xs">
                    <span className="text-gray-400">Commission: <span className="text-white font-medium">{member.commission_split}%</span></span>
                    <span className="text-gray-400">Joined: <span className="text-white">{new Date(member.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-dark-card border border-dark-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-dark-card border-b border-dark-border p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="John Smith"
                  required
                />
              </div>

              {/* Role and Status - Side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field w-full"
                    required
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="input-field w-full"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field w-full"
                  placeholder="john@example.com"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field w-full"
                  placeholder="(407) 555-0123"
                />
              </div>

              {/* Commission Split and Join Date - Side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Commission Split (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.commission_split}
                    onChange={(e) => setFormData({ ...formData, commission_split: parseInt(e.target.value) || 0 })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Join Date
                  </label>
                  <input
                    type="date"
                    value={formData.join_date}
                    onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Specialties
                </label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  className="input-field w-full"
                  placeholder="Luxury homes, First-time buyers, Investors"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated list</p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field w-full h-20 resize-none"
                  placeholder="Additional notes about this team member..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-dark-border">
                {editingMember && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingMember.id)}
                    className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingMember ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
