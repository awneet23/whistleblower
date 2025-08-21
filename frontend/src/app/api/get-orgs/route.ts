import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET(request: NextRequest) {
  try {
    // Get all keys from KV store
    const keys = await kv.keys('*')
    
    // Filter out non-organization keys (submissions list)
    const orgKeys = keys.filter(key => key !== 'submissions')
    
    const organizations = []
    
    // Fetch each organization's data
    for (const key of orgKeys) {
      try {
        const orgData = await kv.get(key)
        if (orgData && typeof orgData === 'object' && 'orgName' in orgData) {
          organizations.push(orgData)
        }
      } catch (error) {
        console.error(`Error fetching organization data for key ${key}:`, error)
        // Continue with other organizations
      }
    }

    return NextResponse.json(
      { organizations },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizations', organizations: [] },
      { status: 500 }
    )
  }
}
