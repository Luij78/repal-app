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

  // Temp display values for text inputs
  const [tempHomePrice, setTempHomePrice] = useState('350,000')
  const [tempDownPayment, setTempDownPayment] = useState('17,500')
  const [tempPropertyTax, setTempPropertyTax] = useState('3,500')
  const [tempInsurance, setTempInsurance] = useState('1,750')
  const [tempHoa, setTempHoa] = useState('125')

  // Sync temp values when sliders change
  useEffect(() => {
    setTempHomePrice(homePrice.toLocaleString())
  }, [homePrice])

  useEffect(() => {
    setTempDownPayment(Math.round(homePrice * downPaymentPercent / 100).toLocaleString())
  }, [homePrice, downPaymentPercent])

  useEffect(() => {
    setTempPropertyTax(Math.round(homePrice * propertyTaxPercent / 100).toLocaleString())
  }, [homePrice, propertyTaxPercent])

  useEffect(() => {
    setTempInsurance(Math.round(homePrice * insurancePercent / 100).toLocaleString())
  }, [homePrice, insurancePercent])

  useEffect(() => {
    setTempHoa(hoaFees.toLocaleString())
  }, [hoaFees])

  // Calculated values
  const downPaymentAmount = Math.round(homePrice * downPaymentPercent / 100)
  const propertyTaxAmount = Math.round(homePrice * propertyTaxPercent / 100)
  const insuranceAmount = Math.round(homePrice * insurancePercent / 100)
  const loanAmount = homePrice - downPaymentAmount

  const monthlyRate = interestRate / 100 / 12
  const numPayments = mortgageTerm * 12
  const monthlyPI = monthlyRate > 0 ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1) : loanAmount / numPayments
  const monthlyTax = propertyTaxAmount / 12
  const monthlyInsurance = insuranceAmount / 12
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + hoaFees
  const totalInterest = (monthlyPI * numPayments) - loanAmount

  const formatCurrency = (num: number) => '$' + Math.round(num).toLocaleString()

  // Slider background gradient
  const getSliderBg = (val: number, min: number, max: number) => {
    const percent = ((val - min) / (max - min)) * 100
    return `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${percent}%, #374151 ${percent}%, #374151 100%)`
  }

  // Dark mode input box styles
  const inputBoxStyle = "flex items-center bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg overflow-hidden"
  const textInputStyle = "w-[90px] p-2 bg-transparent border-none text-[#E8E4DC] text-sm text-right outline-none"
  const clearBtnStyle = "px-3 py-2 bg-transparent border-l border-[#2A2A2A] text-gray-500 cursor-pointer hover:text-gray-300"

  return (
    <div className="animate-fade-in max-w-2xl mx-auto pb-8">
      <style jsx global>{`
        .smooth-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 20px;
          background: transparent;
          outline: none;
          cursor: pointer;
        }
        .smooth-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          border-radius: 4px;
        }
        .smooth-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #3B82F6;
          cursor: pointer;
          margin-top: -8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .smooth-slider::-moz-range-track {
          width: 100%;
          height: 4px;
          border-radius: 4px;
        }
        .smooth-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #3B82F6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">🏦 Mortgage Calculator</h1>
          <p className="text-gray-400 text-sm">Calculate your estimated monthly mortgage payment</p>
        </div>
        <Link href="/dashboard" className="text-primary-400 hover:underline text-sm">← Dashboard</Link>
      </div>

      {/* Results Summary Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="text-center">
            <p className="text-sm opacity-80 mb-1">Monthly Payment</p>
            <p className="text-3xl sm:text-4xl font-bold">{formatCurrency(totalMonthly)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-80 mb-1">Loan Amount</p>
            <p className="text-2xl font-semibold">{formatCurrency(loanAmount)}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between"><span className="opacity-80">Principal & Interest</span><span className="font-semibold">{formatCurrency(monthlyPI)}</span></div>
          <div className="flex justify-between"><span className="opacity-80">Property Tax</span><span className="font-semibold">{formatCurrency(monthlyTax)}</span></div>
          <div className="flex justify-between"><span className="opacity-80">Insurance</span><span className="font-semibold">{formatCurrency(monthlyInsurance)}</span></div>
          <div className="flex justify-between"><span className="opacity-80">HOA</span><span className="font-semibold">{formatCurrency(hoaFees)}</span></div>
        </div>
      </div>

      {/* Input Fields */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A]">

        {/* Home Price */}
        <div className="mb-7">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[#E8E4DC] font-medium">Home Price</label>
            <div className={inputBoxStyle}>
              <span className="pl-3 pr-0 py-2 text-gray-500">$</span>
              <input
                type="text"
                value={tempHomePrice}
                onChange={(e) => setTempHomePrice(e.target.value)}
                onBlur={(e) => {
                  const num = parseFloat(e.target.value.replace(/,/g, '')) || 0
                  setHomePrice(num)
                  setTempHomePrice(num.toLocaleString())
                }}
                className={textInputStyle}
              />
              <button onClick={() => { setHomePrice(0); setTempHomePrice('0') }} className={clearBtnStyle}>✕</button>
            </div>
          </div>
          <input
            type="range"
            className="smooth-slider w-full mt-2"
            min={50000}
            max={2000000}
            step={5000}
            value={homePrice}
            onChange={(e) => {
              const val = parseFloat(e.target.value)
              setHomePrice(val)
              setTempHomePrice(val.toLocaleString())
            }}
            style={{ background: getSliderBg(homePrice, 50000, 2000000) }}
          />
        </div>

        {/* Down Payment */}
        <div className="mb-7">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[#E8E4DC] font-medium">Down Payment</label>
            <div className="flex gap-2">
              <div className={inputBoxStyle}>
                <input
                  type="text"
                  value={downPaymentPercent}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0
                    setDownPaymentPercent(Math.min(100, Math.max(0, val)))
                  }}
                  className={`${textInputStyle} w-[50px]`}
                />
                <span className="pr-2 py-2 text-gray-500">%</span>
                <button onClick={() => setDownPaymentPercent(0)} className={clearBtnStyle}>✕</button>
              </div>
              <div className={inputBoxStyle}>
                <span className="pl-2 pr-0 py-2 text-gray-500">$</span>
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
                  className={`${textInputStyle} w-[80px]`}
                />
                <button onClick={() => { setDownPaymentPercent(0); setTempDownPayment('0') }} className={clearBtnStyle}>✕</button>
              </div>
            </div>
          </div>
          <input
            type="range"
            className="smooth-slider w-full mt-2"
            min={0}
            max={50}
            step={0.5}
            value={downPaymentPercent}
            onChange={(e) => {
              const val = parseFloat(e.target.value)
              setDownPaymentPercent(val)
              setTempDownPayment(Math.round(homePrice * val / 100).toLocaleString())
            }}
            style={{ background: getSliderBg(downPaymentPercent, 0, 50) }}
          />
        </div>

        {/* Mortgage Term */}
        <div className="mb-7">
          <div className="flex justify-between items-center">
            <label className="text-[#E8E4DC] font-medium">Mortgage Term</label>
            <select
              value={mortgageTerm}
              onChange={(e) => setMortgageTerm(parseInt(e.target.value))}
              className="py-2 px-4 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-[#E8E4DC] cursor-pointer outline-none"
            >
              <option value={10}>10 years</option>
              <option value={15}>15 years</option>
              <option value={20}>20 years</option>
              <option value={30}>30 years</option>
            </select>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="mb-7">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[#E8E4DC] font-medium">Interest Rate</label>
            <div className={inputBoxStyle}>
              <input
                type="text"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                className={`${textInputStyle} w-[50px]`}
              />
              <span className="pr-2 py-2 text-gray-500">%</span>
              <button onClick={() => setInterestRate(0)} className={clearBtnStyle}>✕</button>
            </div>
          </div>
          <input
            type="range"
            className="smooth-slider w-full mt-2"
            min={1}
            max={15}
            step={0.125}
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value))}
            style={{ background: getSliderBg(interestRate, 1, 15) }}
          />
        </div>

        {/* Property Taxes */}
        <div className="mb-7">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[#E8E4DC] font-medium">Property Taxes</label>
            <div className="flex gap-2">
              <div className={inputBoxStyle}>
                <input
                  type="text"
                  value={propertyTaxPercent}
                  onChange={(e) => setPropertyTaxPercent(parseFloat(e.target.value) || 0)}
                  className={`${textInputStyle} w-[50px]`}
                />
                <span className="pr-2 py-2 text-gray-500">%</span>
                <button onClick={() => setPropertyTaxPercent(0)} className={clearBtnStyle}>✕</button>
              </div>
              <div className={inputBoxStyle}>
                <span className="pl-2 pr-0 py-2 text-gray-500">$</span>
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
                  className={`${textInputStyle} w-[80px]`}
                />
                <button onClick={() => { setPropertyTaxPercent(0); setTempPropertyTax('0') }} className={clearBtnStyle}>✕</button>
              </div>
            </div>
          </div>
          <input
            type="range"
            className="smooth-slider w-full mt-2"
            min={0}
            max={5}
            step={0.1}
            value={propertyTaxPercent}
            onChange={(e) => {
              const val = parseFloat(e.target.value)
              setPropertyTaxPercent(val)
              setTempPropertyTax(Math.round(homePrice * val / 100).toLocaleString())
            }}
            style={{ background: getSliderBg(propertyTaxPercent, 0, 5) }}
          />
        </div>

        {/* Insurance */}
        <div className="mb-7">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[#E8E4DC] font-medium">Homeowners Insurance</label>
            <div className="flex gap-2">
              <div className={inputBoxStyle}>
                <input
                  type="text"
                  value={insurancePercent}
                  onChange={(e) => setInsurancePercent(parseFloat(e.target.value) || 0)}
                  className={`${textInputStyle} w-[50px]`}
                />
                <span className="pr-2 py-2 text-gray-500">%</span>
                <button onClick={() => setInsurancePercent(0)} className={clearBtnStyle}>✕</button>
              </div>
              <div className={inputBoxStyle}>
                <span className="pl-2 pr-0 py-2 text-gray-500">$</span>
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
                  className={`${textInputStyle} w-[80px]`}
                />
                <button onClick={() => { setInsurancePercent(0); setTempInsurance('0') }} className={clearBtnStyle}>✕</button>
              </div>
            </div>
          </div>
          <input
            type="range"
            className="smooth-slider w-full mt-2"
            min={0}
            max={3}
            step={0.1}
            value={insurancePercent}
            onChange={(e) => {
              const val = parseFloat(e.target.value)
              setInsurancePercent(val)
              setTempInsurance(Math.round(homePrice * val / 100).toLocaleString())
            }}
            style={{ background: getSliderBg(insurancePercent, 0, 3) }}
          />
        </div>

        {/* HOA Fees */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[#E8E4DC] font-medium">HOA Fees</label>
            <div className={inputBoxStyle}>
              <span className="pl-2 pr-0 py-2 text-gray-500">$</span>
              <input
                type="text"
                value={tempHoa}
                onChange={(e) => setTempHoa(e.target.value)}
                onBlur={(e) => {
                  const num = parseFloat(e.target.value.replace(/,/g, '')) || 0
                  setHoaFees(num)
                  setTempHoa(num.toLocaleString())
                }}
                className={`${textInputStyle} w-[70px]`}
              />
              <span className="pr-2 py-2 text-gray-500">/mo</span>
              <button onClick={() => { setHoaFees(0); setTempHoa('0') }} className={clearBtnStyle}>✕</button>
            </div>
          </div>
          <input
            type="range"
            className="smooth-slider w-full mt-2"
            min={0}
            max={1000}
            step={25}
            value={hoaFees}
            onChange={(e) => {
              const val = parseFloat(e.target.value)
              setHoaFees(val)
              setTempHoa(val.toLocaleString())
            }}
            style={{ background: getSliderBg(hoaFees, 0, 1000) }}
          />
        </div>
      </div>

      {/* Loan Summary */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6 mt-6 border border-[#2A2A2A]">
        <h3 className="text-primary-400 font-semibold mb-4">Loan Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between p-3 bg-[#0D0D0D] rounded-lg">
            <span className="text-gray-400">Total Interest Paid</span>
            <span className="text-[#E8E4DC] font-semibold">{formatCurrency(totalInterest)}</span>
          </div>
          <div className="flex justify-between p-3 bg-[#0D0D0D] rounded-lg">
            <span className="text-gray-400">Total of All Payments</span>
            <span className="text-[#E8E4DC] font-semibold">{formatCurrency(monthlyPI * numPayments)}</span>
          </div>
        </div>
      </div>

      {/* PMI Warning */}
      {downPaymentPercent < 20 && (
        <div className="mt-6 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-yellow-400 font-semibold mb-1">PMI May Be Required</p>
              <p className="text-gray-400 text-sm">With less than 20% down, private mortgage insurance (PMI) is typically required. Estimated PMI: ~{formatCurrency(loanAmount * 0.0075 / 12)}/mo (0.5-1% annually)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
