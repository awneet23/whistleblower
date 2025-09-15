import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Registration API - Incoming data:', { 
      orgName: body.orgName, 
      walletAddress: body.walletAddress,
      pgpKeyLength: body.pgpKey?.length 
    })

    const { orgName, pgpKey, walletAddress } = body

    if (!orgName || typeof orgName !== 'string') {
      console.log('Registration API - Error: Missing organization name')
      return NextResponse.json(
        { success: false, error: 'Organization name is required' },
        { status: 400 }
      )
    }

    if (!pgpKey || typeof pgpKey !== 'string') {
      console.log('Registration API - Error: Missing PGP key')
      return NextResponse.json(
        { success: false, error: 'PGP key is required' },
        { status: 400 }
      )
    }

    if (!walletAddress || typeof walletAddress !== 'string') {
      console.log('Registration API - Error: Missing wallet address')
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Validate PGP key format (basic check)
    if (!pgpKey.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----') || 
        !pgpKey.includes('-----END PGP PUBLIC KEY BLOCK-----')) {
      console.log('Registration API - Error: Invalid PGP key format')
      return NextResponse.json(
        { success: false, error: 'Invalid PGP key format' },
        { status: 400 }
      )
    }

    // Store organization data using wallet address as key
    const organizationData = {
      orgName: orgName.trim(),
      pgpKey: pgpKey.trim(),
      walletAddress: walletAddress.toLowerCase(),
      registeredAt: new Date().toISOString()
    }

    console.log('Registration API - Attempting to save to KV database...')
    
    try {
      await kv.set(walletAddress.toLowerCase(), organizationData)
      console.log('Registration API - Successfully saved to KV database')
      
      return NextResponse.json({
        success: true,
        message: 'Organization registered successfully',
        walletAddress: walletAddress.toLowerCase()
      })
    } catch (kvError) {
      console.error('Registration API - KV save error:', kvError)
      return NextResponse.json(
        { success: false, error: 'Failed to save to database' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Registration API - General error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to register organization' },
      { status: 500 }
    )
  }
}
