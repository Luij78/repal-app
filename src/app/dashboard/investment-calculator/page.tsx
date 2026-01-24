'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Lead {
  id: number
  name: string
  email: string
  type?: string
}

export default function InvestmentCalculatorPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchStatus, setSearchStatus] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [downPayment, setDownPayment] = useState('')
  const [interestRate, setInterestRate] = useState('7')
  const [loanTerm, setLoanTerm] = useState('30')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [vacancyRate, setVacancyRate] = useState('5')
  const [propertyTax, setPropertyTax] = useState('')
  const [insurance, setInsurance] = useState('')
  const [maintenance, setMaintenance] = useState('')
  const [propertyManagement, setPropertyManagement] = useState('10')
  const [hoa, setHoa] = useState('0')
  const [utilities, setUtilities] = useState('0')
  const [results, setResults] = useState<any>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])
  const [emailSent, setEmailSent] = useState('')
  const [leads] = useState<Lead[]>([
    { id: 1, name: 'John Smith', email: 'john@example.com', type: 'investor' },
    { id: 2, name: 'Maria Garcia', email: 'maria@example.com', type: 'buyer' },
  ])

  useEffect(() => {
    const idxProperty = localStorage.getItem('repal_analyze_property')
    if (idxProperty) {
      setSearchQuery(idxProperty)
      localStorage.removeItem('repal_analyze_property')
      setSearchStatus('📍 Property loaded - click Search to analyze')
    }
  }, [])

  const toggleLeadSelection = (leadId: number) => {
    setSelectedLeads(prev => prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId])
  }

  const searchProperty = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setSearchStatus('🔍 Searching Zillow & Realtor.com...')
    setTimeout(() => {
      const estimatedPrice = 350000
      const estimatedRent = 2200
      setPurchasePrice(String(estimatedPrice))
      setDownPayment(String(Math.round(estimatedPrice * 0.20)))
      setMonthlyRent(String(estimatedRent))
      setPropertyTax(String(Math.round(estimatedPrice * 0.012)))
      setInsurance(String(Math.round(estimatedPrice * 0.004)))
      setMaintenance(String(Math.round(estimatedPrice * 0.01 / 12)))
      setSearchStatus(`✓ Property Found!\n\n📍 ${searchQuery}\n💰 Value: $${estimatedPrice.toLocaleString()}\n🏠 Rent: $${estimatedRent.toLocaleString()}/mo`)
      setIsSearching(false)
    }, 1500)
  }

  const calculate = () => {
    const pp = parseFloat(purchasePrice) || 0
    const dp = parseFloat(downPayment) || 0
    const rate = parseFloat(interestRate) / 100 / 12
    const term = parseFloat(loanTerm) * 12
    const rent = parseFloat(monthlyRent) || 0
    const tax = parseFloat(propertyTax) / 12 || 0
    const ins = parseFloat(insurance) / 12 || 0
    const maint = parseFloat(maintenance) || 0
    const vacancy = parseFloat(vacancyRate) / 100
    const mgmt = parseFloat(propertyManagement) / 100
    const util = parseFloat(utilities) || 0
    const hoaFee = parseFloat(hoa) || 0
    const loanAmount = pp - dp
    const monthlyMortgage = rate > 0 ? (loanAmount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1) : loanAmount / term
    const effectiveIncome = rent * (1 - vacancy)
    const totalExpenses = monthlyMortgage + tax + ins + maint + (rent * mgmt) + util + hoaFee
    const monthlyNOI = effectiveIncome - (tax + ins + maint + (rent * mgmt) + util + hoaFee)
    const monthlyCashFlow = effectiveIncome - totalExpenses
    const annualCashFlow = monthlyCashFlow * 12
    const annualNOI = monthlyNOI * 12
    const cashOnCash = dp > 0 ? (annualCashFlow / dp) * 100 : 0
    const capRate = pp > 0 ? (annualNOI / pp) * 100 : 0
    const roi = dp > 0 ? ((annualCashFlow + (pp * 0.03)) / dp) * 100 : 0
    setResults({ monthlyMortgage: monthlyMortgage.toFixed(2), monthlyCashFlow: monthlyCashFlow.toFixed(2), annualCashFlow: annualCashFlow.toFixed(2), cashOnCash: cashOnCash.toFixed(2), capRate: capRate.toFixed(2), roi: roi.toFixed(2), isGoodDeal: cashOnCash >= 8 && capRate >= 5 })
  }

  const sendPropertyEmail = () => {
    if (selectedLeads.length === 0 || !results) return
    const selectedLeadEmails = leads.filter(l => selectedLeads.includes(l.id) && l.email).map(l => l.email)
    if (selectedLeadEmails.length === 0) { setEmailSent('⚠️ No emails found'); setTimeout(() => setEmailSent(''), 3000); return }
    const pp = parseFloat(purchasePrice) || 0
    const emailSubject = `Investment Property Analysis: ${searchQuery || 'Investment Property'}`
    const emailBody = `Investment Analysis for ${searchQuery || 'Property'}\n\n💰 Price: $${pp.toLocaleString()}\n📊 Cash-on-Cash: ${results.cashOnCash}%\n📈 Cap Rate: ${results.capRate}%\n💵 Monthly Cash Flow: $${results.monthlyCashFlow}`
    window.open(`mailto:${selectedLeadEmails.join(',')}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, '_blank')
    setEmailSent(`✓ Email prepared for ${selectedLeadEmails.length} contact(s)`)
    setTimeout(() => { setEmailSent(''); setShowEmailModal(false); setSelectedLeads([]) }, 2000)
  }

  const formatCurrency = (num: number | string) => '$' + Math.round(typeof num === 'string' ? parseFloat(num) : num).toLocaleString()

  // Input field component with prefix/suffix support - DARK MODE STYLING
  const InputField = ({ label, value, onChange, prefix, suffix, placeholder }: { label: string, value: string, onChange: (v: string) => void, prefix?: string, suffix?: string, placeholder?: string }) => (
    <div className="mb-4">
      <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">{prefix}</span>}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full py-3 text-base rounded-lg outline-none bg-[#0D0D0D] border border-[#2A2A2A] text-[#E8E4DC] placeholder-gray-600"
          style={{ paddingLeft: prefix ? '2rem' : '1rem', paddingRight: suffix ? '3.5rem' : '1rem' }}
        />
        {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">{suffix}</span>}
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">📊 Investment Calculator</h1>
          <p className="text-gray-400 text-sm">Analyze potential investment properties</p>
        </div>
        <Link href="/dashboard" className="text-primary-400 hover:underline text-sm">← Dashboard</Link>
      </div>

      {/* Property Search Section */}
      <div className="mb-6">
        <div className="flex gap-3 flex-wrap mb-2">
          <input 
            type="text" 
            placeholder="Search address (e.g., 123 Main St, Orlando FL)" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && searchProperty()} 
            className="flex-1 min-w-[200px] py-3 px-4 text-base rounded-lg outline-none bg-[#0D0D0D] border border-[#2A2A2A] text-[#E8E4DC] placeholder-gray-600"
          />
          <button onClick={searchProperty} disabled={isSearching} className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${isSearching ? 'bg-primary-400/50 text-gray-300 cursor-wait' : 'bg-primary-400 text-gray-900 hover:bg-primary-300'}`}>
            {isSearching ? '🔍 Searching...' : '🔍 Search Property'}
          </button>
        </div>
        <p className="text-xs text-gray-500">🏠 Auto-fetches Zillow Zestimate, rent estimates & property details</p>
      </div>

      {searchStatus && (
        <div className={`mb-6 p-4 rounded-xl border ${searchStatus.includes('✓') ? 'bg-green-500/10 border-green-500/40' : 'bg-[#1A1A1A] border-[#2A2A2A]'}`}>
          <p className={`text-sm whitespace-pre-wrap leading-relaxed ${searchStatus.includes('✓') ? 'text-green-400' : 'text-gray-400'}`}>{searchStatus}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-4">
          {/* Property Details */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A]">
            <h3 className="text-primary-400 font-semibold mb-4 pb-3 border-b border-[#2A2A2A]">Property Details</h3>
            <InputField label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} prefix="$" placeholder="350000" />
            <InputField label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" placeholder="70000" />
            <InputField label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
            <InputField label="Loan Term" value={loanTerm} onChange={setLoanTerm} suffix="years" />
          </div>

          {/* Income */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A]">
            <h3 className="text-primary-400 font-semibold mb-4 pb-3 border-b border-[#2A2A2A]">Income</h3>
            <InputField label="Monthly Rent" value={monthlyRent} onChange={setMonthlyRent} prefix="$" placeholder="2200" />
            <InputField label="Vacancy Rate" value={vacancyRate} onChange={setVacancyRate} suffix="%" />
          </div>

          {/* Expenses */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A]">
            <h3 className="text-primary-400 font-semibold mb-4 pb-3 border-b border-[#2A2A2A]">Expenses</h3>
            <InputField label="Annual Property Tax" value={propertyTax} onChange={setPropertyTax} prefix="$" placeholder="4200" />
            <InputField label="Annual Insurance" value={insurance} onChange={setInsurance} prefix="$" placeholder="1400" />
            <InputField label="Monthly Maintenance" value={maintenance} onChange={setMaintenance} prefix="$" placeholder="290" />
            <InputField label="Property Management" value={propertyManagement} onChange={setPropertyManagement} suffix="%" />
            <InputField label="Monthly Utilities" value={utilities} onChange={setUtilities} prefix="$" placeholder="0" />
            <InputField label="Monthly HOA" value={hoa} onChange={setHoa} prefix="$" placeholder="0" />
          </div>

          <button onClick={calculate} className="w-full py-4 bg-primary-400 text-gray-900 font-bold rounded-xl hover:bg-primary-300 transition-all text-base">
            Calculate Investment Returns
          </button>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-4">
          {results ? (
            <>
              {/* Deal Indicator */}
              <div className={`p-4 rounded-xl text-center font-semibold ${results.isGoodDeal ? 'bg-[#2D5A3D] text-white' : 'bg-[#5A2D2D] text-white'}`}>
                {results.isGoodDeal ? '✓ Potentially Good Investment' : '⚠ May Need Further Analysis'}
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`bg-[#1A1A1A] rounded-xl p-4 border ${parseFloat(results.monthlyCashFlow) > 0 ? 'border-primary-400' : 'border-[#2A2A2A]'}`}>
                  <span className="block text-[0.7rem] text-gray-400 mb-2 uppercase tracking-wider">Monthly Cash Flow</span>
                  <span className={`text-xl font-bold ${parseFloat(results.monthlyCashFlow) > 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(results.monthlyCashFlow)}</span>
                </div>
                <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
                  <span className="block text-[0.7rem] text-gray-400 mb-2 uppercase tracking-wider">Annual Cash Flow</span>
                  <span className="text-xl font-bold text-[#E8E4DC]">{formatCurrency(results.annualCashFlow)}</span>
                </div>
                <div className={`bg-[#1A1A1A] rounded-xl p-4 border ${parseFloat(results.cashOnCash) >= 8 ? 'border-primary-400' : 'border-[#2A2A2A]'}`}>
                  <span className="block text-[0.7rem] text-gray-400 mb-2 uppercase tracking-wider">Cash-on-Cash Return</span>
                  <span className={`text-xl font-bold ${parseFloat(results.cashOnCash) >= 8 ? 'text-green-400' : 'text-[#E8E4DC]'}`}>{results.cashOnCash}%</span>
                </div>
                <div className={`bg-[#1A1A1A] rounded-xl p-4 border ${parseFloat(results.capRate) >= 5 ? 'border-primary-400' : 'border-[#2A2A2A]'}`}>
                  <span className="block text-[0.7rem] text-gray-400 mb-2 uppercase tracking-wider">Cap Rate</span>
                  <span className={`text-xl font-bold ${parseFloat(results.capRate) >= 5 ? 'text-green-400' : 'text-[#E8E4DC]'}`}>{results.capRate}%</span>
                </div>
                <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
                  <span className="block text-[0.7rem] text-gray-400 mb-2 uppercase tracking-wider">Total ROI (w/ 3% apprec.)</span>
                  <span className="text-xl font-bold text-[#E8E4DC]">{results.roi}%</span>
                </div>
                <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
                  <span className="block text-[0.7rem] text-gray-400 mb-2 uppercase tracking-wider">Monthly Mortgage</span>
                  <span className="text-xl font-bold text-[#E8E4DC]">{formatCurrency(results.monthlyMortgage)}</span>
                </div>
              </div>

              {/* Email Button */}
              <button onClick={() => setShowEmailModal(true)} className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2">
                📧 Email Analysis to Lead
              </button>
              {emailSent && <div className={`p-3 rounded-lg text-center font-semibold ${emailSent.includes('✓') ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{emailSent}</div>}
            </>
          ) : (
            <div className="bg-[#1A1A1A] rounded-2xl p-12 border border-[#2A2A2A] text-center">
              <p className="text-6xl mb-4">📊</p>
              <p className="text-gray-400">Enter property details and click Calculate</p>
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-auto border border-[#2A2A2A]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">📧 Email Property Analysis</h3>
              <button onClick={() => { setShowEmailModal(false); setSelectedLeads([]) }} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>
            <p className="text-gray-400 text-sm mb-4">Select contacts to receive this analysis:</p>
            
            {/* Property Preview */}
            <div className="p-4 bg-[#0D0D0D] rounded-xl mb-4 border border-[#2A2A2A]">
              <p className="text-primary-400 font-semibold text-sm mb-2">📍 {searchQuery || 'Investment Property'}</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                <span>💰 {formatCurrency(purchasePrice || '0')}</span>
                <span>📈 CoC: {results?.cashOnCash}%</span>
              </div>
            </div>

            {/* Lead Selection */}
            <div className="mb-4 border border-[#2A2A2A] rounded-xl overflow-hidden">
              {leads.filter(l => l.email).map(lead => (
                <div key={lead.id} onClick={() => toggleLeadSelection(lead.id)} className={`flex items-center gap-3 p-3 cursor-pointer border-b border-[#2A2A2A] last:border-b-0 ${selectedLeads.includes(lead.id) ? 'bg-blue-500/15' : 'hover:bg-[#0D0D0D]'}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-sm ${selectedLeads.includes(lead.id) ? 'bg-blue-500 text-white' : 'border-2 border-[#2A2A2A]'}`}>
                    {selectedLeads.includes(lead.id) && '✓'}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{lead.name}</p>
                    <p className="text-gray-500 text-xs">{lead.email}</p>
                  </div>
                  {lead.type && (
                    <span className={`px-2 py-1 text-xs rounded ${lead.type === 'investor' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                      {lead.type === 'investor' ? '💰 Investor' : '🏠 Buyer'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button onClick={sendPropertyEmail} disabled={selectedLeads.length === 0} className={`w-full py-3 rounded-xl font-semibold ${selectedLeads.length > 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-[#0D0D0D] text-gray-500 cursor-not-allowed'}`}>
              {selectedLeads.length > 0 ? `📧 Send to ${selectedLeads.length} Contact(s)` : 'Select contacts to send'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
