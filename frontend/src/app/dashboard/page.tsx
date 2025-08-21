'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, RefreshCw, FileText, Info, AlertCircle, Database, Download, Coins, Plus, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

interface Bounty {
  id: number
  title: string
  organization: string
  rewardTokenContract: string
  rewardAmount: string
  isOpen: boolean
  createdAt: number
}

interface Claim {
  id: number
  bountyId: number
  whistleblower: string
  teaser: string
  encryptedDataCid: string
  status: number // 0: Pending, 1: Approved, 2: Rejected
  submittedAt: number
}

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState<string[]>([])
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [bountiesLoading, setBountiesLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingClaim, setProcessingClaim] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubmissions()
    fetchMyBounties()
  }, [])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/submissions')
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions')
      }
      
      const data = await response.json()
      setSubmissions(data.submissions || [])
    } catch (err) {
      console.error('Error fetching submissions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyBounties = async () => {
    try {
      setBountiesLoading(true)
      
      // TODO: Replace with actual contract interaction to get user's bounties
      // For now, using mock data
      const mockBounties: Bounty[] = [
        {
          id: 1,
          title: "Corporate Tax Evasion Evidence",
          organization: "0x1234567890123456789012345678901234567890",
          rewardTokenContract: "0xA0b86a33E6417c7C4C8B7e8e6E6E6E6E6E6E6E6E",
          rewardAmount: "1000",
          isOpen: true,
          createdAt: Date.now() - 86400000
        },
        {
          id: 2,
          title: "Environmental Violations Documentation",
          organization: "0x1234567890123456789012345678901234567890",
          rewardTokenContract: "0xA0b86a33E6417c7C4C8B7e8e6E6E6E6E6E6E6E6E",
          rewardAmount: "2500",
          isOpen: false,
          createdAt: Date.now() - 172800000
        }
      ]

      const mockClaims: Claim[] = [
        {
          id: 1,
          bountyId: 1,
          whistleblower: "0x9876543210987654321098765432109876543210",
          teaser: "I have internal documents showing systematic tax avoidance schemes involving offshore entities.",
          encryptedDataCid: "QmX1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T",
          status: 0,
          submittedAt: Date.now() - 3600000
        },
        {
          id: 2,
          bountyId: 1,
          whistleblower: "0x1111222233334444555566667777888899990000",
          teaser: "Financial records showing unreported income and fraudulent deductions over 3 years.",
          encryptedDataCid: "QmA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W",
          status: 0,
          submittedAt: Date.now() - 7200000
        }
      ]

      setBounties(mockBounties)
      setClaims(mockClaims)
    } catch (err) {
      console.error('Error fetching bounties:', err)
    } finally {
      setBountiesLoading(false)
    }
  }

  const formatCid = (cid: string) => {
    return `${cid.slice(0, 8)}...${cid.slice(-8)}`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const handleReleaseReward = async (claimId: number) => {
    try {
      setProcessingClaim(claimId)
      
      // TODO: Replace with actual contract interaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update claim status locally
      setClaims(prev => prev.map(claim => 
        claim.id === claimId 
          ? { ...claim, status: 1 }
          : claim
      ))
      
      // Update bounty status to closed
      const claim = claims.find(c => c.id === claimId)
      if (claim) {
        setBounties(prev => prev.map(bounty => 
          bounty.id === claim.bountyId 
            ? { ...bounty, isOpen: false }
            : bounty
        ))
      }
      
      toast({
        title: "Reward Released!",
        description: "The reward has been automatically transferred to the whistleblower.",
      })
    } catch (error) {
      console.error('Error releasing reward:', error)
      toast({
        title: "Release Failed",
        description: "Failed to release reward. Please try again.",
        variant: "destructive"
      })
    } finally {
      setProcessingClaim(null)
    }
  }

  const handleRejectClaim = async (claimId: number) => {
    try {
      setProcessingClaim(claimId)
      
      // TODO: Replace with actual contract interaction
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update claim status locally
      setClaims(prev => prev.map(claim => 
        claim.id === claimId 
          ? { ...claim, status: 2 }
          : claim
      ))
      
      toast({
        title: "Claim Rejected",
        description: "The claim has been rejected.",
      })
    } catch (error) {
      console.error('Error rejecting claim:', error)
      toast({
        title: "Rejection Failed",
        description: "Failed to reject claim. Please try again.",
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

  const pendingClaims = claims.filter(claim => claim.status === 0)
  const myBounties = bounties // In real implementation, filter by connected wallet

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
              {bountiesLoading ? 'Loading...' : `${myBounties.length} bounties • ${pendingClaims.length} pending claims`}
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

          {!bountiesLoading && myBounties.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Bounties Created</AlertTitle>
              <AlertDescription>
                You haven't created any bounties yet. Create your first bounty to start receiving submissions.
              </AlertDescription>
            </Alert>
          )}

          {!bountiesLoading && myBounties.length > 0 && (
            <div className="space-y-4">
              {myBounties.map((bounty) => {
                const bountyClaims = claims.filter(claim => claim.bountyId === bounty.id)
                const pendingBountyClaims = bountyClaims.filter(claim => claim.status === 0)
                
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
                              Created {formatTimeAgo(bounty.createdAt)} • {bounty.rewardAmount} pUSDC reward
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
                                          disabled={processingClaim === claim.id}
                                          size="sm"
                                          variant="outline"
                                          className="border-red-500/50 hover:border-red-500 hover:bg-red-500/10 text-red-400"
                                        >
                                          {processingClaim === claim.id ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <XCircle className="h-4 w-4 mr-2" />
                                          )}
                                          Reject
                                        </Button>
                                        <Button
                                          onClick={() => handleReleaseReward(claim.id)}
                                          disabled={processingClaim === claim.id}
                                          size="sm"
                                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                        >
                                          {processingClaim === claim.id ? (
                                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
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

      {/* Anonymous Submissions Section */}
      <Card className="glass-card aurora-glow border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Database className="h-8 w-8 text-accent" />
            Anonymous Submissions Dashboard
          </CardTitle>
          <CardDescription>
            Encrypted submissions from whistleblowers. Download and decrypt using your private PGP key.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>For News Organizations</AlertTitle>
            <AlertDescription>
              These are encrypted submissions from whistleblowers. Click on any IPFS link to download 
              the encrypted file, then decrypt it using your private PGP key.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `Total submissions: ${submissions.length}`}
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={fetchSubmissions}
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

          {!loading && !error && submissions.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Submissions</AlertTitle>
              <AlertDescription>
                No submissions found. When whistleblowers submit encrypted messages, they will appear here.
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && submissions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
            <Card className="glass-card border-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  Encrypted Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submission #</TableHead>
                      <TableHead>IPFS CID</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((cid, index) => (
                      <motion.tr
                        key={cid}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border-b border-accent/10 hover:bg-accent/5"
                      >
                        <TableCell className="font-medium">
                          #{submissions.length - index}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {formatCid(cid)}
                          </code>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="border-accent/50 hover:border-accent hover:bg-accent/10"
                            >
                              <a 
                                href={`https://ipfs.io/ipfs/${cid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                IPFS Gateway
                              </a>
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                            <Button
                              asChild
                              size="sm"
                              className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            >
                              <a 
                                href={`https://gateway.pinata.cloud/ipfs/${cid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Alternative Gateway
                              </a>
                            </Button>
                          </motion.div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
          <Card className="glass-card border-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-accent" />
                How to Decrypt Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click on an IPFS link to download the encrypted file</li>
                <li>Use your private PGP key to decrypt the message</li>
                <li>
                  Command line: <code className="bg-muted px-2 py-1 rounded text-xs">gpg --decrypt filename.txt</code>
                </li>
                <li>Or use a PGP tool like Kleopatra, GPG Suite, or online tools</li>
              </ol>
            </CardContent>
          </Card>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
