'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Lock, AlertCircle, Loader2, DollarSign } from 'lucide-react'
import { ethers } from 'ethers'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'

// Predefined tokens for Fuji testnet
const REWARD_TOKENS = [
  { symbol: 'pUSDC', address: '0x5425890298aed601595a70AB815c96711a31Bc65', decimals: 6 },
  { symbol: 'pLINK', address: '0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846', decimals: 18 },
  { symbol: 'pDAI', address: '0x51BC2DfB9D12d9dB50C855A5330fBA0faF761D15', decimals: 18 },
]

export default function CreateBountyPage() {
  const [title, setTitle] = useState('')
  const [rewardToken, setRewardToken] = useState('')
  const [rewardAmount, setRewardAmount] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [currentStep, setCurrentStep] = useState<'form' | 'approving' | 'creating'>('form')
  const { toast } = useToast()

  const handleCreateBounty = async () => {
    if (!title.trim() || !rewardToken || !rewardAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    const selectedToken = REWARD_TOKENS.find(token => token.address === rewardToken)
    if (!selectedToken) {
      toast({
        title: "Invalid Token",
        description: "Please select a valid reward token.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreating(true)
      setCurrentStep('approving')

      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask to continue.')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Convert amount to proper decimals
      const amountInWei = ethers.parseUnits(rewardAmount, selectedToken.decimals)

      toast({
        title: "Step 1: Approval Required",
        description: "Please approve the escrow contract to spend your tokens.",
      })

      // Step 1: Approve the escrow contract to spend tokens
      // TODO: Replace with actual EncryptedERC contract address and ABI
      const encryptedTokenAddress = process.env.NEXT_PUBLIC_ENCRYPTED_TOKEN_ADDRESS || '0x...'
      const bountyEscrowAddress = process.env.NEXT_PUBLIC_BOUNTY_ESCROW_ADDRESS || '0x...'
      
      // Mock approval transaction for now
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setCurrentStep('creating')
      
      toast({
        title: "Step 2: Creating Bounty",
        description: "Please confirm the bounty creation transaction.",
      })

      // Step 2: Create the bounty
      // TODO: Replace with actual BountyEscrow contract interaction
      await new Promise(resolve => setTimeout(resolve, 3000))

      toast({
        title: "Bounty Created Successfully!",
        description: `Your bounty "${title}" has been created with ${rewardAmount} ${selectedToken.symbol} locked in escrow.`,
      })

      // Reset form
      setTitle('')
      setRewardToken('')
      setRewardAmount('')
      
    } catch (error) {
      console.error('Error creating bounty:', error)
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create bounty. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
      setCurrentStep('form')
    }
  }

  const getStepMessage = () => {
    switch (currentStep) {
      case 'approving':
        return 'Waiting for token approval...'
      case 'creating':
        return 'Creating bounty and locking funds...'
      default:
        return ''
    }
  }

  const selectedTokenInfo = REWARD_TOKENS.find(token => token.address === rewardToken)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <Card className="glass-card aurora-glow border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Plus className="h-8 w-8 text-accent" />
            Create Intelligence Bounty
          </CardTitle>
          <CardDescription>
            Post a bounty for specific information. Funds will be locked in escrow until you approve a submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Trustless Escrow</AlertTitle>
            <AlertDescription>
              Your funds will be locked in a smart contract escrow. They can only be released when you approve a submission,
              ensuring whistleblowers are guaranteed payment for accepted information.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Bounty Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Corporate Tax Evasion Evidence"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/50 border-accent/20 focus:border-accent"
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                Be specific about what information you're seeking.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rewardToken">Reward Token *</Label>
              <Select value={rewardToken} onValueChange={setRewardToken} disabled={isCreating}>
                <SelectTrigger className="bg-background/50 border-accent/20 focus:border-accent">
                  <SelectValue placeholder="Select reward token" />
                </SelectTrigger>
                <SelectContent>
                  {REWARD_TOKENS.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {token.symbol}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the token for reward payments. All payments use encrypted tokens for privacy.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rewardAmount">Reward Amount *</Label>
              <div className="relative">
                <Input
                  id="rewardAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1000"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  className="bg-background/50 border-accent/20 focus:border-accent pr-16"
                  disabled={isCreating}
                />
                {selectedTokenInfo && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    {selectedTokenInfo.symbol}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                This amount will be locked in escrow until you approve a submission.
              </p>
            </div>
          </div>

          {selectedTokenInfo && rewardAmount && (
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <h4 className="font-semibold mb-2 text-accent">Bounty Summary</h4>
              <div className="space-y-1 text-sm">
                <div>Title: <span className="font-medium">{title || 'Untitled Bounty'}</span></div>
                <div>Reward: <span className="font-bold text-accent">{rewardAmount} {selectedTokenInfo.symbol}</span></div>
                <div>Status: <span className="text-orange-400">Will be locked in escrow</span></div>
              </div>
            </div>
          )}

          {isCreating && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Creating Bounty</AlertTitle>
              <AlertDescription>
                {getStepMessage()}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Two-Step Process</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li><strong>Approval:</strong> First, approve the escrow contract to spend your tokens</li>
              <li><strong>Creation:</strong> Then, create the bounty and lock the funds in escrow</li>
              <li><strong>Review:</strong> Whistleblowers can submit claims with encrypted evidence</li>
              <li><strong>Payment:</strong> You review and approve claims to release payments automatically</li>
            </ol>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleCreateBounty}
              disabled={isCreating || !title.trim() || !rewardToken || !rewardAmount}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating Bounty...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Create & Lock Funds
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
