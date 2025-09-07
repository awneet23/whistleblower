import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, signature } = body

    if (!walletAddress || !signature) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // For now, simulate successful registration preparation
    // In production, this would interact with the Registrar contract
    const registrarAddress = process.env.NEXT_PUBLIC_REGISTRAR_ADDRESS

    if (!registrarAddress) {
      return NextResponse.json(
        { error: 'Registrar contract not configured' },
        { status: 500 }
      )
    }

    // Mock key generation (in production, would derive from signature)
    const mockPublicKey = ethers.keccak256(ethers.toUtf8Bytes(walletAddress + signature)).slice(0, 66)

    return NextResponse.json({
      success: true,
      message: 'User registration prepared successfully',
      data: {
        registrarAddress,
        publicKey: mockPublicKey,
        walletAddress: walletAddress.toLowerCase()
      }
    })

  } catch (error) {
    console.error('Error preparing user registration:', error)
    return NextResponse.json(
      { error: 'Failed to prepare user registration' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    const registrarAddress = process.env.NEXT_PUBLIC_REGISTRAR_ADDRESS
    if (!registrarAddress) {
      return NextResponse.json(
        { error: 'Registrar contract not configured' },
        { status: 500 }
      )
    }

    // For now, simulate registration check
    // In production, this would check the Registrar contract
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL
    if (!rpcUrl) {
      return NextResponse.json({
        success: true,
        isRegistered: false,
        userData: null
      })
    }

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const registrar = new ethers.Contract(
        registrarAddress,
        ['function isUserRegistered(address) view returns (bool)'],
        provider
      )

      const isRegistered = await registrar.isUserRegistered(walletAddress)
      
      return NextResponse.json({
        success: true,
        isRegistered,
        userData: null
      })
    } catch (contractError) {
      // If contract call fails, assume not registered
      return NextResponse.json({
        success: true,
        isRegistered: false,
        userData: null
      })
    }

  } catch (error) {
    console.error('Error checking user registration:', error)
    return NextResponse.json(
      { error: 'Failed to check user registration' },
      { status: 500 }
    )
  }
}
