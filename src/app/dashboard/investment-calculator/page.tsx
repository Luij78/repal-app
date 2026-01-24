'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function InvestmentCalculatorPage() {
  // Property Details
  const [purchasePrice, setPurchasePrice] = useState('')
  const [downPaymentPercent, setDownPaymentPercent] = useState('20')
  const [interestRate, setInterestRate] = useState('7.0')
  const [loanTerm, setLoanTerm] = useState('30')
  
  // Rental Income
  const [monthlyRent, setMonthlyRent] = useState('')
  const [otherIncome, setOtherIncome] = useState('0')
  const [vacancyRate, setVacancyRate] = useState('5')
  
  // Operating Expenses
  const [propertyTax, setPropertyTax] = useState('')
  const [insurance, setInsurance] = useState('')
  const [maintenance, setMaintenance] = useState('5')
  const [propertyManagement, setPropertyManagement] = useState('8')
  const [hoa, setHoa] = useState('0')
  const [utilities, setUtilities] = useState('0')
  
  // Results
  const [showResults, setShowResults] = useState(false)

  const calculateInvestment = () => {
    const price = parseFloat(purchasePrice) || 0
    const downPaymentPct = parseFloat(downPaymentPercent) || 0
    const rate = parseFloat(interestRate) || 0
    const term = parseInt(loanTerm) || 30
    const rent = parseFloat(monthlyRent) || 0
    const other = parseFloat(otherIncome) || 0
    const vacancy = parseFloat(vacancyRate) || 0
    const tax = parseFloat(propertyTax) || 0
    const ins = parseFloat(insurance) || 0
    const maint = parseFloat(maintenance) || 0
    const mgmt = parseFloat(propertyManagement) || 0
    const hoaFee = parseFloat(hoa) || 0
    const util = parseFloat(utilities) || 0

    // Loan calculations
    const downPayment = price * (downPaymentPct / 100)
    const loanAmount = price - downPayment
    const monthlyRate = (rate / 100) / 12
    const numPayments = term * 12
    
    // Monthly mortgage payment (P&I)
    let monthlyMortgage = 0
    if (monthlyRate > 0) {
      monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    } else {
      monthlyMortgage = loanAmount / numPayments
    }

    // Gross income
    const grossMonthlyRent = rent + other
    const effectiveGrossIncome = grossMonthlyRent * (1 - vacancy / 100)
    const annualGrossIncome = effectiveGrossIncome * 12

    // Operating expenses (monthly)
    const monthlyTax = tax / 12
    const monthlyIns = ins / 12
    const monthlyMaint = (rent * maint / 100)
    const monthlyMgmt = (rent * mgmt / 100)
    const monthlyExpenses = monthlyTax + monthlyIns + monthlyMaint + monthlyMgmt + hoaFee + util

    // Annual operating expenses
    const annualExpenses = monthlyExpenses * 12

    // NOI (Net Operating Income)
    const noi = annualGrossIncome - annualExpenses

    // Cash flow
    const monthlyCashFlow = effectiveGrossIncome - monthlyExpenses - monthlyMortgage
    const annualCashFlow = monthlyCashFlow * 12

    // Key metrics
    const capRate = price > 0 ? (noi / price) * 100 : 0
    const cashOnCash = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0
    const grossRentMultiplier = rent > 0 ? price / (rent * 12) : 0
    const debtServiceCoverageRatio = monthlyMortgage > 0 ? noi / (monthlyMortgage * 12) : 0

    // Total cash needed
    const closingCosts = price * 0.03 // Estimate 3%
    const totalCashNeeded = downPayment + closingCosts

    return {
      purchasePrice: price,
      downPayment,
      loanAmount,
      monthlyMortgage,
      grossMonthlyRent,
      effectiveGrossIncome,
      annualGrossIncome,
      monthlyExpenses,
      annualExpenses,
      noi,
      monthlyCashFlow,
      annualCashFlow,
      capRate,
      cashOnCash,
      grossRentMultiplier,
      debtServiceCoverageRatio,
      closingCosts,
      totalCashNeeded
    }
  }

  const results = calculateInvestment()

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num)
  }

  const formatPercent = (num: number) => {
    return num.toFixed(2) + '%'
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            📊 Investment Calculator
          </h1>
          <p className="text-gray-400 text-sm">Analyze rental property ROI and cash flow</p>
        </div>
        <Link href="/dashboard" className="text-primary-400 hover:underline text-sm">
          ← Dashboard
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Property Details */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>🏠</span> Property Details
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Purchase Price</label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="350000"
                  className="input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Down Payment %</label>
                  <input
                    type="number"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Interest Rate %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Loan Term (years)</label>
                <select
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  className="input w-full"
                >
                  <option value="30">30 years</option>
                  <option value="20">20 years</option>
                  <option value="15">15 years</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rental Income */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>💵</span> Rental Income
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Monthly Rent</label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  placeholder="2500"
                  className="input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Other Income/mo</label>
                  <input
                    type="number"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(e.target.value)}
                    placeholder="0"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Vacancy Rate %</label>
                  <input
                    type="number"
                    value={vacancyRate}
                    onChange={(e) => setVacancyRate(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Operating Expenses */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>📋</span> Operating Expenses
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Property Tax/yr</label>
                  <input
                    type="number"
                    value={propertyTax}
                    onChange={(e) => setPropertyTax(e.target.value)}
                    placeholder="4200"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Insurance/yr</label>
                  <input
                    type="number"
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    placeholder="1800"
                    className="input w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Maintenance %</label>
                  <input
                    type="number"
                    value={maintenance}
                    onChange={(e) => setMaintenance(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Property Mgmt %</label>
                  <input
                    type="number"
                    value={propertyManagement}
                    onChange={(e) => setPropertyManagement(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">HOA/mo</label>
                  <input
                    type="number"
                    value={hoa}
                    onChange={(e) => setHoa(e.target.value)}
                    placeholder="0"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Utilities/mo</label>
                  <input
                    type="number"
                    value={utilities}
                    onChange={(e) => setUtilities(e.target.value)}
                    placeholder="0"
                    className="input w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="card bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>🎯</span> Key Metrics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-dark-bg rounded-lg">
                <p className="text-2xl sm:text-3xl font-bold text-green-400">{formatPercent(results.capRate)}</p>
                <p className="text-xs text-gray-400">Cap Rate</p>
              </div>
              <div className="text-center p-3 bg-dark-bg rounded-lg">
                <p className={`text-2xl sm:text-3xl font-bold ${results.cashOnCash >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(results.cashOnCash)}
                </p>
                <p className="text-xs text-gray-400">Cash on Cash</p>
              </div>
              <div className="text-center p-3 bg-dark-bg rounded-lg">
                <p className="text-2xl sm:text-3xl font-bold text-blue-400">{results.grossRentMultiplier.toFixed(1)}</p>
                <p className="text-xs text-gray-400">GRM</p>
              </div>
              <div className="text-center p-3 bg-dark-bg rounded-lg">
                <p className={`text-2xl sm:text-3xl font-bold ${results.debtServiceCoverageRatio >= 1.25 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {results.debtServiceCoverageRatio.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">DSCR</p>
              </div>
            </div>
          </div>

          {/* Monthly Cash Flow */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>💰</span> Cash Flow
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-dark-bg rounded-lg">
                <span className="text-gray-400">Monthly Cash Flow</span>
                <span className={`text-xl font-bold ${results.monthlyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(results.monthlyCashFlow)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-bg rounded-lg">
                <span className="text-gray-400">Annual Cash Flow</span>
                <span className={`text-xl font-bold ${results.annualCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(results.annualCashFlow)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-bg rounded-lg">
                <span className="text-gray-400">NOI (Annual)</span>
                <span className="text-xl font-bold text-white">{formatCurrency(results.noi)}</span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>📊</span> Breakdown
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-dark-border">
                <span className="text-gray-400">Purchase Price</span>
                <span className="text-white">{formatCurrency(results.purchasePrice)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-border">
                <span className="text-gray-400">Down Payment</span>
                <span className="text-white">{formatCurrency(results.downPayment)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-border">
                <span className="text-gray-400">Loan Amount</span>
                <span className="text-white">{formatCurrency(results.loanAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-border">
                <span className="text-gray-400">Est. Closing Costs (3%)</span>
                <span className="text-white">{formatCurrency(results.closingCosts)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-border">
                <span className="text-gray-400 font-semibold">Total Cash Needed</span>
                <span className="text-primary-400 font-semibold">{formatCurrency(results.totalCashNeeded)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-border">
                <span className="text-gray-400">Monthly Mortgage (P&I)</span>
                <span className="text-white">{formatCurrency(results.monthlyMortgage)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-border">
                <span className="text-gray-400">Monthly Expenses</span>
                <span className="text-white">{formatCurrency(results.monthlyExpenses)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Effective Gross Income/mo</span>
                <span className="text-white">{formatCurrency(results.effectiveGrossIncome)}</span>
              </div>
            </div>
          </div>

          {/* Investment Rating */}
          <div className={`card border ${results.cashOnCash >= 10 ? 'border-green-500/50 bg-green-500/10' : results.cashOnCash >= 5 ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
            <div className="text-center">
              <span className="text-3xl mb-2 block">
                {results.cashOnCash >= 10 ? '🌟' : results.cashOnCash >= 5 ? '👍' : '⚠️'}
              </span>
              <p className={`font-bold ${results.cashOnCash >= 10 ? 'text-green-400' : results.cashOnCash >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                {results.cashOnCash >= 10 ? 'Strong Investment' : results.cashOnCash >= 5 ? 'Moderate Investment' : 'Below Target Returns'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {results.cashOnCash >= 10 ? 'This property exceeds typical cash-on-cash targets' : results.cashOnCash >= 5 ? 'Returns are acceptable but could be better' : 'Consider negotiating price or finding higher rents'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
