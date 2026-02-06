import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY

interface RentCastProperty {
  address: string
  addressLine1?: string
  city?: string
  state?: string
  zipCode?: string
  price?: number
  bedrooms?: number
  bathrooms?: number
  squareFootage?: number
  yearBuilt?: number
  propertyType?: string
}

interface ComparableSale {
  id: string
  address: string
  addressLine1?: string
  city?: string
  state?: string
  zipCode?: string
  price: number
  soldDate?: string
  bedrooms?: number
  bathrooms?: number
  squareFootage?: number
  distance?: number
}

interface NeighborhoodResponse {
  property: {
    address: string
    estimatedValue: number
    bedrooms?: number
    bathrooms?: number
    squareFootage?: number
  }
  comps: Array<{
    address: string
    price: number
    date: string
    bedrooms?: number
    bathrooms?: number
    squareFootage?: number
    distance?: number
  }>
  median: number
  position: 'progression' | 'regression'
  percentage: number
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

    // Fetch property details and value estimate
    const propertyResponse = await fetch(
      `https://api.rentcast.io/v1/properties?address=${encodeURIComponent(address)}`,
      {
        headers: {
          'X-Api-Key': RENTCAST_API_KEY,
        },
      }
    )

    if (!propertyResponse.ok) {
      const errorText = await propertyResponse.text()
      console.error('RentCast property API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch property data from RentCast' },
        { status: propertyResponse.status }
      )
    }

    const propertyData: RentCastProperty = await propertyResponse.json()

    // Fetch comparable sales
    const compsResponse = await fetch(
      `https://api.rentcast.io/v1/comparable-sales?address=${encodeURIComponent(address)}&limit=5`,
      {
        headers: {
          'X-Api-Key': RENTCAST_API_KEY,
        },
      }
    )

    if (!compsResponse.ok) {
      const errorText = await compsResponse.text()
      console.error('RentCast comps API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch comparable sales from RentCast' },
        { status: compsResponse.status }
      )
    }

    const compsData: ComparableSale[] = await compsResponse.json()

    // Calculate median from comps
    const compPrices = compsData.map(comp => comp.price).filter(price => price > 0)
    
    if (compPrices.length === 0) {
      return NextResponse.json(
        { error: 'No comparable sales found for this address' },
        { status: 404 }
      )
    }

    const sortedPrices = compPrices.sort((a, b) => a - b)
    const median = sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
      : sortedPrices[Math.floor(sortedPrices.length / 2)]

    // Determine property value (use price or estimate)
    const estimatedValue = propertyData.price || 0

    if (!estimatedValue) {
      return NextResponse.json(
        { error: 'Property value estimate not available' },
        { status: 404 }
      )
    }

    // Calculate position and percentage
    const position: 'progression' | 'regression' = estimatedValue < median ? 'progression' : 'regression'
    const percentage = Math.abs(((estimatedValue - median) / median) * 100)

    // Format property address
    const propertyAddress = propertyData.addressLine1
      ? `${propertyData.addressLine1}, ${propertyData.city}, ${propertyData.state} ${propertyData.zipCode}`
      : propertyData.address

    // Format response
    const response: NeighborhoodResponse = {
      property: {
        address: propertyAddress || address,
        estimatedValue,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        squareFootage: propertyData.squareFootage,
      },
      comps: compsData.map(comp => ({
        address: comp.addressLine1
          ? `${comp.addressLine1}, ${comp.city}, ${comp.state} ${comp.zipCode}`
          : comp.address,
        price: comp.price,
        date: comp.soldDate || 'Unknown',
        bedrooms: comp.bedrooms,
        bathrooms: comp.bathrooms,
        squareFootage: comp.squareFootage,
        distance: comp.distance,
      })),
      median,
      position,
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
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
