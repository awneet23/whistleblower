import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deploymentData } = body

    if (!deploymentData || !deploymentData.contracts) {
      return NextResponse.json(
        { error: 'Invalid deployment data' },
        { status: 400 }
      )
    }

    // Store deployment data
    await kv.set('deployment:converter', deploymentData)

    return NextResponse.json({
      success: true,
      message: 'Deployment data stored successfully'
    })

  } catch (error) {
    console.error('Error storing deployment data:', error)
    return NextResponse.json(
      { error: 'Failed to store deployment data' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const deploymentData = await kv.get('deployment:converter')
    
    if (!deploymentData) {
      return NextResponse.json(
        { error: 'No deployment data found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: deploymentData
    })

  } catch (error) {
    console.error('Error fetching deployment data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deployment data' },
      { status: 500 }
    )
  }
}
