'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Coins, Plus, Clock, Building2, AlertCircle, RefreshCw } from 'lucide-react'
import { ethers } from 'ethers'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import SubmitClaimModal from '@/components/SubmitClaimModal'
import { SUPPORTED_TOKENS } from '@/lib/tokens'

interface Bounty {
  id: string | number
  title: string
  summary?: string
  organization: string
  organizationAddress: string
  rewardTokenContract?: string
  rewardToken?: string
  rewardAmount: string
  isOpen: boolean
  createdAt: number
  source: 'api' | 'contract' | 'mock'
}

// Mock bounties for initial visual appeal
const MOCK_BOUNTIES: Bounty[] = [
  {
    id: 'mock_1',
    title: 'Corporate Tax Evasion Evidence',
    summary: 'Looking for documentation of tax avoidance schemes by major corporations.',
    organization: '0x742d35Cc6634C0532925a3b8D4C8c8C8b4c8',
    organizationAddress: '0x742d35Cc6634C0532925a3b8D4C8c8C8b4c8',
    rewardToken: process.env.NEXT_PUBLIC_TEST_TOKEN_ADDRESS || '',
    rewardAmount: '5000',
    isOpen: true,
    createdAt: Date.now() - 86400000, // 1 day ago
    source: 'mock'
  },
  {
    id: 'mock_2',
    title: 'Government Contract Fraud',
    summary: 'Seeking evidence of fraudulent government contracts or bid rigging.',
    organization: '0x8ba1f109551bD432803012645Hac136c22C8C8b4',
    organizationAddress: '0x8ba1f109551bD432803012645Hac136c22C8C8b4',
    rewardToken: process.env.NEXT_PUBLIC_TEST_TOKEN_ADDRESS || '',
    rewardAmount: '10000',
    isOpen: true,
    createdAt: Date.now() - 172800000, // 2 days ago
    source: 'mock'
  }
]

