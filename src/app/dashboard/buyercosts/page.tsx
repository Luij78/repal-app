'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function BuyerClosingCostsPage() {
  const [values, setValues] = useState({
    purchasePrice: '', downPayment: '', loanAmount: '', interestRate: '7',
    loanOrigination: '1', appraisalFee: '500', creditReport: '50', floodCert: '20',
    titleInsurance: '', titleSearch: '300', surveyFee: '400', attorneyFees: '500',
    recordingFees: '150', transferTax: '', homeInspection: '450', pestInspection: '150',
    homeWarranty: '500', prepaidInterest: '', escrowTaxes: '', escrowInsurance: ''
  })
  const [results, setResults] = useState<any>(null)

  const calculate = () => {
    const price = parseFloat(values.purchasePrice) || 0
    const down = parseFloat(values.downPayment) || 0
    const loan = parseFloat(values.loanAmount) || (price - down)
    
    const loanCosts = {
      origination: loan * (parseFloat(values.loanOrigination) / 100),
      appraisal: parseFloat(values.appraisalFee) || 0,
      creditReport: parseFloat(values.creditReport) || 0,
      floodCert: parseFloat(values.floodCert) || 0
    }

    const titleCosts = {
      insurance: parseFloat(values.titleInsurance) || price * 0.005,
      search: parseFloat(values.titleSearch) || 0,
      survey: parseFloat(values.surveyFee) || 0,
      attorney: parseFloat(values.attorneyFees) || 0,
      recording: parseFloat(values.recordingFees) || 0,
      transfer: parseFloat(values.transferTax) || price * 0.001
    }

    const inspections = {
      home: parseFloat(values.homeInspection) || 0,
      pest: parseFloat(values.pestInspection) || 0,
      warranty: parseFloat(values.homeWarranty) || 0
    }

    const prepaids = {
      interest: parseFloat(values.prepaidInterest) || (loan * (parseFloat(values.interestRate) / 100 / 365) * 15),
      taxes: parseFloat(values.escrowTaxes) || (price * 0.012 / 12 * 3),
      insurance: parseFloat(values.escrowInsurance) || (price * 0.005 / 12 * 14)
    }

    const totalLoan = Object.values(loanCosts).reduce((a, b) => a + b, 0)
    const totalTitle = Object.values(titleCosts).reduce((a, b) => a + b, 0)
    const totalInspections = Object.values(inspections).reduce((a, b) => a + b, 0)
    const totalPrepaids = Object.values(prepaids).reduce((a, b) => a + b, 0)
    const totalClosing = totalLoan + totalTitle + totalInspections + totalPrepaids
    const totalCashNeeded = down + totalClosing

    setResults({
      purchasePrice: price,
      downPayment: down,
      loanAmount: loan,
      loanCosts: { ...loanCosts, total: totalLoan },
      titleCosts: { ...titleCosts, total: totalTitle },
      inspections: { ...inspections, total: totalInspections },
      prepaids: { ...prepaids, total: totalPrepaids },
      totalClosing,
      totalCashNeeded
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
          <h1 className="font-playfair text-2xl font-bold text-primary-400 mb-1">💵 Buyer Closing Costs</h1>
          <p className="text-gray-400 text-sm">Estimate what buyers need to bring to closing</p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-400 hover:text-white">← Dashboard</Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Purchase Details */}
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-5 border border-dark-border">
            <h3 className="text-primary-400 font-semibold mb-4 text-sm">🏠 Purchase Details</h3>
            <div className="space-y-4">
              <InputField label="Purchase Price" name="purchasePrice" prefix="$" placeholder="400000" />
              <InputField label="Down Payment" name="downPayment" prefix="$" placeholder="80000" />
              <InputField label="Interest Rate" name="interestRate" prefix="%" placeholder="7" />
            </div>
          </div>

          {/* Loan Costs */}
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-5 border border-dark-border">
            <h3 className="text-primary-400 font-semibold mb-4 text-sm">🏦 Loan Costs</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Loan Origination %" name="loanOrigination" prefix="%" placeholder="1" />
              <InputField label="Appraisal Fee" name="appraisalFee" prefix="$" placeholder="500" />
              <InputField label="Credit Report" name="creditReport" prefix="$" placeholder="50" />
              <InputField label="Flood Cert" name="floodCert" prefix="$" placeholder="20" />
            </div>
          </div>

          {/* Title & Gov Fees */}
          <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-5 border border-dark-border">
            <h3 className="text-primary-400 font-semibold mb-4 text-sm">📜 Title & Government Fees</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Title Insurance" name="titleInsurance" prefix="$" placeholder="Auto" />
              <InputField label="Title Search" name="titleSearch" prefix="$" placeholder="300" />
              <InputField label="Survey Fee" name="surveyFee" prefix="$" placeholder="400" />
              <InputField label="Recording Fees" name="recordingFees" prefix="$" placeholder="150" />
            </div>
          </div>

          <button onClick={calculate} className="w-full py-4 text-lg font-semibold bg-primary-500 text-dark-bg rounded-xl hover:bg-primary-400 transition-colors">
            📊 Calculate Closing Costs
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {results ? (
            <>
              {/* Total Cash Needed */}
              <div className="bg-gradient-to-br from-[#6B8DD6] to-[#5a7bc4] rounded-2xl p-6 text-white">
                <p className="text-sm opacity-80 mb-1">Total Cash Needed at Closing</p>
                <p className="text-4xl font-bold font-playfair">{formatCurrency(results.totalCashNeeded)}</p>
                <div className="mt-3 pt-3 border-t border-white/20 flex justify-between text-sm">
                  <span className="opacity-80">Down Payment</span>
                  <span>{formatCurrency(results.downPayment)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="opacity-80">Closing Costs</span>
                  <span>{formatCurrency(results.totalClosing)}</span>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-5 border border-dark-border">
                <h3 className="text-primary-400 font-semibold mb-4 text-sm">📊 Closing Costs Breakdown</h3>
                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-[#0D0D0D] rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">🏦 Loan Costs</span>
                      <span className="text-white font-semibold">{formatCurrency(results.loanCosts.total)}</span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between"><span>Origination</span><span>{formatCurrency(results.loanCosts.origination)}</span></div>
                      <div className="flex justify-between"><span>Appraisal</span><span>{formatCurrency(results.loanCosts.appraisal)}</span></div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0D0D0D] rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">📜 Title & Fees</span>
                      <span className="text-white font-semibold">{formatCurrency(results.titleCosts.total)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0D0D0D] rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">🔍 Inspections</span>
                      <span className="text-white font-semibold">{formatCurrency(results.inspections.total)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0D0D0D] rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">💰 Prepaids & Escrow</span>
                      <span className="text-white font-semibold">{formatCurrency(results.prepaids.total)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-3 border-t border-dark-border text-lg">
                    <span className="text-white font-semibold">Total Closing Costs</span>
                    <span className="text-primary-400 font-bold">{formatCurrency(results.totalClosing)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-[#4ECDC4]/20 text-[#4ECDC4] rounded-lg font-semibold hover:bg-[#4ECDC4]/30 transition-colors">
                  📤 Share with Buyer
                </button>
                <button className="flex-1 py-3 bg-[#6B8DD6]/20 text-[#6B8DD6] rounded-lg font-semibold hover:bg-[#6B8DD6]/30 transition-colors">
                  🖨️ Print
                </button>
              </div>
            </>
          ) : (
            <div className="bg-gradient-to-br from-dark-card to-[#1F1F1F] rounded-2xl p-8 border border-dark-border text-center">
              <span className="text-5xl mb-4 block">💵</span>
              <p className="text-gray-400">Enter purchase details to estimate closing costs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
