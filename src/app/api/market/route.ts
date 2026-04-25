import { NextRequest, NextResponse } from 'next/server'

const RENTCAST_KEY = '1a0dd61b5fe74d0fad22d18f72d78683'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const type = searchParams.get('type') ?? 'value'

  if (!address) {
    return NextResponse.json({ error: 'address is required' }, { status: 400 })
  }

  const params = new URLSearchParams({ address, propertyType: 'Single Family' })

  const url = type === 'comparables'
    ? `https://api.rentcast.io/v1/avm/sale/comparables?${params}&limit=5`
    : `https://api.rentcast.io/v1/avm/value?${params}`

  const res = await fetch(url, {
    headers: { 'X-Api-Key': RENTCAST_KEY },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
