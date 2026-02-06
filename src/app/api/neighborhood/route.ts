import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const address = searchParams.get('address')

    if (!address?.trim()) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    if (!RENTCAST_API_KEY) {
      return NextResponse.json({ error: 'RentCast API key not configured' }, { status: 500 })
    }

    const headers = { 'X-Api-Key': RENTCAST_API_KEY }
    const encodedAddress = encodeURIComponent(address)

    // Two API calls in parallel:
    // 1. AVM value (estimated market value + comps)
    // 2. Sale listings (actual listing/asking price)
    const [avmResponse, listingResponse] = await Promise.all([
      fetch(`https://api.rentcast.io/v1/avm/value?address=${encodedAddress}`, { headers }),
      fetch(`https://api.rentcast.io/v1/listings/sale?address=${encodedAddress}`, { headers }),
    ])

    if (!avmResponse.ok) {
      const errorText = await avmResponse.text()
      console.error('RentCast AVM error:', avmResponse.status, errorText)
      if (avmResponse.status === 404) {
        return NextResponse.json(
          { error: 'Property not found. Try a full address with city, state, and ZIP.' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch property data from RentCast' },
        { status: avmResponse.status }
      )
    }

    const avmData = await avmResponse.json()

    // Listing data is optional — property may not be listed
    let listingPrice: number | null = null
    let listingStatus: string | null = null
    let listedDate: string | null = null
    let daysOnMarket: number | null = null

    if (listingResponse.ok) {
      const listingData = await listingResponse.json()
      const listing = Array.isArray(listingData) ? listingData[0] : listingData
      if (listing?.price) {
        listingPrice = listing.price
        listingStatus = listing.status || null
        listedDate = listing.listedDate || null
        daysOnMarket = listing.daysOnMarket || null
      }
    }

    if (!avmData.price) {
      return NextResponse.json(
        { error: 'Property value estimate not available for this address' },
        { status: 404 }
      )
    }

    // Use top 10 comps for median calculation
    const comps = (avmData.comparables || []).slice(0, 10)
    const compPrices = comps.map((c: { price: number }) => c.price).filter((p: number) => p > 0)

    if (compPrices.length === 0) {
      return NextResponse.json(
        { error: 'No comparable sales found for this address' },
        { status: 404 }
      )
    }

    // Calculate median from comps
    const sortedPrices = [...compPrices].sort((a: number, b: number) => a - b)
    const median = sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
      : sortedPrices[Math.floor(sortedPrices.length / 2)]

    const estimatedValue = avmData.price

    // The KEY comparison: use listing price if available, otherwise AVM estimate
    const propertyPrice = listingPrice || estimatedValue
    const position = propertyPrice < median ? 'progression' : 'regression'
    const percentage = Math.abs(((propertyPrice - median) / median) * 100)

    // Calculate the listing vs market gap (the real golden opportunity signal)
    let listingGap = null
    if (listingPrice && listingPrice !== estimatedValue) {
      const gapAmount = estimatedValue - listingPrice
      const gapPercent = Math.abs((gapAmount / estimatedValue) * 100)
      listingGap = {
        listingPrice,
        estimatedValue,
        difference: gapAmount,
        percentBelow: gapAmount > 0 ? Math.round(gapPercent * 10) / 10 : 0,
        percentAbove: gapAmount < 0 ? Math.round(gapPercent * 10) / 10 : 0,
        signal: gapAmount > 0 ? 'underpriced' : 'overpriced',
        listingStatus,
        listedDate,
        daysOnMarket,
      }
    }

    const sub = avmData.subjectProperty || {}

    const response = {
      property: {
        address: sub.formattedAddress || address,
        estimatedValue,
        listingPrice: listingPrice || null,
        priceRangeLow: avmData.priceRangeLow,
        priceRangeHigh: avmData.priceRangeHigh,
        bedrooms: sub.bedrooms,
        bathrooms: sub.bathrooms,
        squareFootage: sub.squareFootage,
        yearBuilt: sub.yearBuilt,
        propertyType: sub.propertyType,
      },
      comps: comps.slice(0, 5).map((comp: {
        formattedAddress: string
        price: number
        removedDate?: string
        listedDate?: string
        bedrooms?: number
        bathrooms?: number
        squareFootage?: number
        distance?: number
        correlation?: number
      }) => ({
        address: comp.formattedAddress,
        price: comp.price,
        date: comp.removedDate || comp.listedDate || 'Unknown',
        bedrooms: comp.bedrooms,
        bathrooms: comp.bathrooms,
        squareFootage: comp.squareFootage,
        distance: comp.distance ? Math.round(comp.distance * 100) / 100 : null,
        correlation: comp.correlation ? Math.round(comp.correlation * 100) : null,
      })),
      median: Math.round(median),
      position,
      percentage: Math.round(percentage * 10) / 10,
      listingGap,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Neighborhood API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze neighborhood position' },
      { status: 500 }
    )
  }
}
