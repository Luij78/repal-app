'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SellerNetSheetPage() {
  const [values, setValues] = useState({
    salePrice: '', mortgageBalance: '', secondMortgage: '', commissionRate: '6',
    titleInsurance: '', escrowFees: '', recordingFees: '', transferTax: '',
    repairCredits: '', homeWarranty: '', prorations: '', otherFees: ''
  })
  const [results, setResults] = useState<any>(null)

  const calculate = () => {
    const sale = parseFloat(values.salePrice) || 0
    const mortgage = parseFloat(values.mortgageBalance) || 0
    const second = parseFloat(values.secondMortgage) || 0
    const commission = sale * (parseFloat(values.commissionRate) / 100)
    const title = parseFloat(values.titleInsurance) || 0
    const escrow = parseFloat(values.escrowFees) || 0
    const recording = parseFloat(values.recordingFees) || 0
    const transfer = parseFloat(values.transferTax) || 0
    const repairs = parseFloat(values.repairCredits) || 0
    const warranty = parseFloat(values.homeWarranty) || 0
    const prorations = parseFloat(values.prorations) || 0
    const other = parseFloat(values.otherFees) || 0

    const totalPayoffs = mortgage + second
    const totalClosingCosts = commission + title + escrow + recording + transfer + repairs + warranty + other
    const netProceeds = sale - totalPayoffs - totalClosingCosts + prorations

    setResults({
      salePrice: sale,
      totalPayoffs,
      commission,
      totalClosingCosts,
      prorations,
      netProceeds
    })
  }

  const formatCurrency = (num: number) => '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const InputField = ({ label, name, prefix, placeholder }: { label: string; name: string; prefix?: string; placeholder?: string }) => (
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
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">🏠 Seller Net Sheet</h1>
          <p className="text-gray-400 text-sm">Calculate estimated seller proceeds</p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Sale Details */}
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-5 border border-dark-border">
            <h3 className="text-primary-400 font-semibold mb-4 text-sm">💰 Sale Details</h3>
            <div className="space-y-4">
              <InputField label="Sale Price" name="salePrice" prefix="$" placeholder="500000" />
              <InputField label="Commission Rate" name="commissionRate" prefix="%" placeholder="6" />
            </div>
          </div>

          {/* Payoffs */}
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-5 border border-dark-border">
            <h3 className="text-primary-400 font-semibold mb-4 text-sm">🏦 Loan Payoffs</h3>
            <div className="space-y-4">
              <InputField label="Mortgage Balance" name="mortgageBalance" prefix="$" placeholder="300000" />
              <InputField label="Second Mortgage / HELOC" name="secondMortgage" prefix="$" placeholder="0" />
            </div>
          </div>

          {/* Closing Costs */}
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-5 border border-dark-border">
            <h3 className="text-primary-400 font-semibold mb-4 text-sm">📝 Closing Costs</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Title Insurance" name="titleInsurance" prefix="$" placeholder="2500" />
              <InputField label="Escrow Fees" name="escrowFees" prefix="$" placeholder="1500" />
              <InputField label="Recording Fees" name="recordingFees" prefix="$" placeholder="150" />
              <InputField label="Transfer Tax" name="transferTax" prefix="$" placeholder="500" />
              <InputField label="Repair Credits" name="repairCredits" prefix="$" placeholder="0" />
              <InputField label="Home Warranty" name="homeWarranty" prefix="$" placeholder="500" />
              <InputField label="Prorations (+/-)" name="prorations" prefix="$" placeholder="0" />
              <InputField label="Other Fees" name="otherFees" prefix="$" placeholder="0" />
            </div>
          </div>

          <button onClick={calculate} className="w-full py-4 text-lg font-semibold bg-primary-500 text-dark-bg rounded-xl hover:bg-primary-400 transition-colors">
            📊 Calculate Net Proceeds
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {results ? (
            <>
              {/* Net Proceeds Card */}
              <div className="bg-gradient-to-br from-[#4A9B7F] to-[#3d8268] rounded-2xl p-6 text-white">
                <p className="text-sm opacity-80 mb-1">Estimated Net Proceeds</p>
                <p className="text-4xl font-bold font-playfair">{formatCurrency(results.netProceeds)}</p>
                <p className="text-sm opacity-80 mt-2">
                  {results.netProceeds > 0 ? '✓ Seller walks away with cash' : '⚠️ Seller may need to bring funds'}
                </p>
              </div>

              {/* Breakdown */}
              <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-5 border border-dark-border">
                <h3 className="text-primary-400 font-semibold mb-4 text-sm">📊 Breakdown</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-dark-border">
                    <span className="text-gray-400">Sale Price</span>
                    <span className="text-white font-semibold">{formatCurrency(results.salePrice)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-border">
                    <span className="text-gray-400">− Loan Payoffs</span>
                    <span className="text-[#E74C3C]">-{formatCurrency(results.totalPayoffs)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-border">
                    <span className="text-gray-400">− Commission ({values.commissionRate}%)</span>
                    <span className="text-[#E74C3C]">-{formatCurrency(results.commission)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dark-border">
                    <span className="text-gray-400">− Closing Costs</span>
                    <span className="text-[#E74C3C]">-{formatCurrency(results.totalClosingCosts - results.commission)}</span>
                  </div>
                  {results.prorations !== 0 && (
                    <div className="flex justify-between py-2 border-b border-dark-border">
                      <span className="text-gray-400">{results.prorations > 0 ? '+' : '−'} Prorations</span>
                      <span className={results.prorations > 0 ? 'text-[#4A9B7F]' : 'text-[#E74C3C]'}>
                        {results.prorations > 0 ? '+' : '-'}{formatCurrency(Math.abs(results.prorations))}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 text-lg">
                    <span className="text-white font-semibold">Net Proceeds</span>
                    <span className={`font-bold ${results.netProceeds >= 0 ? 'text-[#4A9B7F]' : 'text-[#E74C3C]'}`}>
                      {formatCurrency(results.netProceeds)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-[#4ECDC4]/20 text-[#4ECDC4] rounded-lg font-semibold hover:bg-[#4ECDC4]/30 transition-colors">
                  📤 Share with Client
                </button>
                <button className="flex-1 py-3 bg-[#6B8DD6]/20 text-[#6B8DD6] rounded-lg font-semibold hover:bg-[#6B8DD6]/30 transition-colors">
                  🖨️ Print
                </button>
              </div>
            </>
          ) : (
            <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-8 border border-dark-border text-center">
              <span className="text-5xl mb-4 block">🏠</span>
              <p className="text-gray-400">Enter sale details and click calculate to see estimated net proceeds.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
