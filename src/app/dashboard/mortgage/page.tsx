'use client'

import { useState } from 'react'

export default function MortgageCalculatorPage() {
  const [homePrice, setHomePrice] = useState(350000)
  const [downPaymentPercent, setDownPaymentPercent] = useState(5)
  const [mortgageTerm, setMortgageTerm] = useState(30)
  const [interestRate, setInterestRate] = useState(7)
  const [propertyTaxPercent, setPropertyTaxPercent] = useState(1)
  const [insurancePercent, setInsurancePercent] = useState(0.5)
  const [hoaFees, setHoaFees] = useState(125)
  
  const [tempHomePrice, setTempHomePrice] = useState('350,000')
  const [tempDownPayment, setTempDownPayment] = useState('17,500')
  const [tempPropertyTax, setTempPropertyTax] = useState('3,500')
  const [tempInsurance, setTempInsurance] = useState('1,750')
  const [tempHoa, setTempHoa] = useState('125')

  const downPaymentAmount = Math.round(homePrice * downPaymentPercent / 100)
  const propertyTaxAmount = Math.round(homePrice * propertyTaxPercent / 100)
  const insuranceAmount = Math.round(homePrice * insurancePercent / 100)
  const loanAmount = homePrice - downPaymentAmount

  const monthlyRate = interestRate / 100 / 12
  const numPayments = mortgageTerm * 12
  const monthlyPI = monthlyRate > 0 
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : loanAmount / numPayments
  const monthlyTax = propertyTaxAmount / 12
  const monthlyInsurance = insuranceAmount / 12
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + hoaFees
  const totalInterest = (monthlyPI * numPayments) - loanAmount
  const totalOfAllPayments = monthlyPI * numPayments + (monthlyTax + monthlyInsurance + hoaFees) * numPayments

  const formatCurrency = (num: number) => '$' + Math.round(num).toLocaleString()

  const getSliderBg = (value: number, min: number, max: number) => {
    const percent = ((value - min) / (max - min)) * 100
    return `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${percent}%, #374151 ${percent}%, #374151 100%)`
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">🏦 Mortgage Calculator</h1>
        <p className="text-gray-400">Calculate your estimated monthly mortgage payment</p>
      </div>

      {/* Results Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-blue-200 text-sm mb-1">Monthly Payment</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(totalMonthly)}</p>
          </div>
          <div className="text-center">
            <p className="text-blue-200 text-sm mb-1">Loan Amount</p>
            <p className="text-2xl font-semibold text-white">{formatCurrency(loanAmount)}</p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-200">Principal & Interest</span>
            <span className="text-white font-semibold">{formatCurrency(monthlyPI)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">Property Tax</span>
            <span className="text-white font-semibold">{formatCurrency(monthlyTax)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">Insurance</span>
            <span className="text-white font-semibold">{formatCurrency(monthlyInsurance)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">HOA</span>
            <span className="text-white font-semibold">{formatCurrency(hoaFees)}</span>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="card space-y-6">
        {/* Home Price */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-white font-medium">Home Price</label>
            <div className="flex items-center bg-dark-bg border border-dark-border rounded-lg overflow-hidden">
              <span className="px-3 text-gray-400">$</span>
              <input
                type="text"
                value={tempHomePrice}
                onChange={(e) => setTempHomePrice(e.target.value)}
                onBlur={(e) => {
                  const num = parseFloat(e.target.value.replace(/,/g, '')) || 0
                  setHomePrice(num)
                  setTempHomePrice(num.toLocaleString())
                }}
                className="w-24 py-2 bg-transparent text-white text-right outline-none"
              />
            </div>
          </div>
          <input
            type="range"
            min={50000}
            max={2000000}
            step={5000}
            value={homePrice}
            onInput={(e) => {
              const val = parseFloat(e.currentTarget.value)
              setHomePrice(val)
              setTempHomePrice(val.toLocaleString())
            }}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: getSliderBg(homePrice, 50000, 2000000) }}
          />
        </div>

        {/* Down Payment */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-white font-medium">Down Payment</label>
            <div className="flex gap-2">
              <div className="flex items-center bg-dark-bg border border-dark-border rounded-lg overflow-hidden">
                <input
                  type="text"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-12 py-2 px-2 bg-transparent text-white text-right outline-none"
                />
                <span className="pr-2 text-gray-400">%</span>
              </div>
              <div className="flex items-center bg-dark-bg border border-dark-border rounded-lg overflow-hidden">
                <span className="pl-2 text-gray-400">$</span>
                <input
                  type="text"
                  value={tempDownPayment}
                  onChange={(e) => setTempDownPayment(e.target.value)}
                  onBlur={(e) => {
                    const num = parseFloat(e.target.value.replace(/,/g, '')) || 0
                    const percent = homePrice > 0 ? (num / homePrice) * 100 : 0
                    setDownPaymentPercent(Math.round(percent * 10) / 10)
                    setTempDownPayment(Math.round(homePrice * percent / 100).toLocaleString())
                  }}
                  className="w-20 py-2 bg-transparent text-white text-right outline-none"
                />
              </div>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={0.5}
            value={downPaymentPercent}
            onInput={(e) => {
              const val = parseFloat(e.currentTarget.value)
              setDownPaymentPercent(val)
              setTempDownPayment(Math.round(homePrice * val / 100).toLocaleString())
            }}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: getSliderBg(downPaymentPercent, 0, 50) }}
          />
        </div>

        {/* Mortgage Term */}
        <div>
          <div className="flex justify-between items-center">
            <label className="text-white font-medium">Mortgage Term</label>
            <select
              value={mortgageTerm}
              onChange={(e) => setMortgageTerm(parseInt(e.target.value))}
              className="input-field py-2 px-4"
            >
              <option value={10}>10 years</option>
              <option value={15}>15 years</option>
              <option value={20}>20 years</option>
              <option value={30}>30 years</option>
            </select>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-white font-medium">Interest Rate</label>
            <div className="flex items-center bg-dark-bg border border-dark-border rounded-lg overflow-hidden">
              <input
                type="text"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                className="w-12 py-2 px-2 bg-transparent text-white text-right outline-none"
              />
              <span className="pr-2 text-gray-400">%</span>
            </div>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            step={0.125}
            value={interestRate}
            onInput={(e) => setInterestRate(parseFloat(e.currentTarget.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: getSliderBg(interestRate, 1, 15) }}
          />
        </div>

        {/* Property Taxes */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-white font-medium">Property Taxes <span className="text-gray-500 text-xs">*</span></label>
            <div className="flex gap-2">
              <div className="flex items-center bg-dark-bg border border-dark-border rounded-lg overflow-hidden">
                <input
                  type="text"
                  value={propertyTaxPercent}
                  onChange={(e) => setPropertyTaxPercent(parseFloat(e.target.value) || 0)}
                  className="w-12 py-2 px-2 bg-transparent text-white text-right outline-none"
                />
                <span className="pr-2 text-gray-400">%</span>
              </div>
              <div className="flex items-center bg-dark-bg border border-dark-border rounded-lg overflow-hidden">
                <span className="pl-2 text-gray-400">$</span>
                <input
                  type="text"
                  value={tempPropertyTax}
                  onChange={(e) => setTempPropertyTax(e.target.value)}
                  onBlur={(e) => {
                    const num = parseFloat(e.target.value.replace(/,/g, '')) || 0
                    const percent = homePrice > 0 ? (num / homePrice) * 100 : 0
                    setPropertyTaxPercent(Math.round(percent * 10) / 10)
                    setTempPropertyTax(num.toLocaleString())
                  }}
                  className="w-20 py-2 bg-transparent text-white text-right outline-none"
                />
              </div>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={0.1}
            value={propertyTaxPercent}
            onInput={(e) => {
              const val = parseFloat(e.currentTarget.value)
              setPropertyTaxPercent(val)
              setTempPropertyTax(Math.round(homePrice * val / 100).toLocaleString())
            }}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: getSliderBg(propertyTaxPercent, 0, 5) }}
          />
        </div>

        {/* Insurance */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-white font-medium">Insurance <span className="text-gray-500 text-xs">*</span></label>
            <div className="flex gap-2">
              <div className="flex items-center bg-dark-bg border border-dark-border rounded-lg overflow-hidden">
                <input
                  type="text"
                  value={insurancePercent}
                  onChange={(e) => setInsurancePercent(parseFloat(e.target.value) || 0)}
                  className="w-12 py-2 px-2 bg-transparent text-white text-right outline-none"
                />
                <span className="pr-2 text-gray-400">%</span>
              </div>
              <div className="flex items-center bg-dark-bg border border-dark-border rounded-lg overflow-hidden">
                <span className="pl-2 text-gray-400">$</span>
                <input
                  type="text"
                  value={tempInsurance}
                  onChange={(e) => setTempInsurance(e.target.value)}
                  onBlur={(e) => {
                    const num = parseFloat(e.target.value.replace(/,/g, '')) || 0
                    const percent = homePrice > 0 ? (num / homePrice) * 100 : 0
                    setInsurancePercent(Math.round(percent * 10) / 10)
                    setTempInsurance(num.toLocaleString())
                  }}
                  className="w-20 py-2 bg-transparent text-white text-right outline-none"
                />
              </div>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={3}
            step={0.1}
            value={insurancePercent}
            onInput={(e) => {
              const val = parseFloat(e.currentTarget.value)
              setInsurancePercent(val)
              setTempInsurance(Math.round(homePrice * val / 100).toLocaleString())
            }}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: getSliderBg(insurancePercent, 0, 3) }}
          />
        </div>

        {/* HOA */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-white font-medium">HOA Fees</label>
            <div className="flex items-center bg-dark-bg border border-dark-border rounded-lg overflow-hidden">
              <span className="pl-3 text-gray-400">$</span>
              <input
                type="text"
                value={tempHoa}
                onChange={(e) => setTempHoa(e.target.value)}
                onBlur={(e) => {
                  const num = parseFloat(e.target.value.replace(/,/g, '')) || 0
                  setHoaFees(num)
                  setTempHoa(num.toLocaleString())
                }}
                className="w-20 py-2 bg-transparent text-white text-right outline-none"
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={1000}
            step={25}
            value={hoaFees}
            onInput={(e) => {
              const val = parseFloat(e.currentTarget.value)
              setHoaFees(val)
              setTempHoa(val.toLocaleString())
            }}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: getSliderBg(hoaFees, 0, 1000) }}
          />
        </div>

        <p className="text-gray-500 text-xs">* Estimates based on home price percentage</p>
      </div>

      {/* Loan Summary */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-primary-500 mb-4">Loan Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between p-3 bg-dark-border/50 rounded-lg">
            <span className="text-gray-400">Total Interest Paid</span>
            <span className="text-white font-semibold">{formatCurrency(totalInterest)}</span>
          </div>
          <div className="flex justify-between p-3 bg-dark-border/50 rounded-lg">
            <span className="text-gray-400">Total of All Payments</span>
            <span className="text-white font-semibold">{formatCurrency(totalOfAllPayments)}</span>
          </div>
        </div>
      </div>

      {/* PMI Warning */}
      {downPaymentPercent < 20 && (
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-yellow-400 font-semibold">PMI May Be Required</p>
              <p className="text-gray-400 text-sm mt-1">
                With less than 20% down, you may need Private Mortgage Insurance (PMI), 
                typically 0.5-1% of the loan amount annually. This would add approximately{' '}
                <span className="text-yellow-400 font-semibold">{formatCurrency(loanAmount * 0.0075 / 12)}</span> to your monthly payment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
