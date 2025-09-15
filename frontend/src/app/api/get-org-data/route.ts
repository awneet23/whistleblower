import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    console.log(' get-org-data: Incoming request with address:', address)

    if (!address) {
      console.log(' get-org-data: No address provided in query parameters')
      return NextResponse.json(
        { error: 'Organization address is required' },
        { status: 400 }
      )
    }

    // Normalize the address to lowercase to match how it's stored
    const normalizedAddress = address.toLowerCase()
    console.log(' get-org-data: Normalized address:', normalizedAddress)

    // Fetch organization data from KV store using the wallet address as key
    console.log(' get-org-data: Attempting to fetch from KV with key:', normalizedAddress)
    const orgData = await kv.get(normalizedAddress)
    console.log(' get-org-data: Raw data retrieved from KV:', orgData)

    if (!orgData) {
      console.log(' get-org-data: No data found for address:', normalizedAddress)
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Validate that this is organization data
    const data = orgData as any
    if (!data.orgName || !data.pgpKey || !data.walletAddress) {
      console.log(' get-org-data: Invalid organization data structure:', data)
      return NextResponse.json(
        { error: 'Invalid organization data' },
        { status: 404 }
      )
    }

    // Format the data to match expected interface
    const formattedOrganization = {
      organizationName: data.orgName,
      organizationAddress: data.walletAddress,
      pgpPublicKey: data.pgpKey,
      registeredAt: data.registeredAt ? new Date(data.registeredAt).getTime() : Date.now()
    }

    console.log(' get-org-data: Successfully formatted organization data:', {
      name: formattedOrganization.organizationName,
      address: formattedOrganization.organizationAddress,
      hasPgpKey: !!formattedOrganization.pgpPublicKey
    })

    return NextResponse.json({ organization: formattedOrganization })

  } catch (error) {
    console.error(' get-org-data: Error fetching organization data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
