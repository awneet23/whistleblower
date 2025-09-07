import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { kv } from '@vercel/kv'
import { decryptEGCTBalance, deriveKeysFromUser } from '../../../lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const tokenAddress = searchParams.get('tokenAddress')
    const signature = searchParams.get('signature')

    if (!walletAddress || !tokenAddress || !signature) {
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
    const tokenContract = new ethers.Contract(
      tokenAddress,
      require('../../../lib/abis/ERC20.json'),
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

    // Get token ID and encrypted balance
    const tokenId = await encryptedERC.getTokenId(tokenAddress)
    const encryptedBalance = await encryptedERC.getEncryptedBalance(walletAddress, tokenId)
    
    // Get public ERC20 balance
    const publicBalance = await tokenContract.balanceOf(walletAddress)
    
    // Get token metadata
    const tokenName = await tokenContract.name()
    const tokenSymbol = await tokenContract.symbol()
    const tokenDecimals = await tokenContract.decimals()

    // Decrypt encrypted balance using optimized algorithms
    let decryptedBalance = BigInt(0)
    try {
      decryptedBalance = await decryptEGCTBalance(encryptedBalance, privateKey)
    } catch (error) {
      console.warn('Could not decrypt balance, user may have zero encrypted balance')
    }

    // Store balance check in history
    const balanceData = {
      walletAddress: walletAddress.toLowerCase(),
      tokenAddress,
      tokenName,
      tokenSymbol,
      publicBalance: publicBalance.toString(),
      encryptedBalance: decryptedBalance.toString(),
      timestamp: new Date().toISOString()
    }

    const balanceKey = `balance:${walletAddress.toLowerCase()}:${Date.now()}`
    await kv.set(balanceKey, balanceData)

    return NextResponse.json({
      success: true,
      data: {
        tokenAddress,
        tokenId: tokenId.toString(),
        tokenName,
        tokenSymbol,
        decimals: tokenDecimals,
        publicBalance: publicBalance.toString(),
        encryptedBalance: decryptedBalance.toString(),
        totalBalance: (publicBalance + decryptedBalance).toString()
      }
    })

  } catch (error) {
    console.error('Error checking balance:', error)
    return NextResponse.json(
      { error: 'Failed to check balance' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, tokens, signature } = body

    if (!walletAddress || !tokens || !Array.isArray(tokens) || !signature) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    const balances = []

    for (const tokenAddress of tokens) {
      try {
        // Use the GET logic for each token
        const url = new URL(request.url)
        url.searchParams.set('walletAddress', walletAddress)
        url.searchParams.set('tokenAddress', tokenAddress)
        url.searchParams.set('signature', signature)
        
        const balanceRequest = new NextRequest(url.toString())
        const balanceResponse = await GET(balanceRequest)
        const balanceData = await balanceResponse.json()
        
        if (balanceData.success) {
          balances.push(balanceData.data)
        }
      } catch (error) {
        console.warn(`Failed to get balance for token ${tokenAddress}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      balances
    })

  } catch (error) {
    console.error('Error checking multiple balances:', error)
    return NextResponse.json(
      { error: 'Failed to check balances' },
      { status: 500 }
    )
  }
}
