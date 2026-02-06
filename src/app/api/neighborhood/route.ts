import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// ============================================================
// FREE Property Intelligence Engine — No RentCast, Zero Cost
// Sources: Census Bureau Geocoder + ACS 5-Year Estimates
// ============================================================

interface CensusMatch {
  matchedAddress: string
  coordinates: { x: number; y: number }
  addressComponents: {
    zip: string
    streetName: string
    city: string
    state: string
    fromAddress: string
    toAddress: string
  }
}

interface GeocodeResult {
  zip: string
  matchedAddress: string
  lat: number
  lon: number
  city: string
  state: string
  county?: string
}

interface CensusMedianResult {
  median: number
  marginOfError: number
  rangeLow: number
  rangeHigh: number
  zipCode: string
  population?: number
  medianRent?: number
}

// Step 1: Geocode address to get ZIP code (Census Bureau — FREE)
async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const encodedAddress = encodeURIComponent(address)
  const url = `https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?address=${encodedAddress}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`

  const response = await fetch(url)
  if (!response.ok) return null

  const data = await response.json()
  const matches = data?.result?.addressMatches
  if (!matches || matches.length === 0) return null

  const match: CensusMatch = matches[0]
  const county = match.matchedAddress ? undefined : undefined

  // Try to extract county from geographies
  let countyName: string | undefined
  try {
    const counties = data.result.addressMatches[0]?.geographies?.Counties
    if (counties && counties[0]) {
      countyName = counties[0].BASENAME
    }
  } catch {
    // County extraction is optional
  }

  return {
    zip: match.addressComponents.zip,
    matchedAddress: match.matchedAddress || address,
    lat: match.coordinates.y,
    lon: match.coordinates.x,
    city: match.addressComponents.city,
    state: match.addressComponents.state,
    county: countyName,
  }
}

// Step 2: Get neighborhood median from Census ACS (FREE, no API key)
async function getCensusMedian(zipCode: string): Promise<CensusMedianResult | null> {
  // B25077_001E = Median home value
  // B25077_001M = Margin of error
  // B01003_001E = Total population
  // B25064_001E = Median gross rent
  const fields = 'B25077_001E,B25077_001M,B01003_001E,B25064_001E,NAME'
  const url = `https://api.census.gov/data/2023/acs/acs5?get=${fields}&for=zip%20code%20tabulation%20area:${zipCode}`

  const response = await fetch(url)
  if (!response.ok) return null

  const data = await response.json()
  if (!data || data.length < 2) return null

  const [, values] = data
  const median = parseInt(values[0])
  const marginOfError = parseInt(values[1])
  const population = parseInt(values[2])
  const medianRent = parseInt(values[3])

  if (isNaN(median) || median <= 0) return null

  return {
    median,
    marginOfError: isNaN(marginOfError) ? 0 : marginOfError,
    rangeLow: median - (isNaN(marginOfError) ? 0 : marginOfError),
    rangeHigh: median + (isNaN(marginOfError) ? 0 : marginOfError),
    zipCode,
    population: isNaN(population) ? undefined : population,
    medianRent: isNaN(medianRent) ? undefined : medianRent,
  }
}

// Step 3: Extract property details from address using Census geocoder data
// (beds/baths/sqft not available from Census — show what we have)
function inferPropertyType(address: string): string {
  const lower = address.toLowerCase()
  if (lower.includes('apt') || lower.includes('unit') || lower.includes('#')) return 'Condo/Apartment'
  if (lower.includes('lot')) return 'Land'
  return 'Single Family'
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const address = searchParams.get('address')
    const listingPriceParam = searchParams.get('listingPrice')

    if (!address?.trim()) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // Step 1: Geocode the address
    const geocode = await geocodeAddress(address)
    if (!geocode) {
      return NextResponse.json(
        { error: 'Address not found. Try a full address with street, city, state, and ZIP.' },
        { status: 404 }
      )
    }

    // Step 2: Get Census median for the ZIP
    const censusData = await getCensusMedian(geocode.zip)
    if (!censusData) {
      return NextResponse.json(
        { error: `No Census data available for ZIP ${geocode.zip}. Try a different address.` },
        { status: 404 }
      )
    }

    // Step 3: Build the response
    // Listing price can come from:
    // - Query param (manual entry or MLS integration)
    // - Future: scraping integration
    const listingPrice = listingPriceParam ? parseInt(listingPriceParam) : null

    const median = censusData.median

    // Use listing price for position calculation if available
    const comparePrice = listingPrice
    const position = comparePrice && comparePrice < median ? 'progression' : 
                     comparePrice && comparePrice > median ? 'regression' : null
    const percentage = comparePrice 
      ? Math.round(Math.abs(((comparePrice - median) / median) * 100) * 10) / 10
      : 0

    // Listing gap (the Golden Opportunity signal)
    let listingGap = null
    if (listingPrice && median) {
      const gapAmount = median - listingPrice
      const gapPercent = Math.abs((gapAmount / median) * 100)
      listingGap = {
        listingPrice,
        neighborhoodMedian: median,
        difference: gapAmount,
        percentBelow: gapAmount > 0 ? Math.round(gapPercent * 10) / 10 : 0,
        percentAbove: gapAmount < 0 ? Math.round(gapPercent * 10) / 10 : 0,
        signal: gapAmount > 0 ? 'underpriced' : 'overpriced',
      }
    }

    const response = {
      property: {
        address: geocode.matchedAddress,
        listingPrice,
        city: geocode.city,
        state: geocode.state,
        zip: geocode.zip,
        county: geocode.county || null,
        propertyType: inferPropertyType(address),
        lat: geocode.lat,
        lon: geocode.lon,
      },
      neighborhood: {
        median: censusData.median,
        marginOfError: censusData.marginOfError,
        rangeLow: censusData.rangeLow,
        rangeHigh: censusData.rangeHigh,
        population: censusData.population || null,
        medianRent: censusData.medianRent || null,
        zipCode: censusData.zipCode,
        source: 'U.S. Census Bureau ACS 5-Year Estimates (2023)',
      },
      position: position || 'unknown',
      percentage,
      listingGap,
      dataSource: 'free',
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
