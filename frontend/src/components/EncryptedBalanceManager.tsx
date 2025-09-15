'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { Loader2, RefreshCw, Eye, EyeOff, Info } from 'lucide-react'
import { ethers } from 'ethers'
import { SUPPORTED_TOKENS, Token } from '../lib/tokens'
import { poseidon3 } from 'poseidon-lite'
import { Base8, mulPointEscalar, subOrder } from '@zk-kit/baby-jubjub'
import { formatPrivKeyForBabyJub } from 'maci-crypto'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { useToast } from '@/components/ui/use-toast'

// Define the RegisterProof interface to match the contract structure
interface RegisterProof {
  pi_a: [string, string]
  pi_b: [[string, string], [string, string]]
  pi_c: [string, string]
  publicSignals: [string, string, string, string, string]
}

/**
 * Derives a private key from a signature using the i0 function (matches backend exactly)
 */
function i0(signature: string): bigint {
  if (typeof signature !== "string" || signature.length < 132)
    throw new Error("Invalid signature hex string");

  const hash = ethers.keccak256(signature as `0x${string}`);          
  const cleanSig = hash.startsWith("0x") ? hash.slice(2) : hash;
  let bytes = hexToBytes(cleanSig);

  bytes[0] &= 0b11111000;
  bytes[31] &= 0b01111111;
  bytes[31] |= 0b01000000;

  const le = bytes.reverse();               
  let sk = BigInt(`0x${bytesToHex(le)}`);

  sk %= subOrder;
  if (sk === BigInt(0)) sk = BigInt(1);  
  return sk;                                  
}

/**
 * Derives keys from user signature (matches backend deriveKeysFromUser exactly)
 */
async function deriveKeysFromUser(userAddress: string, signer: any): Promise<{
  privateKey: bigint;
  formattedPrivateKey: bigint;
  publicKey: [bigint, bigint];
  signature: string;
}> {
  // Create deterministic message for signing (EXACT match with backend)
  const message = `eERC
Registering user with
 Address:${userAddress.toLowerCase()}`;
  
  console.log('📝 Message to sign:', message);
  
  // Get signature from user
  const signature = await signer.signMessage(message);
  if (!signature || signature.length < 64) {
    throw new Error("Invalid signature received from user");
  }
  
  // Derive private key from signature deterministically
  console.log("🔑 Deriving private key from signature...");
  const privateKey = i0(signature);
  console.log("Private key (raw):", privateKey.toString());
  
  // Format private key for BabyJubJub
  const formattedPrivateKey = formatPrivKeyForBabyJub(privateKey) % subOrder;
  console.log("Private key (formatted):", formattedPrivateKey.toString());
  
  // Generate public key using BabyJubJub
  const publicKey = mulPointEscalar(Base8, formattedPrivateKey).map((x) => BigInt(x)) as [bigint, bigint];
  console.log("Public key X:", publicKey[0].toString());
  console.log("Public key Y:", publicKey[1].toString());
  
  return {
    privateKey,
    formattedPrivateKey,
    publicKey,
    signature
  };
}

