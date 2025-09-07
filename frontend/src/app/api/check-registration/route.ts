import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    console.log('Check Registration API - Incoming address:', address)

    if (!address) {
      console.log('Check Registration API - Error: No address provided')
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }

    // Check if the address exists as a key in Vercel KV (matching register-org storage format)
    const normalizedAddress = address.toLowerCase()
    console.log('Check Registration API - Looking up address:', normalizedAddress)
    
    const organizationData = await kv.get(normalizedAddress)
    console.log('Check Registration API - Retrieved data:', organizationData)
    
    const isRegistered = organizationData !== null
    console.log('Check Registration API - Is registered:', isRegistered)

    const response = { 
      isRegistered,
      address: normalizedAddress
    }
    
    console.log('Check Registration API - Returning response:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Check Registration API - Error:', error)
    return NextResponse.json(
      { error: 'Failed to check registration status' },
      { status: 500 }
    )
  }
}
