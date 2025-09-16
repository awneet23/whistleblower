'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, RefreshCw, FileText, Info, AlertCircle, Database, Download, Coins, Plus, Eye, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { ethers } from 'ethers'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useWallet } from '@/context/WalletContext'
import { SUPPORTED_TOKENS } from '@/lib/tokens'
import type { Bounty, Claim } from '@/types'
import { useMetaMask } from '../hooks/useMetamask'

export default function DashboardPage() {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [bountiesLoading, setBountiesLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingClaim, setProcessingClaim] = useState<number | null>(null)
  const { toast } = useToast()
  const { account, isConnected, chainId, getNetworkName } = useMetaMask();

  const fetchMyBounties = useCallback(async () => {
    if (!isConnected || !account) return

    try {
      setBountiesLoading(true)
      setError('')

      const bountyEscrowAddress = process.env.NEXT_PUBLIC_BOUNTY_ESCROW_ADDRESS
      if (!bountyEscrowAddress) {
        throw new Error('Bounty escrow contract address not configured')
      }

      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
      const bountyEscrowContract = new ethers.Contract(
        bountyEscrowAddress,
        [
          'function bountyCounter() view returns (uint256)',
          'function claimCounter() view returns (uint256)',
          'function bounties(uint256) view returns (uint256 id, string title, address organization, address rewardTokenContract, uint256 rewardAmount, bool isOpen, uint256 createdAt)',
          'function claims(uint256) view returns (uint256 id, uint256 bountyId, address whistleblower, string teaser, string encryptedDataCid, uint8 status, uint256 submittedAt)'
        ],
        provider
      )

      const bountyCount = await bountyEscrowContract.bountyCounter()
      const fetchedBounties: Bounty[] = []
      for (let i = 1; i <= Number(bountyCount); i++) {
        try {
          const bountyData = await bountyEscrowContract.bounties(i)
          if (bountyData.organization.toLowerCase() === account.toLowerCase()) {
            fetchedBounties.push({
              id: Number(bountyData.id),
              title: bountyData.title,
              organization: bountyData.organization,
              rewardTokenContract: bountyData.rewardTokenContract,
              rewardAmount: bountyData.rewardAmount.toString(),
              isOpen: bountyData.isOpen,
              createdAt: Number(bountyData.createdAt)
            })
          }
        } catch (error) {
          console.error(`Error fetching bounty ${i}:`, error)
        }
      }

      const claimCount = await bountyEscrowContract.claimCounter()
      const fetchedClaims: Claim[] = []
      const myBountyIds = new Set(fetchedBounties.map(b => b.id))

      for (let i = 1; i <= Number(claimCount); i++) {
        try {
          const claimData = await bountyEscrowContract.claims(i)
          if (myBountyIds.has(Number(claimData.bountyId))) {
            fetchedClaims.push({
              id: Number(claimData.id),
              bountyId: Number(claimData.bountyId),
              whistleblower: claimData.whistleblower,
              teaser: claimData.teaser,
              encryptedDataCid: claimData.encryptedDataCid,
              status: Number(claimData.status),
              submittedAt: Number(claimData.submittedAt)
            })
          }
        } catch (error) {
          console.error(`Error fetching claim ${i}:`, error)
        }
      }
      
      setBounties(fetchedBounties.reverse())
      setClaims(fetchedClaims.reverse())
    } catch (err) {
      console.error('Error fetching bounties:', err)
      setError(err instanceof Error ? err.message : 'Failed to load your bounties and claims.')
    } finally {
      setBountiesLoading(false)
    }
  }, [account, isConnected])

  useEffect(() => {
    if (isConnected) {
      fetchMyBounties()
    }
  }, [isConnected, fetchMyBounties])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp * 1000 // Convert seconds to milliseconds
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const getRewardToken = (bounty: Bounty) => {
    const token = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === bounty.rewardTokenContract.toLowerCase())
    if (!token) return { symbol: 'N/A', decimals: 18 }
    return token
  }

  const handleReleaseReward = async (claimId: number) => {
    if (!account) {
      toast({ title: "Wallet not connected", variant: "destructive" })
      return
    }

    try {
      setProcessingClaim(claimId)
      toast({ title: "Processing Reward...", description: "Please confirm the transaction in your wallet." })

      const bountyEscrowAddress = process.env.NEXT_PUBLIC_BOUNTY_ESCROW_ADDRESS
      // const bountyEscrowContract = new ethers.Contract(
      //   bountyEscrowAddress!,
      //   ['function releaseReward(uint256 claimId) external'],
      //   account
      // )

      // const tx = await bountyEscrowContract.releaseReward(claimId)
      // await tx.wait()

      toast({ title: "Reward Released!", description: "The reward has been transferred to the whistleblower." })
      fetchMyBounties() // Refresh data
    } catch (error: any) {
      console.error('Error releasing reward:', error)
      toast({
        title: "Release Failed",
        description: error.reason || error.message || "Failed to release reward. Please try again.",
        variant: "destructive"
      })
    } finally {
      setProcessingClaim(null)
    }
  }

  const handleRejectClaim = async (claimId: number) => {
    if (!account) {
      toast({ title: "Wallet not connected", variant: "destructive" })
      return
    }

    try {
      setProcessingClaim(claimId)
      toast({ title: "Rejecting Claim...", description: "Please confirm the transaction in your wallet." })

      const bountyEscrowAddress = process.env.NEXT_PUBLIC_BOUNTY_ESCROW_ADDRESS
      // const bountyEscrowContract = new ethers.Contract(
      //   bountyEscrowAddress!,
      //   ['function rejectClaim(uint256 claimId) external'],
      //   account
      // )

      // const tx = await bountyEscrowContract.rejectClaim(claimId)
      // await tx.wait()

      toast({ title: "Claim Rejected", description: "The claim has been successfully rejected." })
      fetchMyBounties() // Refresh data
    } catch (error: any) {
      console.error('Error rejecting claim:', error)
      toast({
        title: "Rejection Failed",
        description: error.reason || error.message || "Failed to reject claim. Please try again.",
        variant: "destructive"
      })
    } finally {
      setProcessingClaim(null)
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="border-yellow-500 text-yellow-400"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 1:
        return <Badge variant="outline" className="border-green-500 text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 2:
        return <Badge variant="outline" className="border-red-500 text-red-400"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="glass-card aurora-glow border-accent/20">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Wallet Not Connected</AlertTitle>
              <AlertDescription>Please connect your wallet to view your dashboard.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendingClaims = claims.filter(claim => claim.status === 0)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* My Bounties Section */}
      <Card className="glass-card aurora-glow border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-8 w-8 text-accent" />
            My Bounties
          </CardTitle>
          <CardDescription>
            Manage your posted bounties and review submissions from whistleblowers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {bountiesLoading ? 'Loading...' : `${bounties.length} bounties • ${pendingClaims.length} pending claims`}
            </div>
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={fetchMyBounties}
                  disabled={bountiesLoading}
                  variant="outline"
                  size="sm"
                  className="border-accent/50 hover:border-accent hover:bg-accent/10"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${bountiesLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  asChild
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <a href="/create-bounty">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bounty
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>

          {bountiesLoading && (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          )}

          {!bountiesLoading && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Bounties</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!bountiesLoading && !error && bounties.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Bounties Created</AlertTitle>
              <AlertDescription>
                You haven't created any bounties yet. Create your first bounty to start receiving submissions.
              </AlertDescription>
            </Alert>
          )}

          {!bountiesLoading && !error && bounties.length > 0 && (
            <div className="space-y-4">
              {bounties.map((bounty) => {
                const bountyClaims = claims.filter(claim => claim.bountyId === bounty.id)
                const pendingBountyClaims = bountyClaims.filter(claim => claim.status === 0)
                const rewardToken = getRewardToken(bounty)
                
                return (
                  <motion.div
                    key={bounty.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="glass-card border-accent/10">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{bounty.title}</CardTitle>
                            <CardDescription className="mt-1">
                              Created {formatTimeAgo(bounty.createdAt)} • {ethers.formatUnits(bounty.rewardAmount, rewardToken.decimals)} {rewardToken.symbol} reward
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={bounty.isOpen ? "outline" : "secondary"} 
                                   className={bounty.isOpen ? "border-green-500 text-green-400" : "border-gray-500 text-gray-400"}>
                              {bounty.isOpen ? "Open" : "Closed"}
                            </Badge>
                            <Badge variant="outline" className="border-accent/50 text-accent">
                              #{bounty.id}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {bountyClaims.length === 0 ? (
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>No Claims Yet</AlertTitle>
                            <AlertDescription>
                              No whistleblowers have submitted claims for this bounty yet.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-muted-foreground">
                              {bountyClaims.length} claim{bountyClaims.length !== 1 ? 's' : ''} submitted
                              {pendingBountyClaims.length > 0 && ` • ${pendingBountyClaims.length} pending review`}
                            </div>
                            <div className="space-y-2">
                              {bountyClaims.map((claim) => (
                                <div key={claim.id} className="bg-background/30 rounded-lg p-4 border border-accent/10">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">Claim #{claim.id}</span>
                                      {getStatusBadge(claim.status)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatTimeAgo(claim.submittedAt)}
                                    </div>
                                  </div>
                                  <div className="text-sm text-muted-foreground mb-2">
                                    From: {formatAddress(claim.whistleblower)}
                                  </div>
                                  <div className="text-sm mb-3">
                                    <strong>Teaser:</strong> {claim.teaser}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Button
                                      asChild
                                      size="sm"
                                      variant="outline"
                                      className="border-accent/50 hover:border-accent hover:bg-accent/10"
                                    >
                                      <a 
                                        href={`https://ipfs.io/ipfs/${claim.encryptedDataCid}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Full Data
                                      </a>
                                    </Button>
                                    {claim.status === 0 && (
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => handleRejectClaim(claim.id)}
                                          disabled={processingClaim !== null}
                                          size="sm"
                                          variant="outline"
                                          className="border-red-500/50 hover:border-red-500 hover:bg-red-500/10 text-red-400"
                                        >
                                          {processingClaim === claim.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <XCircle className="h-4 w-4 mr-2" />
                                          )}
                                          Reject
                                        </Button>
                                        <Button
                                          onClick={() => handleReleaseReward(claim.id)}
                                          disabled={processingClaim !== null}
                                          size="sm"
                                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                        >
                                          {processingClaim === claim.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                          ) : (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                          )}
                                          Release Reward
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
