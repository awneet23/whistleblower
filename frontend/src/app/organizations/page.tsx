'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Key, Users, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'

import { avalancheFuji } from 'viem/chains'

import { getContractInstance } from '../utils/getContract';
import { MainContractABI, MainContractAddress } from '../abis/MainContract'
import { useMetaMask } from '../hooks/useMetamask'

interface Organization {
  name: string,
  pubKey: string,
  orgOwner: string,
  bountyList: string[]
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [copiedKeys, setCopiedKeys] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const [contract, setContract] = useState<any | undefined>();
  const { account, isConnected, chainId, getNetworkName } = useMetaMask();
  const [orgs, setOrgs] = useState<Organization[]>([])

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
    fetchAllOrgs()
  }, [contract])

  async function fetchAllOrgs() {
    if (contract) {
      const orgs = await contract.read.getAllNewsOrganizations([])
      setOrgs(orgs);
      setLoading(false);
    }
  }

  const refresh = () => {
    fetchAllOrgs()
  }

  const toggleExpanded = (key: number) => {
    const keyString = key.toString();
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(keyString)) {
      newExpanded.delete(keyString)
    } else {
      newExpanded.add(keyString)
    }
    setExpandedCards(newExpanded)
  }

  const copyPGPKey = async (pgpKey: string, orgName: string) => {
    try {
      await navigator.clipboard.writeText(pgpKey)
      setCopiedKeys(prev => new Set(prev).add(orgName))
      
      toast({
        title: "PGP Key Copied",
        description: `${orgName}'s PGP key has been copied to clipboard.`,
      })

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedKeys(prev => {
          const newSet = new Set(prev)
          newSet.delete(orgName)
          return newSet
        })
      }, 2000)
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy PGP key to clipboard.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading registered organizations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-accent bg-clip-text text-transparent"
        >
          <Users className="inline-block mr-3 h-8 w-8 text-accent" />
          Registered Organizations
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-3xl mx-auto"
        >
          Verified news organizations and their public PGP keys for secure communication
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-2 mt-4"
        >
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {orgs.length} Verified Organizations
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Key className="h-3 w-3" />
            PGP Encrypted Communications
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="ml-2"
          >
            Refresh
          </Button>
        </motion.div>
      </div>

      {/* Organizations List */}
      {orgs.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Organizations Registered</h3>
          <p className="text-muted-foreground">
            No organizations have registered yet. Check back later or encourage organizations to register.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {orgs.map((org, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card border-accent/20 hover:border-accent/40 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-accent" />
                      {org.name}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Verified
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    <div className="space-y-1">
                      <div className="font-mono text-xs">
                        {org.orgOwner.slice(0, 10)}...{org.orgOwner.slice(-8)}
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-accent" />
                        <span className="font-medium">PGP Public Key</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPGPKey(org.pubKey, org.name)}
                          className="h-8 px-2"
                        >
                          {copiedKeys.has(org.name) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpanded(index)}
                          className="h-8 px-2"
                        >
                          {expandedCards.has(index.toString()) ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {expandedCards.has(index.toString()) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-muted/50 rounded-md p-3 border"
                      >
                        <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                          {org.pubKey}
                        </pre>
                      </motion.div>
                    )}
                    
                    <div className="text-xs text-muted-foreground bg-accent/10 rounded-md p-2 border border-accent/20">
                      <strong>Security Note:</strong> This PGP key is used to encrypt sensitive communications. 
                      Verify the key fingerprint through official channels before use.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
