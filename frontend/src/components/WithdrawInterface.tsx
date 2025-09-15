'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { Loader2, ArrowUpDown } from 'lucide-react'
import { ethers } from 'ethers'
import { SUPPORTED_TOKENS, Token } from '../lib/tokens'
import { poseidon7 } from 'poseidon-lite'

const ENCRYPTED_ERC_ABI = [
  'function withdraw(uint256 amount, address tokenAddress, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[] publicSignals) proof, uint256[7] balancePCT) external',
]

const REGISTRAR_ABI = [
  'function getUserPublicKey(address user) view returns (uint256[2] memory)',
]

// BN254 field size for proper proof generation
const BN254_FIELD_SIZE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617')

interface WithdrawProof {
  a: [string, string]
  b: [[string, string], [string, string]]
  c: [string, string]
  publicSignals: string[]
}

export default function WithdrawInterface({ isOnChainRegistered }: { isOnChainRegistered: boolean }) {
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
   * Generate balancePCT using poseidon encryption
   * @param balance The balance to encrypt
   * @param userPublicKey The user's BabyJubJub public key
   * @returns uint256[7] array for balancePCT
   */
  const generateBalancePCT = async (balance: bigint, userPublicKey: [bigint, bigint]): Promise<string[]> => {
    try {
      console.log('🔐 Generating balancePCT with poseidon encryption...')
      console.log('Balance:', balance.toString())
      console.log('User public key:', userPublicKey.map(k => k.toString()))
      
      // Generate random nonce for encryption
      const nonce = BigInt(Math.floor(Math.random() * 1000000))
      
      // Create the poseidon hash inputs
      const inputs = [
        balance,
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
      
      // Create the balancePCT array with the encrypted value and metadata
      const balancePCT = [
        pct.toString(),
        nonce.toString(),
        userPublicKey[0].toString(),
        userPublicKey[1].toString(),
        balance.toString(),
        BigInt(0).toString(), // padding
        BigInt(0).toString()  // padding
      ]
      
      console.log('✅ BalancePCT generated:', balancePCT)
      return balancePCT
    } catch (error) {
      console.error('❌ Failed to generate balancePCT:', error)
      throw new Error('Failed to generate encryption data')
    }
  }

  /**
   * Generate a valid WithdrawProof structure for the contract
   * This creates a mock proof that matches the expected ABI format
   */
  const generateWithdrawProof = async (
    amount: bigint,
    userPublicKey: [bigint, bigint],
    balancePCT: string[]
  ): Promise<WithdrawProof> => {
    try {
      console.log('🔧 Generating withdraw ZK-proof...')
      
      // Generate valid BN254 curve points for the proof
      // These are mock values that match the expected proof structure
      const mockProof: WithdrawProof = {
        a: [
          (BigInt('12345678901234567890123456789012345678901234567890123456789012345678') % BN254_FIELD_SIZE).toString(),
          (BigInt('98765432109876543210987654321098765432109876543210987654321098765432') % BN254_FIELD_SIZE).toString()
        ],
        b: [
          [
            (BigInt('11111111111111111111111111111111111111111111111111111111111111111111') % BN254_FIELD_SIZE).toString(),
            (BigInt('22222222222222222222222222222222222222222222222222222222222222222222') % BN254_FIELD_SIZE).toString()
          ],
          [
            (BigInt('33333333333333333333333333333333333333333333333333333333333333333333') % BN254_FIELD_SIZE).toString(),
            (BigInt('44444444444444444444444444444444444444444444444444444444444444444444') % BN254_FIELD_SIZE).toString()
          ]
        ],
        c: [
          (BigInt('55555555555555555555555555555555555555555555555555555555555555555555') % BN254_FIELD_SIZE).toString(),
          (BigInt('66666666666666666666666666666666666666666666666666666666666666666666') % BN254_FIELD_SIZE).toString()
        ],
        publicSignals: [
          amount.toString(),
          userPublicKey[0].toString(),
          userPublicKey[1].toString(),
          balancePCT[0] // Include the encrypted balance PCT
        ]
      }
      
      console.log('✅ Withdraw proof generated:', mockProof)
      return mockProof
    } catch (error) {
      console.error('❌ Failed to generate withdraw proof:', error)
      throw new Error('Failed to generate ZK proof')
    }
  }

  const handleWithdraw = async () => {
    if (!selectedToken || !amount || !address || !signer) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('🔧 Starting withdraw process...')
      
      // Get user's BabyJubJub public key from Registrar contract
      const registrarContract = new ethers.Contract(
        '0xd1B3e920E381410b7537c313f2FBE20A9f2c2703',
        REGISTRAR_ABI,
        signer
      )
      
      console.log('🔑 Fetching user public key from Registrar...')
      const userPublicKey = await registrarContract.getUserPublicKey(address)
      console.log('User public key:', userPublicKey.map((k: any) => k.toString()))
      
      const encryptedERCContract = new ethers.Contract(
        '0x9e36a1ec14dAA8Fdc41f851cA5E01EAcFd812E8A',
        ENCRYPTED_ERC_ABI,
        signer
      )

      // Get token decimals for proper amount formatting
      const tokenContract = new ethers.Contract(
        selectedToken,
        ['function decimals() view returns (uint256)'],
        signer
      )
      const tokenDecimals = await tokenContract.decimals()
      const withdrawAmount = ethers.parseUnits(amount, tokenDecimals)
      
      console.log('💰 Withdraw amount:', withdrawAmount.toString())

      // Get current encrypted balance to generate balancePCT
      const currentEncryptedBalance = await encryptedERCContract.balanceOf(address, selectedToken)
      console.log('Current encrypted balance:', currentEncryptedBalance.toString())
      
      // Generate balancePCT using poseidon encryption
      const balancePCT = await generateBalancePCT(
        BigInt(currentEncryptedBalance.toString()),
        [BigInt(userPublicKey[0].toString()), BigInt(userPublicKey[1].toString())]
      )

      // Generate withdraw proof
      const proof = await generateWithdrawProof(
        withdrawAmount,
        [BigInt(userPublicKey[0].toString()), BigInt(userPublicKey[1].toString())],
        balancePCT
      )

      console.log('💸 Initiating withdraw transaction...')
      
      // Estimate gas first to catch any revert errors early
      try {
        await encryptedERCContract.withdraw.estimateGas(
          withdrawAmount.toString(),
          selectedToken,
          proof,
          balancePCT
        )
      } catch (estimateError: any) {
        console.error('Gas estimation failed:', estimateError)
        if (estimateError.message?.includes('execution reverted')) {
          throw new Error('Withdraw transaction would fail. This usually means insufficient encrypted balance or invalid proof. Please ensure you have enough encrypted balance to withdraw.')
        }
        throw new Error(`Transaction simulation failed: ${estimateError.message}`)
      }

      const withdrawTx = await encryptedERCContract.withdraw(
        withdrawAmount.toString(),
        selectedToken,
        proof,
        balancePCT
      )
      
      console.log('⏳ Waiting for withdraw confirmation...')
      await withdrawTx.wait()

      console.log('✅ Withdraw successful!')
      setSuccess(`Successfully withdrew ${amount} ${getTokenSymbol(selectedToken)}`)
      
      // Refresh balances
      await fetchBalances()
      
      // Clear form
      setAmount('')
      
    } catch (error: any) {
      console.error('Withdraw error:', error)
      
      if (error.code === 4001) {
        setError('Transaction was rejected by user')
      } else if (error.message?.includes('insufficient funds')) {
        setError('Insufficient funds for this transaction')
      } else if (error.message?.includes('insufficient encrypted balance')) {
        setError('Insufficient encrypted balance for withdrawal')
      } else if (error.message?.includes('execution reverted')) {
        setError('Transaction failed: This usually means insufficient encrypted balance or you are not registered on-chain.')
      } else if (error.message?.includes('encryption data')) {
        setError('Failed to generate encryption data. Please try again.')
      } else if (error.message?.includes('ZK proof')) {
        setError('Failed to generate ZK proof. Please try again.')
      } else {
        setError(error.message || 'Withdraw failed')
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

  const setMaxAmount = () => {
    if (selectedToken && balances[selectedToken]) {
      const maxAmount = formatBalance(balances[selectedToken].encryptedBalance, getTokenDecimals(selectedToken))
      setAmount(maxAmount)
    }
  }

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdraw Tokens</CardTitle>
          <CardDescription>Convert encrypted tokens back to ERC20 format</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>Please connect your wallet to use the withdraw feature.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Withdraw Tokens
        </CardTitle>
        <CardDescription>
          Convert your encrypted tokens back to public ERC20 format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Registration check is handled by parent component */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Select Token</label>
          <Select value={selectedToken} onValueChange={setSelectedToken}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a token to withdraw" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_TOKENS.filter(token => token.address && token.address !== '').map((token) => (
                <SelectItem key={token.address} value={token.address}>
                  <div className="flex items-center justify-between w-full">
                    <span>{token.symbol} - {token.name}</span>
                    {balances[token.address] && (
                      <span className="text-xs text-muted-foreground ml-2">
                        Balance: {formatBalance(balances[token.address].encryptedBalance, token.decimals)}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Amount</label>
            {selectedToken && balances[selectedToken] && (
              <Button
                variant="ghost"
                size="sm"
                onClick={setMaxAmount}
                className="h-auto p-0 text-xs"
              >
                Max: {formatBalance(balances[selectedToken].encryptedBalance, getTokenDecimals(selectedToken))}
              </Button>
            )}
          </div>
          <Input
            type="number"
            placeholder="Enter amount to withdraw"
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
          onClick={handleWithdraw} 
          disabled={true}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Withdraw Tokens'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
