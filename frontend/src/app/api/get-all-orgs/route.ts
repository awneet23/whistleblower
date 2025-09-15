import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET() {
  try {
    console.log('🔍 get-all-orgs: Starting to fetch all organizations...')
    
    // Use kv.scan() to get all keys that match organization pattern
    // Since organizations are stored with wallet address as key, we need to scan all keys
    const cursor = 0
    const scanResult = await kv.scan(cursor, { match: '*', count: 1000 })
    console.log('🔍 get-all-orgs: Scan result:', { 
      cursor: scanResult[0], 
      keysFound: scanResult[1]?.length || 0,
      keys: scanResult[1]
    })
    
    const allKeys = scanResult[1] || []
    
    if (allKeys.length === 0) {
      console.log('🔍 get-all-orgs: No keys found in database')
      return NextResponse.json({ organizations: [], count: 0 })
    }

    // Use kv.mget() to fetch all organization data at once
    console.log('🔍 get-all-orgs: Fetching data for keys:', allKeys)
    const allValues = await kv.mget(...allKeys)
    console.log('🔍 get-all-orgs: Raw values retrieved:', allValues)

    // Filter and format organization data
    const organizations = allValues
      .map((value, index) => {
        if (!value || typeof value !== 'object') {
          console.log(`🔍 get-all-orgs: Skipping invalid value at index ${index}:`, value)
          return null
        }
        
        // Check if this looks like organization data
        const orgData = value as any
        if (!orgData.orgName || !orgData.pgpKey || !orgData.walletAddress) {
          console.log(`🔍 get-all-orgs: Skipping non-org data at index ${index}:`, orgData)
          return null
        }

        // Format the data to match expected interface
        return {
          organizationName: orgData.orgName,
          organizationAddress: orgData.walletAddress,
          pgpPublicKey: orgData.pgpKey,
          registeredAt: orgData.registeredAt ? new Date(orgData.registeredAt).getTime() : Date.now()
        }
      })
      .filter(org => org !== null)

    console.log('🔍 get-all-orgs: Filtered organizations:', {
      totalFound: organizations.length,
      organizations: organizations.map(org => ({ 
        name: org?.organizationName, 
        address: org?.organizationAddress 
      }))
    })

    return NextResponse.json({ 
      organizations: organizations,
      count: organizations.length 
    })

  } catch (error) {
    console.error('❌ get-all-orgs: Error fetching organizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