export default function EncryptedBalanceManager() {
  const { address, signer, isOnChainRegistered, isCheckingOnChainRegistration, checkOnChainRegistration } = useWallet()
  const [balances, setBalances] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEncryptedBalances, setShowEncryptedBalances] = useState(true)

  useEffect(() => {
    if (address) {
      fetchBalances()
    }
  }, [address])

  useEffect(() => {
    if (address && isOnChainRegistered) {
      fetchBalances()
    }
  }, [address, isOnChainRegistered])

  const fetchBalances = async () => {
    if (!address || !signer) return

    setIsLoading(true)
    setError('')

    try {
      const balanceMap: any = {}
      
      // Fetch balances for each token
      for (const token of SUPPORTED_TOKENS) {
        try {
          // Get public ERC20 balance
          const tokenContract = new ethers.Contract(
            token.address,
            ['function balanceOf(address) view returns (uint256)'],
            signer
          )
          const publicBalance = await tokenContract.balanceOf(address)
          
          // Get encrypted balance from EncryptedERC contract
          const encryptedERCAddress = '0x9e36a1ec14dAA8Fdc41f851cA5E01EAcFd812E8A'
          let encryptedBalance = '0'
          
          if (encryptedERCAddress && isOnChainRegistered) {
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

  const { toast } = useToast()

  const handleGetTestTokens = async () => {
    if (!address || !signer) return
    
    try {
      setIsLoading(true)
      setError('')
      
      // Use the correct TEST token address
      const testTokenAddress = '0x0B1f1DFA854de3534F72C5Aca1c3Ef0f09A04E06'
      const testTokenContract = new ethers.Contract(
        testTokenAddress,
        [
          'function mint(address to, uint256 amount) external',
          'function balanceOf(address account) view returns (uint256)'
        ],
        signer
      )
      
      // Mint 1000 TEST tokens to user
      const mintAmount = ethers.parseEther('1000')
      console.log('🪙 Minting test tokens...')
      const tx = await testTokenContract.mint(address, mintAmount)
      console.log('⏳ Waiting for mint confirmation...')
      await tx.wait()
      console.log('✅ Test tokens minted successfully!')
      
      // Refresh balances after successful mint
      await fetchBalances()
      setError('')
    } catch (error: any) {
      console.error('❌ Mint error:', error)
      setError(error.message || 'Failed to get test tokens')
    } finally {
      setIsLoading(false)
    }
  }

  const formatBalance = (balance: string, decimals: number) => {
    if (!balance || balance === '0') return '0.00'
    return parseFloat(ethers.formatUnits(balance, decimals)).toFixed(4)
  }

  const getTotalValue = (balance: any, decimals: number) => {
    if (!balance) return '0.00'
    const publicBalance = parseFloat(ethers.formatUnits(balance.publicBalance || '0', decimals))
    const encryptedBalance = parseFloat(ethers.formatUnits(balance.encryptedBalance || '0', decimals))
    return (publicBalance + encryptedBalance).toFixed(4)
  }

  const renderRegistrationStatus = () => {
    if (isCheckingOnChainRegistration) {
      return (
        <Alert className="mb-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Verifying on-chain registration status...
          </AlertDescription>
        </Alert>
      )
    }

    // Show Coming Soon message instead of registration functionality
    return (
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>On-Chain Identity Coming Soon:</strong> This is where you will manage your on-chain cryptographic identity, which is required for all private transactions. This feature is under active development.
        </AlertDescription>
      </Alert>
    )
  }

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Encrypted Balance Manager</CardTitle>
          <CardDescription>View and manage your encrypted token balances</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>Please connect your wallet to view your balances.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Encrypted Balance Manager</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEncryptedBalances(!showEncryptedBalances)}
            >
              {showEncryptedBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBalances}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Real-time encrypted balance decryption with 100x faster algorithms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderRegistrationStatus()}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {SUPPORTED_TOKENS.map((token) => {
            const balance = balances[token.address]
            return (
              <div
                key={token.address}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">{token.symbol[0]}</span>
                    </div>
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {balance ? getTotalValue(balance, token.decimals) : '0.00'} {token.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Balance</div>
                  </div>
                </div>

                {balance && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Public Balance</div>
                      <div className="font-mono text-sm">
                        {formatBalance(balance.publicBalance, token.decimals)} {token.symbol}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Encrypted Balance</div>
                      <div className="font-mono text-sm">
                        {showEncryptedBalances ? (
                          `${formatBalance(balance.encryptedBalance, token.decimals)} ${token.symbol}`
                        ) : (
                          '••••••••'
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!balance && !isLoading && (
                  <div className="text-center text-muted-foreground text-sm py-2">
                    No balance data available
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {isOnChainRegistered && Object.keys(balances).length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground py-8">
            <p>No token balances found.</p>
            <p className="text-sm">Deposit some tokens to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
