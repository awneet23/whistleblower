import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import type { Bounty } from '@/types'

export async function GET() {
  try {
    // Retrieve all bounties from Vercel KV
    console.log('Bounties API - Attempting to fetch bounties from KV database...')
    const bounties = await kv.lrange('bounties', 0, -1)
    console.log('Bounties API - Successfully fetched bounties from KV database')
    
    // Return the bounties as JSON
    return NextResponse.json({ 
      success: true, 
      bounties: bounties || [] 
    })
  } catch (error) {
    console.error('Bounties API - Error fetching bounties:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bounties' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Bounties API - Incoming data:', { 
      title: body.title, 
      organization: body.organization,
      rewardAmount: body.rewardAmount,
      rewardTokenContract: body.rewardTokenContract
    })

    const { title, organization, rewardAmount, rewardTokenContract } = body

    // Validate required fields
    if (!title || !organization || !rewardAmount || !rewardTokenContract) {
      console.log('Bounties API - Error: Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new bounty with centralized Bounty interface structure
    const newBounty: Bounty = {
      id: Date.now(), // Use timestamp as number ID to match centralized interface
      title: title.trim(),
      organization: organization.trim(),
      rewardTokenContract: rewardTokenContract.toLowerCase(),
      rewardAmount: rewardAmount.toString(),
      isOpen: true,
      createdAt: Date.now()
    }

    console.log('Bounties API - Attempting to save to KV database...')
    console.log('Bounties API - New bounty object:', newBounty)

    try {
      // Save to Vercel KV using lpush (adds to beginning of list)
      await kv.lpush('bounties', newBounty)
      console.log('Bounties API - Successfully saved to KV database')

      return NextResponse.json({
        success: true,
        message: 'Bounty created successfully',
        bounty: newBounty
      })
    } catch (kvError) {
      console.error('Bounties API - KV save error:', kvError)
      return NextResponse.json(
        { success: false, error: 'Failed to save to database' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Bounties API - General error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create bounty' },
      { status: 500 }
    )
  }
}