export default function BountiesPage() {
  const [bounties, setBounties] = useState<Bounty[]>(MOCK_BOUNTIES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  useEffect(() => {
    fetchBounties()
  }, [])

  const fetchBounties = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch bounties from our backend API
      const response = await fetch('/api/bounties')
      const result = await response.json()
      
      let apiBounties: Bounty[] = []
      if (result.success && result.bounties) {
        apiBounties = result.bounties.map((bounty: any) => ({
          ...bounty,
          organization: bounty.organizationAddress,
          organizationAddress: bounty.organizationAddress,
          rewardTokenContract: bounty.rewardToken,
          source: 'api' as const
        }))
      }

      // Optionally fetch from contract as well (for bounties created directly on-chain)
      let contractBounties: Bounty[] = []
      try {
        const bountyEscrowAddress = process.env.NEXT_PUBLIC_BOUNTY_ESCROW_ADDRESS
        if (bountyEscrowAddress) {
          const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
          const bountyEscrowContract = new ethers.Contract(
            bountyEscrowAddress,
            [
              'function bountyCounter() view returns (uint256)',
              'function bounties(uint256) view returns (uint256 id, string title, address organization, address rewardTokenContract, uint256 rewardAmount, bool isOpen, uint256 createdAt)'
            ],
            provider
          )

          const bountyCount = await bountyEscrowContract.bountyCounter()
          
          for (let i = 1; i <= Number(bountyCount); i++) {
            try {
              const bountyData = await bountyEscrowContract.bounties(i)
              contractBounties.push({
                id: Number(bountyData.id),
                title: bountyData.title,
                organization: bountyData.organization,
                organizationAddress: bountyData.organization,
                rewardTokenContract: bountyData.rewardTokenContract,
                rewardAmount: bountyData.rewardAmount.toString(),
                isOpen: bountyData.isOpen,
                createdAt: Number(bountyData.createdAt) * 1000, // Convert to milliseconds
                source: 'contract'
              })
            } catch (error) {
              console.error(`Error fetching contract bounty ${i}:`, error)
            }
          }
        }
      } catch (contractError) {
        console.error('Error fetching contract bounties:', contractError)
        // Don't fail the whole operation if contract fetch fails
      }

      // Combine all bounties: API bounties first (newest), then contract bounties, then mock bounties
      const allBounties = [
        ...apiBounties.reverse(), // Newest API bounties first
        ...contractBounties.reverse(), // Then contract bounties
        ...MOCK_BOUNTIES // Finally mock bounties for visual appeal
      ]

      // Remove duplicates with improved detection logic
      const uniqueBounties = allBounties
        .filter((bounty, index, self) => {
          // For API bounties, keep them as priority
          if (bounty.source === 'api') return true
          
          // For contract and mock bounties, check if there's already an API bounty with same title and org
          const hasApiVersion = self.some(b => 
            b.source === 'api' && 
            b.title.toLowerCase().trim() === bounty.title.toLowerCase().trim() && 
            b.organization.toLowerCase() === bounty.organization.toLowerCase()
          )
          
          // If there's an API version, skip this contract/mock bounty
          if (hasApiVersion) return false
          
          // Otherwise, use the original duplicate detection
          return index === self.findIndex(b => 
            b.title.toLowerCase().trim() === bounty.title.toLowerCase().trim() && 
            b.organization.toLowerCase() === bounty.organization.toLowerCase()
          )
        })
        .sort((a, b) => b.createdAt - a.createdAt)

      setBounties(uniqueBounties)
    } catch (err) {
      console.error('Error fetching bounties:', err)
      setError(err instanceof Error ? err.message : 'Failed to load bounties')
      // Keep mock bounties on error
      setBounties(MOCK_BOUNTIES)
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const getRewardTokenSymbol = (bounty: Bounty) => {
    const tokenAddress = bounty.rewardTokenContract || bounty.rewardToken
    if (!tokenAddress) return 'Tokens'
    
    const token = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase())
    return token ? token.symbol : 'Tokens'
  }

  const formatRewardAmount = (bounty: Bounty) => {
    const tokenAddress = bounty.rewardTokenContract || bounty.rewardToken
    if (!tokenAddress) return bounty.rewardAmount
    
    const token = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase())
    if (!token) return bounty.rewardAmount
    
    try {
      return ethers.formatUnits(bounty.rewardAmount, token.decimals)
    } catch {
      return bounty.rewardAmount
    }
  }

  const handleSubmitClaim = (bounty: Bounty) => {
    setSelectedBounty(bounty)
    setShowSubmitModal(true)
  }

  const getBountySourceBadge = (source: string) => {
    switch (source) {
      case 'api':
        return <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs">New</Badge>
      case 'contract':
        return <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">On-Chain</Badge>
      case 'mock':
        return <Badge variant="outline" className="border-gray-500/50 text-gray-400 text-xs">Featured</Badge>
      default:
        return null
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <Card className="glass-card aurora-glow border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-8 w-8 text-accent" />
            Intelligence Bounties
          </CardTitle>
          <CardDescription>
            Trustless bounty system where news organizations post rewards for specific information.
            Funds are locked in escrow until approved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>How It Works</AlertTitle>
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>News organizations create bounties and lock funds in escrow</li>
                <li>Whistleblowers submit encrypted claims with public teasers</li>
                <li>Organizations review claims and release payments automatically</li>
                <li>All transactions are trustless and transparent on-chain</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${bounties.length} active bounties`}
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={fetchBounties}
                disabled={loading}
                variant="outline"
                size="sm"
                className="border-accent/50 hover:border-accent hover:bg-accent/10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </motion.div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && bounties.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Active Bounties</AlertTitle>
              <AlertDescription>
                No bounties are currently available. Check back later or encourage news organizations to create bounties.
              </AlertDescription>
            </Alert>
          )}

          {bounties.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bounties.map((bounty, index) => (
                <motion.div
                  key={`${bounty.source}_${bounty.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="glass-card border-accent/10 hover:border-accent/30 transition-all duration-300 h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-accent/20 text-accent">
                            #{bounty.id}
                          </Badge>
                          {getBountySourceBadge(bounty.source)}
                        </div>
                        <Badge variant="outline" className="border-green-500/50 text-green-400">
                          Open
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {bounty.title}
                      </CardTitle>
                      {bounty.summary && (
                        <CardDescription className="text-sm line-clamp-2">
                          {bounty.summary}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>Organization: {formatAddress(bounty.organization)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Posted {formatTimeAgo(bounty.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">
                            {formatRewardAmount(bounty)} {getRewardTokenSymbol(bounty)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Locked in Escrow
                          </div>
                        </div>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          onClick={() => handleSubmitClaim(bounty)}
                          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Submit Claim
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Claim Modal */}
      {selectedBounty && (
        <SubmitClaimModal
          bounty={selectedBounty}
          isOpen={showSubmitModal}
          onClose={() => {
            setShowSubmitModal(false)
            setSelectedBounty(null)
          }}
          onSuccess={() => {
            setShowSubmitModal(false)
            setSelectedBounty(null)
            fetchBounties() // Refresh bounties after successful submission
          }}
        />
      )}
    </motion.div>
  )
}
