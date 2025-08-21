import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orgName, pgpKey, walletAddress } = body

    if (!orgName || typeof orgName !== 'string') {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      )
    }

    if (!pgpKey || typeof pgpKey !== 'string') {
      return NextResponse.json(
        { error: 'PGP key is required' },
        { status: 400 }
      )
    }

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Validate PGP key format (basic check)
    if (!pgpKey.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----') || 
        !pgpKey.includes('-----END PGP PUBLIC KEY BLOCK-----')) {
      return NextResponse.json(
        { error: 'Invalid PGP key format' },
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

    await kv.set(walletAddress.toLowerCase(), organizationData)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Organization registered successfully',
        walletAddress: walletAddress.toLowerCase()
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error registering organization:', error)
    return NextResponse.json(
      { error: 'Failed to register organization' },
      { status: 500 }
    )
  }
}
