import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

interface Bounty {
  id: string
  title: string
  summary: string
  rewardAmount: string
  rewardToken: string
  organizationAddress: string
  createdAt: number
  isOpen: boolean
}

export async function GET() {
  try {
    // Retrieve all bounties from Vercel KV
    const bounties = await kv.lrange('bounties', 0, -1)
    
    // Return the bounties as JSON
    return NextResponse.json({ 
      success: true, 
      bounties: bounties || [] 
    })
  } catch (error) {
    console.error('Error fetching bounties:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bounties' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, summary, rewardAmount, rewardToken, organizationAddress } = body

    // Validate required fields
    if (!title || !summary || !rewardAmount || !rewardToken || !organizationAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new bounty object
    const newBounty: Bounty = {
      id: `bounty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      summary: summary.trim(),
      rewardAmount: rewardAmount.toString(),
      rewardToken: rewardToken.toLowerCase(),
      organizationAddress: organizationAddress.toLowerCase(),
      createdAt: Date.now(),
      isOpen: true
    }

    // Save to Vercel KV using lpush (adds to beginning of list)
    await kv.lpush('bounties', newBounty)

    console.log('New bounty created:', newBounty)

    return NextResponse.json({
      success: true,
      message: 'Bounty created successfully',
      bounty: newBounty
    })
  } catch (error) {
    console.error('Error creating bounty:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create bounty' },
      { status: 500 }
    )
  }
}
