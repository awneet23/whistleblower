'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Lock, AlertCircle, Loader2, DollarSign } from 'lucide-react'
import { ethers } from 'ethers'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { SUPPORTED_TOKENS, Token } from '@/lib/tokens'
import { useWallet } from '@/context/WalletContext'
import { useRouter } from 'next/navigation'
import { useMetaMask } from '../hooks/useMetamask'
import { avalancheFuji } from 'viem/chains'
import { MainContractAddress, MainContractABI } from '../abis/MainContract'
import { getContractInstance } from '../utils/getContract'

export default function CreateBountyPage() {
  const [contract, setContract] = useState<any | undefined>();
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [rewardToken, setRewardToken] = useState('')
  const [rewardAmount, setRewardAmount] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [currentStep, setCurrentStep] = useState<'form' | 'approving' | 'creating' | 'saving'>('form')
  const { toast } = useToast()
  const router = useRouter()
  
  const { account, isConnected, chainId, getNetworkName } = useMetaMask();
  useEffect(() => {
    connectMainContract();
  }, [isConnected])

  async function connectMainContract() {
    try {
      const { contract: contractInstance } = await getContractInstance(
        MainContractAddress,
        MainContractABI,
        avalancheFuji,
      );
      setContract(contractInstance);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast({
        variant: "destructive",
        title: "Couldn't connect to contract",
        description: errorMessage,
      })
    }
  }

  // Show connection/registration status without redirecting
  if (!isConnected) {
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
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Wallet Not Connected</AlertTitle>
              <AlertDescription>
                Please connect your wallet to create bounties.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const handleCreateBounty = async () => {
    if (!title.trim() || !summary.trim() || !rewardToken || !rewardAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a bounty.",
        variant: "destructive",
      })
      return
    }

    const selectedToken = SUPPORTED_TOKENS.find((token: Token) => token.address === rewardToken)
    if (!selectedToken) {
      toast({ title: "Invalid Token", variant: "destructive" })
      return
    }

    try {
      setIsCreating(true)
      
      // Save bounty to backend API (simplified flow)
      setCurrentStep('saving')
      toast({ title: "Publishing Bounty", description: "Saving bounty details to the public board..." })

      if (contract) {
        const txHash = await contract.write.createBounty(
          [title, summary, rewardAmount],
          {
            account,
          }
        )
        console.log('Create Bounty Transaction Hash:', txHash)
      }

      toast({
        title: "Bounty Published!",
        description: `Your bounty "${title}" has been created and published successfully.`,
      })

      // Reset form and redirect to bounties page
      setTitle('')
      setSummary('')
      setRewardToken('')
      setRewardAmount('')
      setCurrentStep('form')
      
      // Small delay to ensure toast is visible and state is reset
      setTimeout(() => {
        router.push('/bounties')
      }, 1000)
    } catch (error: any) {
      console.error('Error creating bounty:', error)
      toast({
        title: "Creation Failed",
        description: error.reason || error.message || "Failed to create bounty. Please try again.",
        variant: "destructive",
      })
      setCurrentStep('form')
    } finally {
      setIsCreating(false)
    }
  }

  const getStepMessage = () => {
    switch (currentStep) {
      case 'saving':
        return 'Publishing bounty to the public board...'
      default:
        return ''
    }
  }

  const selectedTokenInfo = SUPPORTED_TOKENS.find((token: Token) => token.address === rewardToken)

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
              <Label htmlFor="summary">Bounty Description *</Label>
              <Textarea
                id="summary"
                placeholder="Describe the specific information you're looking for, what evidence would be valuable, and any relevant context..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="bg-background/50 border-accent/20 focus:border-accent min-h-[100px]"
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                Provide detailed information about what you're seeking to help whistleblowers understand your requirements.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rewardToken">Reward Token *</Label>
              <Select value={rewardToken} onValueChange={setRewardToken} disabled={isCreating}>
                <SelectTrigger className="bg-background/50 border-accent/20 focus:border-accent">
                  <SelectValue placeholder="Select reward token" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_TOKENS.filter(token => token.address && token.address !== '').map((token: Token) => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.symbol} - {token.address.slice(0, 6)}...{token.address.slice(-4)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the token for reward payments.
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

          {selectedTokenInfo && rewardAmount && title && (
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
            <h4 className="font-semibold mb-2">Single-Step Process</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li><strong>Publishing:</strong> Create the bounty and publish the details to the public board</li>
              <li><strong>Review:</strong> Whistleblowers can submit claims with encrypted evidence</li>
              <li><strong>Payment:</strong> You review and approve claims to release payments automatically</li>
            </ol>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleCreateBounty} 
              disabled={isCreating || !title.trim() || !summary.trim() || !rewardToken || !rewardAmount}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentStep === 'saving' ? 'Publishing...' : 'Creating Bounty...'}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Bounty
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
