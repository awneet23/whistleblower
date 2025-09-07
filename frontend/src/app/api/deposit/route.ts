import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { kv } from '@vercel/kv'
import { processPoseidonEncryption } from '../../../lib/poseidon'
import { deriveKeysFromUser } from '../../../lib/utils'

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
    const { privateKey, publicKey } = await deriveKeysFromUser(walletAddress, signature)

    // Get user's public key from registrar
    const userPublicKey = await registrar.getUserPublicKey(walletAddress)

    // Generate encrypted amount using Poseidon encryption
    const amountPCT = await processPoseidonEncryption(
      amount,
      userPublicKey,
      privateKey
    )

    // Store deposit transaction data
    const depositData = {
      walletAddress: walletAddress.toLowerCase(),
      tokenAddress,
      amount,
      amountPCT,
      timestamp: new Date().toISOString(),
      status: 'pending'
    }

    const depositKey = `deposit:${walletAddress.toLowerCase()}:${Date.now()}`
    await kv.set(depositKey, depositData)

    return NextResponse.json({
      success: true,
      message: 'Deposit prepared successfully',
      data: {
        encryptedERCAddress,
        amountPCT,
        depositKey
      }
    })

  } catch (error) {
    console.error('Error preparing deposit:', error)
    return NextResponse.json(
      { error: 'Failed to prepare deposit' },
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

    // Get user's deposit history
    const deposits = await kv.keys(`deposit:${walletAddress.toLowerCase()}:*`)
    const depositHistory = []

    for (const key of deposits) {
      const depositData = await kv.get(key)
      if (depositData) {
        depositHistory.push(depositData)
      }
    }

    return NextResponse.json({
      success: true,
      deposits: depositHistory.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    })

  } catch (error) {
    console.error('Error fetching deposits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deposits' },
      { status: 500 }
    )
  }
}
