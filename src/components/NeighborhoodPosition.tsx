'use client'

import { useState, useEffect } from 'react'

interface PropertyData {
  address: string
  estimatedValue: number
  listingPrice: number | null
  priceRangeLow: number
  priceRangeHigh: number
  bedrooms?: number
  bathrooms?: number
  squareFootage?: number
  yearBuilt?: number
  propertyType?: string
}

interface CompData {
  address: string
  price: number
  date: string
  bedrooms?: number
  bathrooms?: number
  squareFootage?: number
  distance?: number
  correlation?: number
}

interface ListingGap {
  listingPrice: number
  estimatedValue: number
  difference: number
  percentBelow: number
  percentAbove: number
  signal: 'underpriced' | 'overpriced'
  listingStatus: string | null
  listedDate: string | null
  daysOnMarket: number | null
}

interface NeighborhoodData {
  property: PropertyData
  comps: CompData[]
  median: number
  position: 'progression' | 'regression'
  percentage: number
  listingGap: ListingGap | null
}

interface NeighborhoodPositionProps {
  address: string
}

const formatCurrency = (amount: number) => {
  return '$' + amount.toLocaleString()
}

const formatDate = (dateStr: string) => {
  if (dateStr === 'Unknown') return dateStr
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function NeighborhoodPosition({ address }: NeighborhoodPositionProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<NeighborhoodData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!address.trim()) return

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await fetch(`/api/neighborhood?address=${encodeURIComponent(address)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch neighborhood data')
      }

      const result: NeighborhoodData = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (address) fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  if (loading) {
    return (
      <div className="bg-[#1a1b23] border border-white/10 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-white/5 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-white/5 rounded mb-4"></div>
        <div className="h-40 bg-white/5 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#1a1b23] border border-red-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-red-400 font-semibold mb-1">Error</h3>
            <p className="text-gray-300 text-sm">{error}</p>
            <button
              onClick={fetchData}
              className="mt-3 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { property, comps, median, position, percentage, listingGap } = data

  // Use listing price if available, otherwise estimated value
  const displayPrice = property.listingPrice || property.estimatedValue
  
  // Calculate position on the bar
  const allPrices = [...comps.map(c => c.price), displayPrice, median]
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const range = maxPrice - minPrice
  const propertyPosition = range > 0 ? ((displayPrice - minPrice) / range) * 100 : 50
  const medianPosition = range > 0 ? ((median - minPrice) / range) * 100 : 50
  const estimatePosition = range > 0 ? ((property.estimatedValue - minPrice) / range) * 100 : 50

  const isProgression = position === 'progression'

  return (
    <div className="bg-[#1a1b23] border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-1">
              {property.address}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {property.propertyType && <span>{property.propertyType}</span>}
              {property.bedrooms && <span>• {property.bedrooms} bed</span>}
              {property.bathrooms && <span>• {property.bathrooms} bath</span>}
              {property.squareFootage && <span>• {property.squareFootage.toLocaleString()} sqft</span>}
              {property.yearBuilt && <span>• Built {property.yearBuilt}</span>}
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 ${
            isProgression 
              ? 'bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30' 
              : 'bg-[#fb7185]/20 text-[#fb7185] border border-[#fb7185]/30'
          }`}>
            <span>{isProgression ? '↑' : '↓'}</span>
            <span>{isProgression ? 'Progression' : 'Regression'}</span>
          </div>
        </div>
      </div>

      {/* 🔥 LISTING GAP ALERT — The Golden Opportunity Signal */}
      {listingGap && listingGap.signal === 'underpriced' && listingGap.percentBelow >= 5 && (
        <div className="mx-6 mt-6 p-4 rounded-xl bg-gradient-to-r from-[#fbbf24]/20 to-[#f59e0b]/10 border border-[#fbbf24]/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔥</span>
            <h4 className="text-[#fbbf24] font-bold text-base">GOLDEN OPPORTUNITY</h4>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Listed At</p>
              <p className="text-white text-xl font-bold">{formatCurrency(listingGap.listingPrice)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Market Value</p>
              <p className="text-[#34d399] text-xl font-bold">{formatCurrency(listingGap.estimatedValue)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Below Market</p>
              <p className="text-[#fbbf24] text-xl font-bold">{listingGap.percentBelow}%</p>
            </div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <p className="text-[#fbbf24] text-sm font-semibold">
              💰 {formatCurrency(listingGap.difference)} below estimated market value
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {listingGap.listingStatus === 'Active' ? '🟢 Active listing' : '🔴 Listing removed'}
              {listingGap.daysOnMarket ? ` • ${listingGap.daysOnMarket} days on market` : ''}
              {listingGap.listedDate ? ` • Listed ${formatDate(listingGap.listedDate)}` : ''}
            </p>
          </div>
        </div>
      )}

      {/* Overpriced listing warning */}
      {listingGap && listingGap.signal === 'overpriced' && listingGap.percentAbove >= 5 && (
        <div className="mx-6 mt-6 p-4 rounded-xl bg-[#fb7185]/10 border border-[#fb7185]/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚠️</span>
            <h4 className="text-[#fb7185] font-bold text-base">OVERPRICED LISTING</h4>
          </div>
          <p className="text-gray-300 text-sm">
            Listed at <span className="text-white font-semibold">{formatCurrency(listingGap.listingPrice)}</span> — 
            that&apos;s <span className="text-[#fb7185] font-semibold">{listingGap.percentAbove}%</span> above the estimated market value of {formatCurrency(listingGap.estimatedValue)}.
          </p>
        </div>
      )}

      {/* Value Comparison */}
      <div className="p-6 border-b border-white/10">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              {property.listingPrice ? 'Listing Price' : 'Estimated Value'}
            </p>
            <p className="text-white text-2xl font-bold">{formatCurrency(displayPrice)}</p>
            {property.listingPrice && (
              <p className="text-gray-500 text-xs mt-1">Est. value: {formatCurrency(property.estimatedValue)}</p>
            )}
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Neighborhood Median</p>
            <p className="text-white text-2xl font-bold">{formatCurrency(median)}</p>
            <p className="text-gray-500 text-xs mt-1">Range: {formatCurrency(property.priceRangeLow)} - {formatCurrency(property.priceRangeHigh)}</p>
          </div>
        </div>

        {/* Visual Bar */}
        <div className="relative mb-3">
          <div className="h-8 bg-white/5 rounded-full relative overflow-visible">
            {/* Median marker */}
            <div
              className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-white/40 z-10"
              style={{ left: `${Math.max(2, Math.min(98, medianPosition))}%` }}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap">Median</span>
            </div>
            
            {/* Estimated value marker (if listing price exists) */}
            {property.listingPrice && (
              <div
                className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-[#34d399]/50 z-10"
                style={{ left: `${Math.max(2, Math.min(98, estimatePosition))}%` }}
              >
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-[#34d399]/60 whitespace-nowrap">AVM</span>
              </div>
            )}
            
            {/* Property position marker */}
            <div
              className={`absolute top-1 bottom-1 w-6 rounded-full transition-all z-20 ${
                isProgression ? 'bg-[#34d399]' : 'bg-[#fb7185]'
              }`}
              style={{ left: `${Math.max(0, Math.min(94, propertyPosition))}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-4 text-xs text-gray-500">
            <span>{formatCurrency(minPrice)}</span>
            <span>{formatCurrency(maxPrice)}</span>
          </div>
        </div>

        {/* Position Indicator */}
        <div className={`p-4 rounded-lg ${
          isProgression ? 'bg-[#34d399]/10' : 'bg-[#fb7185]/10'
        }`}>
          <p className={`text-sm font-medium ${
            isProgression ? 'text-[#34d399]' : 'text-[#fb7185]'
          }`}>
            {isProgression ? (
              <>
                <span className="font-bold">{percentage}% below</span> neighborhood median
                <br />
                <span className="text-xs opacity-80">🏆 &quot;Worst house on the best block&quot; — High upside potential</span>
              </>
            ) : (
              <>
                <span className="font-bold">{percentage}% above</span> neighborhood median
                <br />
                <span className="text-xs opacity-80">⚠️ &quot;Best house on the worst block&quot; — Limited upside</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Comparable Sales */}
      <div className="p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span>📊</span>
          <span>Nearby Comparables ({comps.length})</span>
        </h4>
        <div className="space-y-3">
          {comps.map((comp, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-4 p-3 bg-white/[0.03] rounded-lg border border-white/[0.05] hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate mb-1">
                  {comp.address}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                  {comp.bedrooms && <span>{comp.bedrooms} bed</span>}
                  {comp.bathrooms && <span>• {comp.bathrooms} bath</span>}
                  {comp.squareFootage && <span>• {comp.squareFootage.toLocaleString()} sqft</span>}
                  {comp.distance && <span>• {comp.distance} mi away</span>}
                  {comp.correlation && <span>• {comp.correlation}% match</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white font-semibold">{formatCurrency(comp.price)}</p>
                <p className="text-xs text-gray-500">{formatDate(comp.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
