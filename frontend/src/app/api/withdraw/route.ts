import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { kv } from '@vercel/kv'
import { decryptEGCTBalance, deriveKeysFromUser } from '../../../lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      walletAddress, 
      tokenAddress,
      amount,
      signature
    } = body

    if (!walletAddress || !tokenAddress || !amount || !signature) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get deployment data
    const deploymentData = await kv.get('deployment:converter') as any
    if (!deploymentData) {
      return NextResponse.json(
        { error: 'EncryptedERC system not deployed' },
        { status: 500 }
      )
    }

    const {
      encryptedERC: encryptedERCAddress,
      registrar: registrarAddress
    } = deploymentData.contracts

    // Initialize provider and contracts
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
    const encryptedERC = new ethers.Contract(
      encryptedERCAddress,
      require('../../../lib/abis/EncryptedERC.json'),
      provider
    )
    const registrar = new ethers.Contract(
      registrarAddress,
      require('../../../lib/abis/Registrar.json'),
      provider
    )

    // Check if user is registered
    const isRegistered = await registrar.isUserRegistered(walletAddress)
    if (!isRegistered) {
      return NextResponse.json(
        { error: 'User not registered in EncryptedERC system' },
        { status: 400 }
      )
    }

    // Generate keys from signature
    const { privateKey } = await deriveKeysFromUser(walletAddress, signature)

    // Get token ID for the token address
    const tokenId = await encryptedERC.getTokenId(tokenAddress)

    // Get user's encrypted balance
    const encryptedBalance = await encryptedERC.getEncryptedBalance(walletAddress, tokenId)

    // Decrypt balance to verify user has sufficient funds
    const decryptedBalance = await decryptEGCTBalance(encryptedBalance, privateKey)
    
    if (decryptedBalance < BigInt(amount)) {
      return NextResponse.json(
        { error: 'Insufficient encrypted balance' },
        { status: 400 }
      )
    }

    // Store withdrawal transaction data
    const withdrawalData = {
      walletAddress: walletAddress.toLowerCase(),
      tokenAddress,
      tokenId: tokenId.toString(),
      amount,
      decryptedBalance: decryptedBalance.toString(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    }

    const withdrawalKey = `withdrawal:${walletAddress.toLowerCase()}:${Date.now()}`
    await kv.set(withdrawalKey, withdrawalData)

    return NextResponse.json({
      success: true,
      message: 'Withdrawal prepared successfully',
      data: {
        encryptedERCAddress,
        tokenId: tokenId.toString(),
        currentBalance: decryptedBalance.toString(),
        withdrawalKey
      }
    })

  } catch (error) {
    console.error('Error preparing withdrawal:', error)
    return NextResponse.json(
      { error: 'Failed to prepare withdrawal' },
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

    // Get user's withdrawal history
    const withdrawals = await kv.keys(`withdrawal:${walletAddress.toLowerCase()}:*`)
    const withdrawalHistory = []

    for (const key of withdrawals) {
      const withdrawalData = await kv.get(key)
      if (withdrawalData) {
        withdrawalHistory.push(withdrawalData)
      }
    }

    return NextResponse.json({
      success: true,
      withdrawals: withdrawalHistory.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    })

  } catch (error) {
    console.error('Error fetching withdrawals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    )
  }
}
