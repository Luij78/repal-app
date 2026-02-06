'use client'

import { useState } from 'react'

interface PropertyData {
  address: string
  listingPrice: number | null
  city: string
  state: string
  zip: string
  county: string | null
  propertyType: string
}

interface NeighborhoodData {
  median: number
  marginOfError: number
  rangeLow: number
  rangeHigh: number
  population: number | null
  medianRent: number | null
  zipCode: string
  source: string
}

interface ListingGap {
  listingPrice: number
  neighborhoodMedian: number
  difference: number
  percentBelow: number
  percentAbove: number
  signal: 'underpriced' | 'overpriced'
}

interface ApiResponse {
  property: PropertyData
  neighborhood: NeighborhoodData
  position: 'progression' | 'regression' | 'unknown'
  percentage: number
  listingGap: ListingGap | null
  dataSource: string
}

const formatCurrency = (amount: number) => {
  return '$' + amount.toLocaleString()
}

export default function NeighborhoodPosition() {
  const [address, setAddress] = useState('')
  const [listingPrice, setListingPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!address.trim()) return

    setLoading(true)
    setError(null)
    setData(null)

    try {
      let url = `/api/neighborhood?address=${encodeURIComponent(address)}`
      
      // Parse listing price — strip $ and commas
      const cleanPrice = listingPrice.replace(/[$,\s]/g, '')
      if (cleanPrice && !isNaN(parseInt(cleanPrice))) {
        url += `&listingPrice=${parseInt(cleanPrice)}`
      }

      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch neighborhood data')
      }

      const result: ApiResponse = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const { property, neighborhood, position, percentage, listingGap } = data || {}
  const isProgression = position === 'progression'
  const isRegression = position === 'regression'
  const hasPosition = position === 'progression' || position === 'regression'

  // Calculate bar positions
  const displayPrice = property?.listingPrice || null
  const median = neighborhood?.median || 0
  let propertyBarPosition = 50
  let medianBarPosition = 50
  let barMin = 0
  let barMax = 0

  if (displayPrice && median) {
    const prices = [displayPrice, median, neighborhood?.rangeLow || median, neighborhood?.rangeHigh || median]
    barMin = Math.min(...prices) * 0.9
    barMax = Math.max(...prices) * 1.1
    const barRange = barMax - barMin
    propertyBarPosition = barRange > 0 ? ((displayPrice - barMin) / barRange) * 100 : 50
    medianBarPosition = barRange > 0 ? ((median - barMin) / barRange) * 100 : 50
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-[#1a1b23] border border-white/10 rounded-xl p-4">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter address (e.g. 123 Main St, Orlando, FL 32801)"
            className="flex-1 bg-[#0d0e14] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#34d399]/50"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !address.trim()}
            className="px-5 py-3 bg-[#34d399] text-black font-bold rounded-lg hover:bg-[#2ec48a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
          >
            🔍 Search
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={listingPrice}
            onChange={(e) => setListingPrice(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Listing price (e.g. $249,900)"
            className="w-56 bg-[#0d0e14] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#fbbf24]/50"
          />
          <span className="text-gray-500 text-xs">Optional — enter asking price to detect opportunities</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-[#1a1b23] border border-white/10 rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-white/5 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-white/5 rounded mb-4"></div>
          <div className="h-40 bg-white/5 rounded"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-[#1a1b23] border border-red-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-red-400 font-semibold mb-1">Error</h3>
              <p className="text-gray-300 text-sm">{error}</p>
              <button
                onClick={handleSearch}
                className="mt-3 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {data && property && neighborhood && (
        <div className="bg-[#1a1b23] border border-white/10 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">
                  {property.address}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{property.propertyType}</span>
                  {property.county && <span>• {property.county} County</span>}
                  <span>• ZIP {property.zip}</span>
                </div>
              </div>
              {hasPosition && (
                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 ${
                  isProgression 
                    ? 'bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30' 
                    : 'bg-[#fb7185]/20 text-[#fb7185] border border-[#fb7185]/30'
                }`}>
                  <span>{isProgression ? '↑' : '↓'}</span>
                  <span>{isProgression ? 'Progression' : 'Regression'}</span>
                </div>
              )}
              {!hasPosition && (
                <div className="px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 bg-gray-500/20 text-gray-400 border border-gray-500/30">
                  <span>📊</span>
                  <span>Median Data</span>
                </div>
              )}
            </div>
          </div>

          {/* 🔥 GOLDEN OPPORTUNITY — Listing Price vs Neighborhood Median */}
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
                  <p className="text-gray-400 text-xs uppercase tracking-wider">ZIP Median</p>
                  <p className="text-[#34d399] text-xl font-bold">{formatCurrency(listingGap.neighborhoodMedian)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Below Median</p>
                  <p className="text-[#fbbf24] text-xl font-bold">{listingGap.percentBelow}%</p>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-[#fbbf24] text-sm font-semibold">
                  💰 {formatCurrency(listingGap.difference)} below neighborhood median
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Based on U.S. Census median home value for ZIP {neighborhood.zipCode}
                </p>
              </div>
            </div>
          )}

          {/* ⚠️ OVERPRICED LISTING */}
          {listingGap && listingGap.signal === 'overpriced' && listingGap.percentAbove >= 5 && (
            <div className="mx-6 mt-6 p-4 rounded-xl bg-[#fb7185]/10 border border-[#fb7185]/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <h4 className="text-[#fb7185] font-bold text-base">ABOVE MEDIAN</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Listed at <span className="text-white font-semibold">{formatCurrency(listingGap.listingPrice)}</span> — 
                that&apos;s <span className="text-[#fb7185] font-semibold">{listingGap.percentAbove}%</span> above the neighborhood median of {formatCurrency(listingGap.neighborhoodMedian)}.
              </p>
            </div>
          )}

          {/* Value Comparison */}
          <div className="p-6 border-b border-white/10">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                  {property.listingPrice ? 'Listing Price' : 'No Listing Price'}
                </p>
                {property.listingPrice ? (
                  <p className="text-white text-2xl font-bold">{formatCurrency(property.listingPrice)}</p>
                ) : (
                  <p className="text-gray-500 text-lg">Enter above to compare</p>
                )}
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Neighborhood Median</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(neighborhood.median)}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Range: {formatCurrency(neighborhood.rangeLow)} - {formatCurrency(neighborhood.rangeHigh)}
                </p>
              </div>
            </div>

            {/* Visual Bar — only show if we have a listing price */}
            {displayPrice && (
              <>
                <div className="relative mb-3">
                  <div className="h-8 bg-white/5 rounded-full relative overflow-visible">
                    {/* Median marker */}
                    <div
                      className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-white/40 z-10"
                      style={{ left: `${Math.max(2, Math.min(98, medianBarPosition))}%` }}
                    >
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap">Median</span>
                    </div>
                    
                    {/* Property position marker */}
                    <div
                      className={`absolute top-1 bottom-1 w-6 rounded-full transition-all z-20 ${
                        isProgression ? 'bg-[#34d399]' : isRegression ? 'bg-[#fb7185]' : 'bg-gray-400'
                      }`}
                      style={{ left: `${Math.max(0, Math.min(94, propertyBarPosition))}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-4 text-xs text-gray-500">
                    <span>{formatCurrency(Math.round(barMin))}</span>
                    <span>{formatCurrency(Math.round(barMax))}</span>
                  </div>
                </div>

                {/* Position Indicator */}
                {hasPosition && (
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
                )}
              </>
            )}
          </div>

          {/* Neighborhood Stats */}
          <div className="p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>📊</span>
              <span>ZIP {neighborhood.zipCode} Stats</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Median Home Value</p>
                <p className="text-white font-bold text-lg">{formatCurrency(neighborhood.median)}</p>
                <p className="text-gray-500 text-xs">±{formatCurrency(neighborhood.marginOfError)}</p>
              </div>
              {neighborhood.medianRent && (
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Median Rent</p>
                  <p className="text-white font-bold text-lg">{formatCurrency(neighborhood.medianRent)}/mo</p>
                </div>
              )}
              {neighborhood.population && (
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Population</p>
                  <p className="text-white font-bold text-lg">{neighborhood.population.toLocaleString()}</p>
                </div>
              )}
            </div>
            <p className="text-gray-600 text-xs mt-4">
              📡 {neighborhood.source} • $0 cost • Unlimited searches
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
