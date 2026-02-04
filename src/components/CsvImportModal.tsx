'use client'

import { useState, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'
import Papa from 'papaparse'
import type { Lead } from '@/types/database'

interface ParsedLead {
  name: string
  email: string | null
  phone: string | null
  source: string
  status: Lead['status']
  type: Lead['type']
  notes: string | null
  budget_min: number | null
  budget_max: number | null
  preferred_area: string | null
  birthday: string | null
}

interface ImportStats {
  imported: number
  skipped: number
  errors: number
  details: string[]
}

interface CsvImportModalProps {
  onClose: () => void
  onImportComplete: () => void
}

export default function CsvImportModal({ onClose, onImportComplete }: CsvImportModalProps) {
  const { user } = useUser()
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedLead[]>([])
  const [importing, setImporting] = useState(false)
  const [stats, setStats] = useState<ImportStats | null>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Map common Brivity CSV columns to Repal fields
  const mapCsvToLead = (row: any): ParsedLead | null => {
    // Extract name
    let name = ''
    if (row['Name']) {
      name = row['Name'].trim()
    } else if (row['First Name'] || row['Last Name']) {
      name = `${row['First Name'] || ''} ${row['Last Name'] || ''}`.trim()
    } else if (row['FirstName'] || row['LastName']) {
      name = `${row['FirstName'] || ''} ${row['LastName'] || ''}`.trim()
    } else if (row['first_name'] || row['last_name']) {
      name = `${row['first_name'] || ''} ${row['last_name'] || ''}`.trim()
    }

    if (!name) return null // Skip rows without a name

    // Extract email
    const email = row['Email'] || row['email'] || row['Email Address'] || row['email_address'] || null

    // Extract phone
    const phone = row['Phone'] || row['phone'] || row['Mobile'] || row['mobile'] || row['Phone Number'] || row['phone_number'] || null

    // Extract source
    let source = row['Source'] || row['source'] || row['Lead Source'] || row['lead_source'] || 'manual'
    source = source.toLowerCase().replace(/\s+/g, '_')

    // Map status
    let status: Lead['status'] = 'new'
    const statusRaw = (row['Status'] || row['status'] || '').toLowerCase()
    if (statusRaw.includes('contact')) status = 'contacted'
    else if (statusRaw.includes('qual')) status = 'qualified'
    else if (statusRaw.includes('hot')) status = 'hot'
    else if (statusRaw.includes('nurture')) status = 'nurture'
    else if (statusRaw.includes('watch')) status = 'watch'
    else if (statusRaw.includes('pending')) status = 'pending'
    else if (statusRaw.includes('past')) status = 'past_client'
    else if (statusRaw.includes('inactive')) status = 'inactive'
    else if (statusRaw.includes('archive')) status = 'archived'
    else if (statusRaw.includes('unqual')) status = 'unqualified'
    else if (statusRaw.includes('closed') || statusRaw.includes('close')) status = 'closed'
    else if (statusRaw.includes('lost')) status = 'lost'
    else if (statusRaw.includes('negotiat')) status = 'negotiating'

    // Map type/intent
    let type: Lead['type'] = 'buyer'
    const typeRaw = (row['Type'] || row['type'] || row['Intent'] || row['intent'] || '').toLowerCase()
    if (typeRaw.includes('seller') && typeRaw.includes('buyer')) type = 'both'
    else if (typeRaw.includes('seller')) type = 'seller'
    else if (typeRaw.includes('buyer')) type = 'buyer'
    else if (typeRaw.includes('55')) type = 'buyer55'
    else if (typeRaw.includes('investor')) type = 'investor'
    else if (typeRaw.includes('rent') || typeRaw.includes('tenant')) type = 'renter'

    // Extract notes
    const notes = row['Notes'] || row['notes'] || row['Description'] || row['description'] || null

    // Extract budget
    let budget_min: number | null = null
    let budget_max: number | null = null
    
    const budgetStr = row['Budget'] || row['budget'] || row['Price Range'] || row['price_range'] || ''
    const budgetMinStr = row['Budget Min'] || row['budget_min'] || row['Min Price'] || row['min_price'] || ''
    const budgetMaxStr = row['Budget Max'] || row['budget_max'] || row['Max Price'] || row['max_price'] || ''

    if (budgetMinStr) {
      const parsed = parseFloat(budgetMinStr.replace(/[^0-9.]/g, ''))
      if (!isNaN(parsed)) budget_min = parsed
    }
    if (budgetMaxStr) {
      const parsed = parseFloat(budgetMaxStr.replace(/[^0-9.]/g, ''))
      if (!isNaN(parsed)) budget_max = parsed
    }

    // Try to parse range like "200000-300000" or "$200k-$300k"
    if (!budget_min && !budget_max && budgetStr) {
      const rangeMatch = budgetStr.match(/(\d+[kK]?)\s*[-to]+\s*(\d+[kK]?)/)
      if (rangeMatch) {
        const parseK = (str: string) => {
          const num = parseFloat(str.replace(/[^0-9.]/g, ''))
          return str.toLowerCase().includes('k') ? num * 1000 : num
        }
        budget_min = parseK(rangeMatch[1])
        budget_max = parseK(rangeMatch[2])
      } else {
        // Single value - use as budget_max
        const parsed = parseFloat(budgetStr.replace(/[^0-9.]/g, ''))
        if (!isNaN(parsed)) {
          budget_max = budgetStr.toLowerCase().includes('k') ? parsed * 1000 : parsed
        }
      }
    }

    // Extract preferred area
    const preferred_area = row['Preferred Area'] || row['preferred_area'] || row['Location'] || row['location'] || row['Area'] || row['area'] || null

    // Extract birthday
    const birthday = row['Birthday'] || row['birthday'] || row['DOB'] || row['dob'] || null

    return {
      name,
      email,
      phone,
      source,
      status,
      type,
      notes,
      budget_min,
      budget_max,
      preferred_area,
      birthday,
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    setFile(selectedFile)

    // Parse CSV
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mapped = results.data
          .map((row: any) => mapCsvToLead(row))
          .filter((lead): lead is ParsedLead => lead !== null)
        
        setParsedData(mapped)
        setStep('preview')
      },
      error: (error) => {
        console.error('CSV parsing error:', error)
        alert('Failed to parse CSV file. Please check the format.')
      },
    })
  }

  const handleImport = async () => {
    if (!user || parsedData.length === 0) return

    setImporting(true)
    const supabase = createClient()
    const results: ImportStats = {
      imported: 0,
      skipped: 0,
      errors: 0,
      details: [],
    }

    // Fetch existing leads to check for duplicates
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('name, email')
      .eq('user_id', user.id)

    const existingSet = new Set(
      (existingLeads || []).map(l => `${l.name.toLowerCase()}_${(l.email || '').toLowerCase()}`)
    )

    for (const lead of parsedData) {
      const key = `${lead.name.toLowerCase()}_${(lead.email || '').toLowerCase()}`
      
      // Check for duplicate
      if (existingSet.has(key)) {
        results.skipped++
        results.details.push(`Skipped duplicate: ${lead.name}`)
        continue
      }

      // Insert lead
      const { error } = await supabase.from('leads').insert({
        user_id: user.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        status: lead.status,
        type: lead.type,
        notes: lead.notes,
        budget_min: lead.budget_min,
        budget_max: lead.budget_max,
        preferred_area: lead.preferred_area,
        birthday: lead.birthday,
        priority: 5, // Default priority
        property_interest: null,
        timeline: null,
        follow_up_date: null,
        home_anniversary: null,
      })

      if (error) {
        results.errors++
        results.details.push(`Error importing ${lead.name}: ${error.message}`)
      } else {
        results.imported++
        existingSet.add(key) // Add to set to avoid re-importing in same batch
      }
    }

    setStats(results)
    setStep('complete')
    setImporting(false)
  }

  const handleClose = () => {
    if (step === 'complete' && stats && stats.imported > 0) {
      onImportComplete()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div
        className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-dark-card border-b border-dark-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Import Leads from CSV</h2>
            <p className="text-gray-400 text-sm mt-1">
              {step === 'upload' && 'Upload a CSV file with your leads'}
              {step === 'preview' && `${parsedData.length} leads found - Review before importing`}
              {step === 'complete' && 'Import complete!'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'upload' && (
            <div>
              <div className="border-2 border-dashed border-dark-border rounded-xl p-12 text-center hover:border-primary-500/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {file ? file.name : 'Select a CSV file'}
                </h3>
                <p className="text-gray-400 mb-6">
                  CSV should include columns like Name, Email, Phone, etc.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  Choose File
                </button>
              </div>

              <div className="mt-6 p-4 bg-dark-border/30 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Supported CSV Columns:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• <span className="text-white">Name</span> or <span className="text-white">First Name</span> + <span className="text-white">Last Name</span></li>
                  <li>• <span className="text-white">Email</span></li>
                  <li>• <span className="text-white">Phone</span> or <span className="text-white">Mobile</span></li>
                  <li>• <span className="text-white">Source</span></li>
                  <li>• <span className="text-white">Status</span></li>
                  <li>• <span className="text-white">Type</span> or <span className="text-white">Intent</span> (Buyer/Seller)</li>
                  <li>• <span className="text-white">Notes</span></li>
                  <li>• <span className="text-white">Budget</span> or <span className="text-white">Budget Min/Max</span></li>
                  <li>• <span className="text-white">Preferred Area</span> or <span className="text-white">Location</span></li>
                  <li>• <span className="text-white">Birthday</span></li>
                </ul>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div>
              <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                <p className="text-white">
                  <span className="font-bold">{parsedData.length}</span> leads ready to import
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Duplicates (same name + email) will be automatically skipped
                </p>
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto rounded-lg border border-dark-border">
                <table className="w-full text-sm">
                  <thead className="bg-dark-border">
                    <tr>
                      <th className="text-left p-3 text-gray-400 font-semibold">Name</th>
                      <th className="text-left p-3 text-gray-400 font-semibold">Email</th>
                      <th className="text-left p-3 text-gray-400 font-semibold">Phone</th>
                      <th className="text-left p-3 text-gray-400 font-semibold">Type</th>
                      <th className="text-left p-3 text-gray-400 font-semibold">Status</th>
                      <th className="text-left p-3 text-gray-400 font-semibold">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((lead, idx) => (
                      <tr key={idx} className="border-t border-dark-border">
                        <td className="p-3 text-white">{lead.name}</td>
                        <td className="p-3 text-gray-400">{lead.email || '—'}</td>
                        <td className="p-3 text-gray-400">{lead.phone || '—'}</td>
                        <td className="p-3 text-gray-400">{lead.type}</td>
                        <td className="p-3 text-gray-400">{lead.status}</td>
                        <td className="p-3 text-gray-400">{lead.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <div className="p-3 bg-dark-border/30 text-center text-gray-400 text-sm">
                    + {parsedData.length - 10} more leads...
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setStep('upload')
                    setFile(null)
                    setParsedData([])
                  }}
                  className="flex-1 px-6 py-3 border border-dark-border text-gray-400 rounded-lg hover:border-primary-500/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 btn-primary"
                >
                  {importing ? (
                    <>
                      <span className="animate-spin inline-block mr-2">⏳</span>
                      Importing...
                    </>
                  ) : (
                    `Import ${parsedData.length} Leads`
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && stats && (
            <div>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">
                  {stats.errors === 0 ? '✅' : stats.imported > 0 ? '⚠️' : '❌'}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Import Complete</h3>
                
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="text-3xl font-bold text-green-400">{stats.imported}</div>
                    <div className="text-sm text-gray-400">Imported</div>
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-400">{stats.skipped}</div>
                    <div className="text-sm text-gray-400">Skipped</div>
                  </div>
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="text-3xl font-bold text-red-400">{stats.errors}</div>
                    <div className="text-sm text-gray-400">Errors</div>
                  </div>
                </div>

                {stats.details.length > 0 && (
                  <div className="max-w-2xl mx-auto">
                    <details className="text-left">
                      <summary className="cursor-pointer text-gray-400 hover:text-white mb-2">
                        View Details ({stats.details.length} items)
                      </summary>
                      <div className="max-h-60 overflow-y-auto p-4 bg-dark-border/30 rounded-lg space-y-1">
                        {stats.details.map((detail, idx) => (
                          <div key={idx} className="text-sm text-gray-400">
                            {detail}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>

              <button
                onClick={handleClose}
                className="w-full btn-primary"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
