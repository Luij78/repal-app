'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CommercialPage() {
  const [values, setValues] = useState({
    purchasePrice: '', rentPerSqFt: '', sqFt: '', capRate: '',
    propertyTax: '', insurance: '', cam: '', vacancy: '5'
  })
  const [results, setResults] = useState<any>(null)

  const calculate = () => {
    const price = parseFloat(values.purchasePrice) || 0
    const rentPsf = parseFloat(values.rentPerSqFt) || 0
    const sqft = parseFloat(values.sqFt) || 0
    const vacancy = parseFloat(values.vacancy) || 5
    const tax = parseFloat(values.propertyTax) || 0
    const ins = parseFloat(values.insurance) || 0
    const cam = parseFloat(values.cam) || 0

    const grossRent = rentPsf * sqft * 12
    const effectiveGrossIncome = grossRent * (1 - vacancy / 100)
    const totalExpenses = tax + ins + cam
    const noi = effectiveGrossIncome - totalExpenses
    const capRate = price > 0 ? (noi / price) * 100 : 0
    const cashOnCash = price > 0 ? ((noi) / (price * 0.25)) * 100 : 0 // Assuming 25% down

    setResults({
      grossRent,
      effectiveGrossIncome,
      totalExpenses,
      noi,
      capRate,
      cashOnCash,
      monthlyNOI: noi / 12,
      pricePerSqFt: sqft > 0 ? price / sqft : 0
    })
  }

  const formatCurrency = (num: number) => '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const InputField = ({ label, name, prefix, placeholder, suffix }: { label: string; name: string; prefix?: string; placeholder?: string; suffix?: string }) => (
    <div>
      <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">{label}</label>
      <div className="flex items-center bg-[#0D0D0D] border border-dark-border rounded-lg overflow-hidden focus-within:border-primary-500">
        {prefix && <span className="pl-3 text-gray-500">{prefix}</span>}
        <input
          type="number"
          value={values[name as keyof typeof values]}
          onChange={(e) => setValues({ ...values, [name]: e.target.value })}
          placeholder={placeholder}
          className="flex-1 px-3 py-3 bg-transparent text-white outline-none"
        />
        {suffix && <span className="pr-3 text-gray-500">{suffix}</span>}
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">🏢 Triple Net Calculator</h1>
          <p className="text-gray-400 text-sm">Analyze commercial NNN lease investments</p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
        <h3 className="text-blue-400 font-semibold text-sm mb-1">ℹ️ What is a Triple Net (NNN) Lease?</h3>
        <p className="text-sm text-gray-400">In a NNN lease, the tenant pays property taxes, insurance, and maintenance (CAM) in addition to rent. This calculator helps analyze the investment return.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Property Details */}
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-5 border border-dark-border">
            <h3 className="text-primary-400 font-semibold mb-4 text-sm">🏢 Property Details</h3>
            <div className="space-y-4">
              <InputField label="Purchase Price" name="purchasePrice" prefix="$" placeholder="1500000" />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Square Footage" name="sqFt" placeholder="5000" suffix="SF" />
                <InputField label="Rent per SF/Year" name="rentPerSqFt" prefix="$" placeholder="25" />
              </div>
            </div>
          </div>

          {/* Operating Expenses */}
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-5 border border-dark-border">
            <h3 className="text-primary-400 font-semibold mb-4 text-sm">💰 Annual Operating Expenses (Passed to Tenant)</h3>
            <div className="space-y-4">
              <InputField label="Property Tax" name="propertyTax" prefix="$" placeholder="18000" />
              <InputField label="Insurance" name="insurance" prefix="$" placeholder="5000" />
              <InputField label="CAM (Maintenance)" name="cam" prefix="$" placeholder="8000" />
              <InputField label="Vacancy Rate" name="vacancy" placeholder="5" suffix="%" />
            </div>
          </div>

          <button onClick={calculate} className="w-full py-4 text-lg font-semibold bg-primary-500 text-dark-bg rounded-xl hover:bg-primary-400 transition-colors">
            📊 Calculate Returns
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {results ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#4A9B7F] to-[#3d8268] rounded-2xl p-5 text-white">
                  <p className="text-sm opacity-80 mb-1">Cap Rate</p>
                  <p className="text-3xl font-bold font-playfair">{results.capRate.toFixed(2)}%</p>
                </div>
                <div className="bg-gradient-to-br from-[#6B8DD6] to-[#5a7bc4] rounded-2xl p-5 text-white">
                  <p className="text-sm opacity-80 mb-1">Cash-on-Cash (25% down)</p>
                  <p className="text-3xl font-bold font-playfair">{results.cashOnCash.toFixed(2)}%</p>
                </div>
              </div>

              {/* NOI Card */}
              <div className="bg-gradient-to-br from-primary-500 to-[#B8960C] rounded-2xl p-6 text-dark-bg">
                <p className="text-sm opacity-80 mb-1">Net Operating Income (NOI)</p>
                <p className="text-4xl font-bold font-playfair">{formatCurrency(results.noi)}/yr</p>
                <p className="text-sm mt-2 opacity-80">{formatCurrency(results.monthlyNOI)}/month</p>
              </div>

              {/* Breakdown */}
              <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-5 border border-dark-border">
                <h3 className="text-primary-400 font-semibold mb-4 text-sm">📊 Income Analysis</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-dark-border">
                    <span className="text-gray-400">Gross Scheduled Rent</span>
                    <span className="text-white font-semibold">{formatCurrency(results.grossRent)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-border">
                    <span className="text-gray-400">− Vacancy ({values.vacancy}%)</span>
                    <span className="text-[#E74C3C]">-{formatCurrency(results.grossRent - results.effectiveGrossIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-border">
                    <span className="text-gray-400">= Effective Gross Income</span>
                    <span className="text-white">{formatCurrency(results.effectiveGrossIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-border">
                    <span className="text-gray-400">− Operating Expenses</span>
                    <span className="text-[#E74C3C]">-{formatCurrency(results.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between py-3 text-lg">
                    <span className="text-white font-semibold">Net Operating Income</span>
                    <span className="text-[#4A9B7F] font-bold">{formatCurrency(results.noi)}</span>
                  </div>
                </div>
              </div>

              {/* Property Metrics */}
              <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-5 border border-dark-border">
                <h3 className="text-primary-400 font-semibold mb-4 text-sm">🏢 Property Metrics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-[#0D0D0D] rounded-lg">
                    <p className="text-gray-500 text-xs mb-1">Price per SF</p>
                    <p className="text-white font-semibold">{formatCurrency(results.pricePerSqFt)}</p>
                  </div>
                  <div className="p-3 bg-[#0D0D0D] rounded-lg">
                    <p className="text-gray-500 text-xs mb-1">Rent per SF</p>
                    <p className="text-white font-semibold">${values.rentPerSqFt}/yr</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-[#4ECDC4]/20 text-[#4ECDC4] rounded-lg font-semibold hover:bg-[#4ECDC4]/30 transition-colors">
                  📤 Share Analysis
                </button>
                <button className="flex-1 py-3 bg-[#6B8DD6]/20 text-[#6B8DD6] rounded-lg font-semibold hover:bg-[#6B8DD6]/30 transition-colors">
                  🖨️ Print
                </button>
              </div>
            </>
          ) : (
            <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-8 border border-dark-border text-center">
              <span className="text-5xl mb-4 block">🏢</span>
              <p className="text-gray-400">Enter property details to analyze the investment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
