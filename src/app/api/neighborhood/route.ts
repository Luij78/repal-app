import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY

interface AVMResponse {
  price: number
  priceRangeLow: number
  priceRangeHigh: number
  subjectProperty: {
    formattedAddress: string
    addressLine1: string
    city: string
    state: string
    zipCode: string
    bedrooms: number
    bathrooms: number
    squareFootage: number
    yearBuilt: number
    propertyType: string
    lastSaleDate?: string
    lastSalePrice?: number
  }
  comparables: Array<{
    formattedAddress: string
    addressLine1: string
    city: string
    state: string
    zipCode: string
    price: number
    bedrooms: number
    bathrooms: number
    squareFootage: number
    yearBuilt: number
    distance: number
    correlation: number
    listedDate?: string
    removedDate?: string
    daysOnMarket?: number
    status?: string
  }>
}

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

    // Single API call gets property value + comps
    const avmResponse = await fetch(
      `https://api.rentcast.io/v1/avm/value?address=${encodeURIComponent(address)}`,
      {
        headers: {
          'X-Api-Key': RENTCAST_API_KEY,
        },
      }
    )

    if (!avmResponse.ok) {
      const errorText = await avmResponse.text()
      console.error('RentCast AVM API error:', avmResponse.status, errorText)
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

    const data: AVMResponse = await avmResponse.json()

    if (!data.price) {
      return NextResponse.json(
        { error: 'Property value estimate not available for this address' },
        { status: 404 }
      )
    }

    // Use top 10 comps for median calculation
    const comps = (data.comparables || []).slice(0, 10)
    const compPrices = comps.map(c => c.price).filter(p => p > 0)

    if (compPrices.length === 0) {
      return NextResponse.json(
        { error: 'No comparable sales found for this address' },
        { status: 404 }
      )
    }

    // Calculate median from comps
    const sortedPrices = [...compPrices].sort((a, b) => a - b)
    const median = sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
      : sortedPrices[Math.floor(sortedPrices.length / 2)]

    const estimatedValue = data.price
    const position = estimatedValue < median ? 'progression' : 'regression'
    const percentage = Math.abs(((estimatedValue - median) / median) * 100)

    const response = {
      property: {
        address: data.subjectProperty.formattedAddress || address,
        estimatedValue,
        priceRangeLow: data.priceRangeLow,
        priceRangeHigh: data.priceRangeHigh,
        bedrooms: data.subjectProperty.bedrooms,
        bathrooms: data.subjectProperty.bathrooms,
        squareFootage: data.subjectProperty.squareFootage,
        yearBuilt: data.subjectProperty.yearBuilt,
        propertyType: data.subjectProperty.propertyType,
      },
      comps: comps.slice(0, 5).map(comp => ({
        address: comp.formattedAddress,
        price: comp.price,
        date: comp.removedDate || comp.listedDate || 'Unknown',
        bedrooms: comp.bedrooms,
        bathrooms: comp.bathrooms,
        squareFootage: comp.squareFootage,
        distance: Math.round(comp.distance * 100) / 100,
        correlation: Math.round(comp.correlation * 100),
      })),
      median: Math.round(median),
      position,
      percentage: Math.round(percentage * 10) / 10,
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
