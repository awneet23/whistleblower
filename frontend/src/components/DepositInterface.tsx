'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { Loader2, ArrowDownUp } from 'lucide-react'
import { ethers } from 'ethers'
import { SUPPORTED_TOKENS, Token } from '../lib/tokens'
import { poseidon7 } from 'poseidon-lite'

const ERC20_ABI = [
  'function decimals() view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
]

const ENCRYPTED_ERC_ABI = [
  'function deposit(uint256 amount, address tokenAddress, uint256[7] memory amountPCT) external',
]

const REGISTRAR_ABI = [
  'function getUserPublicKey(address user) view returns (uint256[2] memory)',
]

export default function DepositInterface({ isOnChainRegistered }: { isOnChainRegistered: boolean }) {
  const { address, signer } = useWallet()
  const [selectedToken, setSelectedToken] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [balances, setBalances] = useState<any>({})

  useEffect(() => {
    if (address) {
      fetchBalances()
    }
  }, [address])

  // Remove checkRegistrationStatus since we get isRegistered from wallet context

  const fetchBalances = async () => {
    if (!address || !signer) return

    setIsLoading(true)
    setError('')

    try {
      const balanceMap: any = {}
      
      // Fetch public balances for each token
      for (const token of SUPPORTED_TOKENS) {
        try {
          // Get public ERC20 balance
          const tokenContract = new ethers.Contract(
            token.address,
            ['function balanceOf(address) view returns (uint256)'],
            signer
          )
          const publicBalance = await tokenContract.balanceOf(address)
          
          // Only fetch encrypted balance if user is registered
          let encryptedBalance = '0'
          if (isOnChainRegistered) {
            const encryptedERCAddress = '0x9e36a1ec14dAA8Fdc41f851cA5E01EAcFd812E8A'
            if (encryptedERCAddress) {
              try {
                const encryptedContract = new ethers.Contract(
                  encryptedERCAddress,
                  ['function balanceOf(address, address) view returns (uint256)'],
                  signer
                )
                encryptedBalance = await encryptedContract.balanceOf(address, token.address)
              } catch (encError) {
                console.warn('Failed to fetch encrypted balance:', encError)
              }
            }
          }
          
          balanceMap[token.address] = {
            tokenAddress: token.address,
            publicBalance: publicBalance.toString(),
            encryptedBalance: encryptedBalance.toString()
          }
        } catch (tokenError) {
          console.warn(`Failed to fetch balance for ${token.symbol}:`, tokenError)
          balanceMap[token.address] = {
            tokenAddress: token.address,
            publicBalance: '0',
            encryptedBalance: '0'
          }
        }
      }
      
      setBalances(balanceMap)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch balances')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Generate amountPCT using poseidon encryption
   * @param amount The amount to encrypt
   * @param userPublicKey The user's BabyJubJub public key
   * @returns uint256[7] array for amountPCT
   */
  const generateAmountPCT = async (amount: bigint, userPublicKey: [bigint, bigint]): Promise<string[]> => {
    try {
      console.log('🔐 Generating amountPCT with poseidon encryption...')
      console.log('Amount:', amount.toString())
      console.log('User public key:', userPublicKey.map(k => k.toString()))
      
      // Generate random nonce for encryption
      const nonce = BigInt(Math.floor(Math.random() * 1000000))
      
      // Create the poseidon hash inputs
      // This follows the pattern used in the backend for PCT generation
      const inputs = [
        amount,
        userPublicKey[0],
        userPublicKey[1],
        nonce,
        BigInt(0), // padding
        BigInt(0), // padding
        BigInt(0)  // padding
      ]
      
      // Generate poseidon hash
      const pct = poseidon7(inputs)
      console.log('Generated PCT:', pct.toString())
      
      // Create the amountPCT array with the encrypted value and metadata
      const amountPCT = [
        pct.toString(),
        nonce.toString(),
        userPublicKey[0].toString(),
        userPublicKey[1].toString(),
        amount.toString(),
        BigInt(0).toString(), // padding
        BigInt(0).toString()  // padding
      ]
      
      console.log('✅ AmountPCT generated:', amountPCT)
      return amountPCT
    } catch (error) {
      console.error('❌ Failed to generate amountPCT:', error)
      throw new Error('Failed to generate encryption data')
    }
  }

  const handleDeposit = async () => {
    if (!selectedToken || !amount || !address || !signer) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('🔧 Starting deposit process...')
      
      // Get user's BabyJubJub public key from Registrar contract
      const registrarContract = new ethers.Contract(
        '0xd1B3e920E381410b7537c313f2FBE20A9f2c2703',
        REGISTRAR_ABI,
        signer
      )
      
      console.log('🔑 Fetching user public key from Registrar...')
      const userPublicKey = await registrarContract.getUserPublicKey(address)
      console.log('User public key:', userPublicKey.map((k: any) => k.toString()))
      
      const tokenContract = new ethers.Contract(selectedToken, ERC20_ABI, signer)
      const encryptedERCContract = new ethers.Contract(
        '0x9e36a1ec14dAA8Fdc41f851cA5E01EAcFd812E8A',
        ENCRYPTED_ERC_ABI,
        signer
      )

      const tokenDecimals = await tokenContract.decimals()
      const depositAmount = ethers.parseUnits(amount, tokenDecimals)
      
      console.log('💰 Deposit amount:', depositAmount.toString())

      // Generate amountPCT using poseidon encryption
      const amountPCT = await generateAmountPCT(
        depositAmount, 
        [BigInt(userPublicKey[0].toString()), BigInt(userPublicKey[1].toString())]
      )

      // Check current allowance
      const currentAllowance = await tokenContract.allowance(address, '0x9e36a1ec14dAA8Fdc41f851cA5E01EAcFd812E8A')
      
      // Step 1: Approve tokens if needed
      if (currentAllowance < depositAmount) {
        console.log('📝 Approving tokens...')
        const approveTx = await tokenContract.approve(
          '0x9e36a1ec14dAA8Fdc41f851cA5E01EAcFd812E8A',
          depositAmount
        )
        await approveTx.wait()
        console.log('✅ Token approval successful')
      }

      // Step 2: Deposit tokens with amountPCT
      console.log('💰 Depositing tokens with encrypted amount...')
      
      // Estimate gas first to catch any revert errors early
      try {
        await encryptedERCContract.deposit.estimateGas(depositAmount, selectedToken, amountPCT)
      } catch (estimateError: any) {
        console.error('Gas estimation failed:', estimateError)
        if (estimateError.message?.includes('execution reverted')) {
          throw new Error('Deposit transaction would fail. This usually means you are not registered on-chain or there is an issue with the encryption. Please ensure you are registered using the "Register Now" button.')
        }
        throw new Error(`Transaction simulation failed: ${estimateError.message}`)
      }

      const depositTx = await encryptedERCContract.deposit(depositAmount, selectedToken, amountPCT)
      console.log('⏳ Waiting for deposit confirmation...')
      await depositTx.wait()

      console.log('✅ Deposit successful!')
      setSuccess(`Successfully deposited ${amount} ${getTokenSymbol(selectedToken)}`)
      
      // Refresh balances
      await fetchBalances()
      
      // Clear form
      setAmount('')
      
    } catch (error: any) {
      console.error('Deposit error:', error)
      
      if (error.code === 4001) {
        setError('Transaction was rejected by user')
      } else if (error.message?.includes('insufficient funds')) {
        setError('Insufficient funds for this transaction')
      } else if (error.message?.includes('not registered')) {
        setError(error.message)
      } else if (error.message?.includes('execution reverted')) {
        setError('Transaction failed: You may not be registered on-chain. Please use the "Register Now" button first.')
      } else if (error.message?.includes('encryption data')) {
        setError('Failed to generate encryption data. Please try again.')
      } else {
        setError(error.message || 'Deposit failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getTokenSymbol = (address: string) => {
    return SUPPORTED_TOKENS.find(t => t.address === address)?.symbol || 'TOKEN'
  }

  const getTokenDecimals = (address: string) => {
    return SUPPORTED_TOKENS.find(t => t.address === address)?.decimals || 18
  }

  const formatBalance = (balance: string, decimals: number) => {
    return ethers.formatUnits(balance, decimals)
  }

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deposit Tokens</CardTitle>
          <CardDescription>Convert ERC20 tokens to encrypted format</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>Please connect your wallet to use the deposit feature.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownUp className="h-5 w-5" />
          Deposit Tokens
        </CardTitle>
        <CardDescription>
          Convert your ERC20 tokens to encrypted format for private transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Registration check is handled by parent component */}
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Token</label>
          <Select value={selectedToken} onValueChange={setSelectedToken}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a token to deposit" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_TOKENS.filter(token => token.address && token.address !== '').map((token) => (
                <SelectItem key={token.address} value={token.address}>
                  <div className="flex items-center justify-between w-full">
                    <span>{token.symbol} - {token.name}</span>
                    {balances[token.address] && (
                      <span className="text-xs text-muted-foreground ml-2">
                        Balance: {formatBalance(balances[token.address].publicBalance, token.decimals)}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            placeholder="Enter amount to deposit"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {selectedToken && balances[selectedToken] && (
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span>Public Balance:</span>
              <span>{formatBalance(balances[selectedToken].publicBalance, getTokenDecimals(selectedToken))} {getTokenSymbol(selectedToken)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Encrypted Balance:</span>
              <span>{formatBalance(balances[selectedToken].encryptedBalance, getTokenDecimals(selectedToken))} {getTokenSymbol(selectedToken)}</span>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleDeposit} 
          disabled={true}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Deposit Tokens'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
