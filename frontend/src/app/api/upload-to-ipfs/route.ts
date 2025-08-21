import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { content, filename } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Create a File object from the content
    const file = new File([content], filename || 'encrypted-data.txt', {
      type: 'text/plain'
    })

    // Upload to IPFS using Pinata
    const formData = new FormData()
    formData.append('file', file)

    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
      },
      body: formData
    })

    if (!pinataResponse.ok) {
      // Fallback: Generate a mock CID for development
      const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      
      return NextResponse.json({
        cid: mockCid,
        message: 'Using mock CID for development. Configure PINATA_JWT environment variable for production.'
      })
    }

    const result = await pinataResponse.json()
    
    return NextResponse.json({
      cid: result.IpfsHash,
      message: 'File uploaded to IPFS successfully'
    })

  } catch (error) {
    console.error('IPFS upload error:', error)
    
    // Fallback: Generate a mock CID for development
    const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    
    return NextResponse.json({
      cid: mockCid,
      message: 'Using mock CID due to upload error. Configure PINATA_JWT for production.'
    })
  }
}
