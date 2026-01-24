'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function MortgageCalculatorPage() {
  const [homePrice, setHomePrice] = useState(350000)
  const [downPaymentPercent, setDownPaymentPercent] = useState(5)
  const [mortgageTerm, setMortgageTerm] = useState(30)
  const [interestRate, setInterestRate] = useState(7)
  const [propertyTaxPercent, setPropertyTaxPercent] = useState(1)
  const [insurancePercent, setInsurancePercent] = useState(0.5)
  const [hoaFees, setHoaFees] = useState(125)
  const [loanType, setLoanType] = useState('conventional')
  const [pmiRate, setPmiRate] = useState(0.5)

  // Temp display values
  const [tempHomePrice, setTempHomePrice] = useState('350,000')
  const [tempDownPayment, setTempDownPayment] = useState('17,500')
  const [tempPropertyTax, setTempPropertyTax] = useState('3,500')
  const [tempInsurance, setTempInsurance] = useState('1,750')
  const [tempHoa, setTempHoa] = useState('125')

  // Sync temp values
  useEffect(() => { setTempHomePrice(homePrice.toLocaleString()) }, [homePrice])
  useEffect(() => { setTempDownPayment(Math.round(homePrice * downPaymentPercent / 100).toLocaleString()) }, [homePrice, downPaymentPercent])
  useEffect(() => { setTempPropertyTax(Math.round(homePrice * propertyTaxPercent / 100).toLocaleString()) }, [homePrice, propertyTaxPercent])
  useEffect(() => { setTempInsurance(Math.round(homePrice * insurancePercent / 100).toLocaleString()) }, [homePrice, insurancePercent])
  useEffect(() => { setTempHoa(hoaFees.toLocaleString()) }, [hoaFees])

  // Calculations
  const downPaymentAmount = Math.round(homePrice * downPaymentPercent / 100)
  const propertyTaxAmount = Math.round(homePrice * propertyTaxPercent / 100)
  const insuranceAmount = Math.round(homePrice * insurancePercent / 100)
  const loanAmount = homePrice - downPaymentAmount
  const monthlyRate = interestRate / 100 / 12
  const numPayments = mortgageTerm * 12
  const monthlyPI = monthlyRate > 0 ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1) : loanAmount / numPayments
  const monthlyTax = propertyTaxAmount / 12
  const monthlyInsurance = insuranceAmount / 12

  // PMI/MIP calculations based on loan type
  let monthlyPMI = 0
  let monthlyMIP = 0
  let monthlyUSDA = 0
  if (loanType === 'conventional' && downPaymentPercent < 20) {
    monthlyPMI = (loanAmount * (pmiRate / 100)) / 12
  } else if (loanType === 'fha') {
    monthlyMIP = (loanAmount * 0.0085) / 12
  } else if (loanType === 'usda') {
    monthlyUSDA = (loanAmount * 0.0035) / 12
  }

  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI + monthlyMIP + monthlyUSDA + hoaFees
  const totalInterest = (monthlyPI * numPayments) - loanAmount
  const totalPayments = monthlyPI * numPayments

  // Amortization (first 12 months)
  const amortization = []
  let balance = loanAmount
  for (let i = 1; i <= 12; i++) {
    const interestPayment = balance * monthlyRate
    const principalPayment = monthlyPI - interestPayment
    balance -= principalPayment
    amortization.push({ month: i, principal: principalPayment, interest: interestPayment, balance })
  }

  const formatCurrency = (num: number) => '$' + Math.round(num).toLocaleString()
  const formatCurrencyDecimal = (num: number) => '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const getPercentage = (value: number) => totalMonthly === 0 ? 0 : (value / totalMonthly) * 100

  // Sleek slider gradient
  const getSliderBg = (val: number, min: number, max: number) => {
    const percent = ((val - min) / (max - min)) * 100
    return `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${percent}%, #1F1F1F ${percent}%, #1F1F1F 100%)`
  }

  const inputBoxStyle = "flex items-center bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg overflow-hidden"
  const textInputStyle = "p-2 bg-transparent border-none text-[#E8E4DC] text-sm text-right outline-none"
  const clearBtnStyle = "px-2 py-2 bg-transparent border-l border-[#2A2A2A] text-gray-500 cursor-pointer hover:text-gray-300 text-xs"

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-8">
      <style jsx global>{`
        .sleek-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 16px;
          background: transparent;
          outline: none;
          cursor: pointer;
        }
        .sleek-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 2px;
          border-radius: 2px;
        }
        .sleek-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
          border: 2px solid #3B82F6;
          cursor: pointer;
          margin-top: -6px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .sleek-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 2px 8px rgba(59,130,246,0.4);
        }
        .sleek-slider::-moz-range-track {
          width: 100%;
          height: 2px;
          border-radius: 2px;
        }
        .sleek-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
          border: 2px solid #3B82F6;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
      `}</style>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">🏦 Mortgage Calculator</h1>
          <p className="text-gray-400 text-sm">Calculate your estimated monthly mortgage payment</p>
        </div>
        <Link href="/dashboard" className="text-primary-400 hover:underline text-sm">← Dashboard</Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN - Inputs */}
        <div className="space-y-4">
          {/* Results Card - Top */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs opacity-80 mb-1">Monthly Payment</p>
                <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totalMonthly)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-80 mb-1">Loan Amount</p>
                <p className="text-xl font-semibold">{formatCurrency(loanAmount)}</p>
              </div>
            </div>
            
            {/* Payment Breakdown Bar */}
            <div className="h-3 rounded-full overflow-hidden flex mb-3">
              <div className="bg-blue-400" style={{ width: `${getPercentage(monthlyPI)}%` }} title="P&I" />
              <div className="bg-green-400" style={{ width: `${getPercentage(monthlyTax)}%` }} title="Tax" />
              <div className="bg-yellow-400" style={{ width: `${getPercentage(monthlyInsurance)}%` }} title="Insurance" />
              <div className="bg-red-400" style={{ width: `${getPercentage(monthlyPMI + monthlyMIP + monthlyUSDA)}%` }} title="PMI" />
              <div className="bg-purple-400" style={{ width: `${getPercentage(hoaFees)}%` }} title="HOA" />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-blue-400" /><span className="opacity-80">P&I: {formatCurrency(monthlyPI)}</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-green-400" /><span className="opacity-80">Tax: {formatCurrency(monthlyTax)}</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-yellow-400" /><span className="opacity-80">Insurance: {formatCurrency(monthlyInsurance)}</span></div>
              {(monthlyPMI > 0 || monthlyMIP > 0 || monthlyUSDA > 0) && (
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-red-400" /><span className="opacity-80">{loanType === 'fha' ? 'MIP' : loanType === 'usda' ? 'Fee' : 'PMI'}: {formatCurrency(monthlyPMI + monthlyMIP + monthlyUSDA)}</span></div>
              )}
              {hoaFees > 0 && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-purple-400" /><span className="opacity-80">HOA: {formatCurrency(hoaFees)}</span></div>}
            </div>
          </div>

          {/* Input Fields */}
          <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#2A2A2A] space-y-5">
            
            {/* Home Price */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[#E8E4DC] text-sm font-medium">Home Price</label>
                <div className={inputBoxStyle}>
                  <span className="pl-2 text-gray-500 text-sm">$</span>
                  <input type="text" value={tempHomePrice} onChange={(e) => setTempHomePrice(e.target.value)} onBlur={(e) => { const num = parseFloat(e.target.value.replace(/,/g, '')) || 0; setHomePrice(num); setTempHomePrice(num.toLocaleString()) }} className={`${textInputStyle} w-[80px]`} />
                  <button onClick={() => { setHomePrice(0); setTempHomePrice('0') }} className={clearBtnStyle}>✕</button>
                </div>
              </div>
              <input type="range" className="sleek-slider w-full" min={50000} max={2000000} step={5000} value={homePrice} onChange={(e) => { const val = parseFloat(e.target.value); setHomePrice(val); setTempHomePrice(val.toLocaleString()) }} style={{ background: getSliderBg(homePrice, 50000, 2000000) }} />
            </div>

            {/* Down Payment */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[#E8E4DC] text-sm font-medium">Down Payment</label>
                <div className="flex gap-2">
                  <div className={inputBoxStyle}>
                    <input type="text" value={downPaymentPercent} onChange={(e) => setDownPaymentPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} className={`${textInputStyle} w-[40px]`} />
                    <span className="pr-1 text-gray-500 text-sm">%</span>
                    <button onClick={() => setDownPaymentPercent(0)} className={clearBtnStyle}>✕</button>
                  </div>
                  <div className={inputBoxStyle}>
                    <span className="pl-2 text-gray-500 text-sm">$</span>
                    <input type="text" value={tempDownPayment} onChange={(e) => setTempDownPayment(e.target.value)} onBlur={(e) => { const num = parseFloat(e.target.value.replace(/,/g, '')) || 0; const pct = homePrice > 0 ? (num / homePrice) * 100 : 0; setDownPaymentPercent(Math.round(pct * 10) / 10); setTempDownPayment(Math.round(homePrice * pct / 100).toLocaleString()) }} className={`${textInputStyle} w-[70px]`} />
                    <button onClick={() => { setDownPaymentPercent(0); setTempDownPayment('0') }} className={clearBtnStyle}>✕</button>
                  </div>
                </div>
              </div>
              <input type="range" className="sleek-slider w-full" min={0} max={50} step={0.5} value={downPaymentPercent} onChange={(e) => { const val = parseFloat(e.target.value); setDownPaymentPercent(val); setTempDownPayment(Math.round(homePrice * val / 100).toLocaleString()) }} style={{ background: getSliderBg(downPaymentPercent, 0, 50) }} />
            </div>

            {/* Loan Type */}
            <div className="flex justify-between items-center">
              <label className="text-[#E8E4DC] text-sm font-medium">Loan Type</label>
              <select value={loanType} onChange={(e) => setLoanType(e.target.value)} className="py-2 px-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-[#E8E4DC] text-sm cursor-pointer outline-none">
                <option value="conventional">Conventional</option>
                <option value="fha">FHA</option>
                <option value="va">VA</option>
                <option value="usda">USDA</option>
              </select>
            </div>

            {/* Mortgage Term */}
            <div className="flex justify-between items-center">
              <label className="text-[#E8E4DC] text-sm font-medium">Mortgage Term</label>
              <select value={mortgageTerm} onChange={(e) => setMortgageTerm(parseInt(e.target.value))} className="py-2 px-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-[#E8E4DC] text-sm cursor-pointer outline-none">
                <option value={10}>10 years</option>
                <option value={15}>15 years</option>
                <option value={20}>20 years</option>
                <option value={30}>30 years</option>
              </select>
            </div>

            {/* Interest Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[#E8E4DC] text-sm font-medium">Interest Rate</label>
                <div className={inputBoxStyle}>
                  <input type="text" value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)} className={`${textInputStyle} w-[45px]`} />
                  <span className="pr-1 text-gray-500 text-sm">%</span>
                  <button onClick={() => setInterestRate(0)} className={clearBtnStyle}>✕</button>
                </div>
              </div>
              <input type="range" className="sleek-slider w-full" min={1} max={15} step={0.125} value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value))} style={{ background: getSliderBg(interestRate, 1, 15) }} />
            </div>

            {/* Property Tax */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[#E8E4DC] text-sm font-medium">Property Taxes</label>
                <div className="flex gap-2">
                  <div className={inputBoxStyle}>
                    <input type="text" value={propertyTaxPercent} onChange={(e) => setPropertyTaxPercent(parseFloat(e.target.value) || 0)} className={`${textInputStyle} w-[40px]`} />
                    <span className="pr-1 text-gray-500 text-sm">%</span>
                    <button onClick={() => setPropertyTaxPercent(0)} className={clearBtnStyle}>✕</button>
                  </div>
                  <div className={inputBoxStyle}>
                    <span className="pl-2 text-gray-500 text-sm">$</span>
                    <input type="text" value={tempPropertyTax} onChange={(e) => setTempPropertyTax(e.target.value)} onBlur={(e) => { const num = parseFloat(e.target.value.replace(/,/g, '')) || 0; const pct = homePrice > 0 ? (num / homePrice) * 100 : 0; setPropertyTaxPercent(Math.round(pct * 10) / 10); setTempPropertyTax(num.toLocaleString()) }} className={`${textInputStyle} w-[70px]`} />
                    <button onClick={() => { setPropertyTaxPercent(0); setTempPropertyTax('0') }} className={clearBtnStyle}>✕</button>
                  </div>
                </div>
              </div>
              <input type="range" className="sleek-slider w-full" min={0} max={5} step={0.1} value={propertyTaxPercent} onChange={(e) => { const val = parseFloat(e.target.value); setPropertyTaxPercent(val); setTempPropertyTax(Math.round(homePrice * val / 100).toLocaleString()) }} style={{ background: getSliderBg(propertyTaxPercent, 0, 5) }} />
            </div>

            {/* Insurance */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[#E8E4DC] text-sm font-medium">Insurance</label>
                <div className="flex gap-2">
                  <div className={inputBoxStyle}>
                    <input type="text" value={insurancePercent} onChange={(e) => setInsurancePercent(parseFloat(e.target.value) || 0)} className={`${textInputStyle} w-[40px]`} />
                    <span className="pr-1 text-gray-500 text-sm">%</span>
                    <button onClick={() => setInsurancePercent(0)} className={clearBtnStyle}>✕</button>
                  </div>
                  <div className={inputBoxStyle}>
                    <span className="pl-2 text-gray-500 text-sm">$</span>
                    <input type="text" value={tempInsurance} onChange={(e) => setTempInsurance(e.target.value)} onBlur={(e) => { const num = parseFloat(e.target.value.replace(/,/g, '')) || 0; const pct = homePrice > 0 ? (num / homePrice) * 100 : 0; setInsurancePercent(Math.round(pct * 10) / 10); setTempInsurance(num.toLocaleString()) }} className={`${textInputStyle} w-[70px]`} />
                    <button onClick={() => { setInsurancePercent(0); setTempInsurance('0') }} className={clearBtnStyle}>✕</button>
                  </div>
                </div>
              </div>
              <input type="range" className="sleek-slider w-full" min={0} max={3} step={0.1} value={insurancePercent} onChange={(e) => { const val = parseFloat(e.target.value); setInsurancePercent(val); setTempInsurance(Math.round(homePrice * val / 100).toLocaleString()) }} style={{ background: getSliderBg(insurancePercent, 0, 3) }} />
            </div>

            {/* HOA */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[#E8E4DC] text-sm font-medium">HOA Fees</label>
                <div className={inputBoxStyle}>
                  <span className="pl-2 text-gray-500 text-sm">$</span>
                  <input type="text" value={tempHoa} onChange={(e) => setTempHoa(e.target.value)} onBlur={(e) => { const num = parseFloat(e.target.value.replace(/,/g, '')) || 0; setHoaFees(num); setTempHoa(num.toLocaleString()) }} className={`${textInputStyle} w-[60px]`} />
                  <span className="pr-1 text-gray-500 text-xs">/mo</span>
                  <button onClick={() => { setHoaFees(0); setTempHoa('0') }} className={clearBtnStyle}>✕</button>
                </div>
              </div>
              <input type="range" className="sleek-slider w-full" min={0} max={1000} step={25} value={hoaFees} onChange={(e) => { const val = parseFloat(e.target.value); setHoaFees(val); setTempHoa(val.toLocaleString()) }} style={{ background: getSliderBg(hoaFees, 0, 1000) }} />
            </div>

            <p className="text-gray-500 text-xs mt-2">* Estimates based on home price percentage. Adjust for your property.</p>
          </div>
        </div>

        {/* RIGHT COLUMN - Results */}
        <div className="space-y-4">
          {/* Loan Type Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2 text-sm">
              <span>ℹ️</span> {loanType.toUpperCase()} Loan Info
            </h3>
            <p className="text-sm text-gray-400">
              {loanType === 'conventional' && 'Conventional loans require minimum 3-5% down. PMI required if down payment is less than 20%.'}
              {loanType === 'fha' && 'FHA loans require minimum 3.5% down with 580+ credit score. MIP (mortgage insurance) is required for the life of the loan.'}
              {loanType === 'va' && 'VA loans are available to eligible veterans with 0% down. No PMI required. Funding fee may apply.'}
              {loanType === 'usda' && 'USDA loans are for rural areas with 0% down for eligible buyers. Annual guarantee fee of 0.35% applies.'}
            </p>
          </div>

          {/* Loan Summary */}
          <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#2A2A2A]">
            <h3 className="text-primary-400 font-semibold mb-4 text-sm">📊 Loan Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-[#2A2A2A]"><span className="text-gray-400">Home Price</span><span className="text-white">{formatCurrency(homePrice)}</span></div>
              <div className="flex justify-between py-2 border-b border-[#2A2A2A]"><span className="text-gray-400">Down Payment</span><span className="text-white">{formatCurrency(downPaymentAmount)} ({downPaymentPercent}%)</span></div>
              <div className="flex justify-between py-2 border-b border-[#2A2A2A]"><span className="text-gray-400">Loan Amount</span><span className="text-white font-semibold">{formatCurrency(loanAmount)}</span></div>
              <div className="flex justify-between py-2 border-b border-[#2A2A2A]"><span className="text-gray-400">Total of {numPayments} Payments</span><span className="text-white">{formatCurrency(totalPayments)}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-400">Total Interest</span><span className="text-red-400">{formatCurrency(totalInterest)}</span></div>
            </div>
          </div>

          {/* First Year Amortization */}
          <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#2A2A2A]">
            <h3 className="text-primary-400 font-semibold mb-4 text-sm">📅 First Year Amortization</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 text-left">
                    <th className="pb-2">Mo</th>
                    <th className="pb-2">Principal</th>
                    <th className="pb-2">Interest</th>
                    <th className="pb-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {amortization.map((row) => (
                    <tr key={row.month} className="border-t border-[#2A2A2A]">
                      <td className="py-1.5 text-gray-400">{row.month}</td>
                      <td className="py-1.5 text-green-400">{formatCurrencyDecimal(row.principal)}</td>
                      <td className="py-1.5 text-red-400">{formatCurrencyDecimal(row.interest)}</td>
                      <td className="py-1.5 text-white">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PMI Warning */}
          {downPaymentPercent < 20 && loanType === 'conventional' && (
            <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
              <div className="flex gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-yellow-400 font-semibold mb-1 text-sm">PMI Required</p>
                  <p className="text-gray-400 text-xs">With less than 20% down, PMI adds ~{formatCurrency(monthlyPMI)}/mo. PMI can be removed once you have 20% equity.</p>
                </div>
              </div>
            </div>
          )}

          {/* Affordability Tip */}
          <div className="bg-primary-500/10 border border-primary-500/30 rounded-2xl p-4">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2 text-sm">
              <span>💡</span> Affordability Tip
            </h3>
            <p className="text-sm text-gray-400">
              Keep housing costs below 28% of gross monthly income. For a {formatCurrency(totalMonthly)}/mo payment, you'd need ~{formatCurrency(totalMonthly / 0.28 * 12)}/year gross income.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
