import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cid } = body

    if (!cid || typeof cid !== 'string') {
      return NextResponse.json(
        { error: 'Invalid CID provided' },
        { status: 400 }
      )
    }

    // Add the CID to the submissions list in Vercel KV
    await kv.lpush('submissions', cid)

    return NextResponse.json(
      { success: true, message: 'Submission saved successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving submission:', error)
    return NextResponse.json(
      { error: 'Failed to save submission' },
      { status: 500 }
    )
  }
}
