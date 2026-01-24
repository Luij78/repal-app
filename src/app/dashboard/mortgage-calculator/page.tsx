'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function MortgageCalculatorPage() {
  // Loan Details
  const [homePrice, setHomePrice] = useState('')
  const [downPayment, setDownPayment] = useState('')
  const [downPaymentPercent, setDownPaymentPercent] = useState('20')
  const [interestRate, setInterestRate] = useState('7.0')
  const [loanTerm, setLoanTerm] = useState('30')
  const [loanType, setLoanType] = useState('conventional')
  
  // Additional Costs
  const [propertyTax, setPropertyTax] = useState('')
  const [homeInsurance, setHomeInsurance] = useState('')
  const [pmi, setPmi] = useState('0.5')
  const [hoa, setHoa] = useState('0')
  
  // Use percentage or fixed amount for down payment
  const [usePercent, setUsePercent] = useState(true)

  // Sync down payment with percentage
  useEffect(() => {
    if (usePercent && homePrice) {
      const price = parseFloat(homePrice) || 0
      const percent = parseFloat(downPaymentPercent) || 0
      setDownPayment((price * percent / 100).toFixed(0))
    }
  }, [homePrice, downPaymentPercent, usePercent])

  // Calculate mortgage
  const calculateMortgage = () => {
    const price = parseFloat(homePrice) || 0
    const down = parseFloat(downPayment) || 0
    const rate = parseFloat(interestRate) || 0
    const term = parseInt(loanTerm) || 30
    const tax = parseFloat(propertyTax) || 0
    const insurance = parseFloat(homeInsurance) || 0
    const pmiRate = parseFloat(pmi) || 0
    const hoaFee = parseFloat(hoa) || 0

    const loanAmount = price - down
    const downPaymentPct = price > 0 ? (down / price) * 100 : 0
    const monthlyRate = (rate / 100) / 12
    const numPayments = term * 12

    // Monthly P&I
    let monthlyPI = 0
    if (monthlyRate > 0) {
      monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    } else {
      monthlyPI = loanAmount / numPayments
    }

    // Monthly property tax
    const monthlyTax = tax / 12

    // Monthly insurance
    const monthlyInsurance = insurance / 12

    // PMI (only if down payment < 20%)
    let monthlyPMI = 0
    if (downPaymentPct < 20 && loanType === 'conventional') {
      monthlyPMI = (loanAmount * (pmiRate / 100)) / 12
    }

    // FHA MIP
    let monthlyMIP = 0
    if (loanType === 'fha') {
      // Upfront MIP is 1.75%, annual MIP is 0.85% for most loans
      monthlyMIP = (loanAmount * 0.0085) / 12
    }

    // VA funding fee is usually rolled into loan, no monthly PMI
    // USDA has 0.35% annual fee
    let monthlyUSDA = 0
    if (loanType === 'usda') {
      monthlyUSDA = (loanAmount * 0.0035) / 12
    }

    // Total monthly payment
    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI + monthlyMIP + monthlyUSDA + hoaFee

    // Total interest over life of loan
    const totalPayments = monthlyPI * numPayments
    const totalInterest = totalPayments - loanAmount

    // Generate amortization (first year)
    const amortization = []
    let balance = loanAmount
    for (let i = 1; i <= 12; i++) {
      const interestPayment = balance * monthlyRate
      const principalPayment = monthlyPI - interestPayment
      balance -= principalPayment
      amortization.push({
        month: i,
        principal: principalPayment,
        interest: interestPayment,
        balance: balance
      })
    }

    return {
      homePrice: price,
      downPayment: down,
      downPaymentPercent: downPaymentPct,
      loanAmount,
      monthlyPI,
      monthlyTax,
      monthlyInsurance,
      monthlyPMI,
      monthlyMIP,
      monthlyUSDA,
      hoaFee,
      totalMonthly,
      totalPayments,
      totalInterest,
      amortization
    }
  }

  const results = calculateMortgage()

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num)
  }

  const formatCurrencyDecimal = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
  }

  // Calculate percentage for pie chart
  const getPercentage = (value: number) => {
    if (results.totalMonthly === 0) return 0
    return (value / results.totalMonthly) * 100
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            🏦 Mortgage Calculator
          </h1>
          <p className="text-gray-400 text-sm">Calculate your monthly mortgage payment</p>
        </div>
        <Link href="/dashboard" className="text-primary-400 hover:underline text-sm">
          ← Dashboard
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Loan Details */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>🏠</span> Loan Details
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Home Price</label>
                <input
                  type="number"
                  value={homePrice}
                  onChange={(e) => setHomePrice(e.target.value)}
                  placeholder="400000"
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Down Payment</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={usePercent ? downPaymentPercent : downPayment}
                    onChange={(e) => {
                      if (usePercent) {
                        setDownPaymentPercent(e.target.value)
                      } else {
                        setDownPayment(e.target.value)
                      }
                    }}
                    className="input flex-1"
                  />
                  <button
                    onClick={() => setUsePercent(!usePercent)}
                    className="px-3 py-2 bg-dark-border rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {usePercent ? '%' : '$'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {usePercent ? formatCurrency(results.downPayment) : `${results.downPaymentPercent.toFixed(1)}%`}
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Loan Type</label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="input w-full"
                >
                  <option value="conventional">Conventional</option>
                  <option value="fha">FHA</option>
                  <option value="va">VA</option>
                  <option value="usda">USDA</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Interest Rate %</label>
                  <input
                    type="number"
                    step="0.125"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Loan Term</label>
                  <select
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    className="input w-full"
                  >
                    <option value="30">30 years</option>
                    <option value="20">20 years</option>
                    <option value="15">15 years</option>
                    <option value="10">10 years</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Costs */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>💵</span> Additional Costs
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Property Tax/yr</label>
                  <input
                    type="number"
                    value={propertyTax}
                    onChange={(e) => setPropertyTax(e.target.value)}
                    placeholder="4800"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Insurance/yr</label>
                  <input
                    type="number"
                    value={homeInsurance}
                    onChange={(e) => setHomeInsurance(e.target.value)}
                    placeholder="1800"
                    className="input w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">PMI Rate % (if &lt;20% down)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pmi}
                    onChange={(e) => setPmi(e.target.value)}
                    className="input w-full"
                  />
                </div>
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
              </div>
            </div>
          </div>

          {/* Loan Type Info */}
          <div className="card bg-blue-500/10 border-blue-500/30">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <span>ℹ️</span> {loanType.toUpperCase()} Loan Info
            </h3>
            <p className="text-sm text-gray-400">
              {loanType === 'conventional' && 'Conventional loans require minimum 3-5% down. PMI required if down payment is less than 20%.'}
              {loanType === 'fha' && 'FHA loans require minimum 3.5% down with 580+ credit score. MIP (mortgage insurance) is required for the life of the loan.'}
              {loanType === 'va' && 'VA loans are available to eligible veterans with 0% down. No PMI required. Funding fee may apply.'}
              {loanType === 'usda' && 'USDA loans are for rural areas with 0% down for eligible buyers. Annual guarantee fee of 0.35% applies.'}
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {/* Monthly Payment */}
          <div className="card bg-gradient-to-br from-primary-500/10 to-blue-500/10 border-primary-500/30">
            <div className="text-center mb-4">
              <p className="text-gray-400 text-sm">Monthly Payment</p>
              <p className="text-4xl sm:text-5xl font-bold text-white">{formatCurrency(results.totalMonthly)}</p>
            </div>
            
            {/* Payment Breakdown Bar */}
            <div className="h-4 rounded-full overflow-hidden flex mb-4">
              <div 
                className="bg-blue-500" 
                style={{ width: `${getPercentage(results.monthlyPI)}%` }}
                title="Principal & Interest"
              />
              <div 
                className="bg-green-500" 
                style={{ width: `${getPercentage(results.monthlyTax)}%` }}
                title="Property Tax"
              />
              <div 
                className="bg-yellow-500" 
                style={{ width: `${getPercentage(results.monthlyInsurance)}%` }}
                title="Insurance"
              />
              <div 
                className="bg-red-500" 
                style={{ width: `${getPercentage(results.monthlyPMI + results.monthlyMIP + results.monthlyUSDA)}%` }}
                title="PMI/MIP"
              />
              <div 
                className="bg-purple-500" 
                style={{ width: `${getPercentage(results.hoaFee)}%` }}
                title="HOA"
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-gray-400">P&I: {formatCurrency(results.monthlyPI)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-gray-400">Tax: {formatCurrency(results.monthlyTax)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span className="text-gray-400">Insurance: {formatCurrency(results.monthlyInsurance)}</span>
              </div>
              {(results.monthlyPMI > 0 || results.monthlyMIP > 0 || results.monthlyUSDA > 0) && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-gray-400">
                    {loanType === 'fha' ? 'MIP' : loanType === 'usda' ? 'Guarantee' : 'PMI'}: {formatCurrency(results.monthlyPMI + results.monthlyMIP + results.monthlyUSDA)}
                  </span>
                </div>
              )}
              {results.hoaFee > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500"></div>
                  <span className="text-gray-400">HOA: {formatCurrency(results.hoaFee)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Loan Summary */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>📊</span> Loan Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-dark-border">
                <span className="text-gray-400">Home Price</span>
                <span className="text-white">{formatCurrency(results.homePrice)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-border">
                <span className="text-gray-400">Down Payment</span>
                <span className="text-white">{formatCurrency(results.downPayment)} ({results.downPaymentPercent.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-border">
                <span className="text-gray-400">Loan Amount</span>
                <span className="text-white font-semibold">{formatCurrency(results.loanAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-border">
                <span className="text-gray-400">Total of {parseInt(loanTerm) * 12} Payments</span>
                <span className="text-white">{formatCurrency(results.totalPayments)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Total Interest</span>
                <span className="text-red-400">{formatCurrency(results.totalInterest)}</span>
              </div>
            </div>
          </div>

          {/* First Year Amortization */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>📅</span> First Year Amortization
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-left">
                    <th className="pb-2">Mo</th>
                    <th className="pb-2">Principal</th>
                    <th className="pb-2">Interest</th>
                    <th className="pb-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {results.amortization.map((row) => (
                    <tr key={row.month} className="border-t border-dark-border">
                      <td className="py-2 text-gray-400">{row.month}</td>
                      <td className="py-2 text-green-400">{formatCurrencyDecimal(row.principal)}</td>
                      <td className="py-2 text-red-400">{formatCurrencyDecimal(row.interest)}</td>
                      <td className="py-2 text-white">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Affordability Check */}
          <div className={`card border ${results.totalMonthly > 0 ? 'border-primary-500/50 bg-primary-500/10' : 'border-dark-border'}`}>
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <span>💡</span> Affordability Tip
            </h3>
            <p className="text-sm text-gray-400">
              Financial experts recommend keeping your total housing costs below 28% of gross monthly income. 
              For a {formatCurrency(results.totalMonthly)}/mo payment, you'd need approximately {formatCurrency(results.totalMonthly / 0.28 * 12)}/year gross income.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
