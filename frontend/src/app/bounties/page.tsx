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

import { avalancheFuji } from 'viem/chains'

import { getContractInstance } from '../utils/getContract';
import { MainContractAddress } from '../consts'
import { MainContractABI } from '../abis/NewsOrganization'
import { useMetaMask } from '../hooks/useMetamask'
import { toast } from '@/components/ui/use-toast'
import { Bounty } from '../types/bounty'

export default function BountiesPage() {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const { account, isConnected, chainId, getNetworkName } = useMetaMask();
  const [contract, setContract] = useState<any | undefined>();

  useEffect(() => {
    if (isConnected) {
      connectMainContract();
    }
  }, [isConnected])

  async function connectMainContract() {
    try {
      const { contract: contractInstance } = await getContractInstance(
        MainContractAddress,
        MainContractABI,
        avalancheFuji,
      )
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

  useEffect(() => {
    fetchBounties()
  }, [contract])

  const fetchBounties = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (contract) {
        const bounties = await contract.read.getAllBountiesFromAllOrganizations([])
        setBounties(bounties);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bounties')
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    if (!address || typeof address !== 'string') {
      return 'Unknown Address'
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleSubmitClaim = (bounty: Bounty) => {
    setSelectedBounty(bounty)
    setShowSubmitModal(true)
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
                  key={`${bounty.newsOrganizationId}_${bounty.bountyId}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="glass-card border-accent/10 hover:border-accent/30 transition-all duration-300 h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-accent/20 text-accent">
                            #{`${bounty.newsOrganizationId}_${bounty.bountyId}`}
                          </Badge>
                        </div>
                        {
                          bounty.hasAcceptedSubmission
                          ?
                          <Badge variant="outline" className="border-red-500/50 text-red-400">
                            Closed
                          </Badge>
                          :
                          <Badge variant="outline" className="border-green-500/50 text-green-400">
                            Open
                          </Badge>
                        }
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {bounty.topic}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {bounty.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>Organization: {bounty.orgName}</span>
                        </div>
                      </div>
                      
                      <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">
                            {`${bounty.bountyAmount} USD`}
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
