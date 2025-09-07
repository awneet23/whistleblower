'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Key, Users, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'

interface Organization {
  organizationName: string
  organizationAddress: string
  pgpPublicKey: string
  registeredAt: number
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [copiedKeys, setCopiedKeys] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/get-all-orgs')
      
      if (!response.ok) {
        throw new Error('Failed to fetch organizations')
      }

      const data = await response.json()
      setOrganizations(data.organizations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (address: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(address)) {
      newExpanded.delete(address)
    } else {
      newExpanded.add(address)
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
            {organizations.length} Verified Organizations
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Key className="h-3 w-3" />
            PGP Encrypted Communications
          </Badge>
        </motion.div>
      </div>

      {/* Organizations List */}
      {organizations.length === 0 ? (
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
          {organizations.map((org, index) => (
            <motion.div
              key={org.organizationAddress}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card border-accent/20 hover:border-accent/40 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-accent" />
                      {org.organizationName}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Verified
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    <div className="space-y-1">
                      <div className="font-mono text-xs">
                        {org.organizationAddress.slice(0, 10)}...{org.organizationAddress.slice(-8)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Registered: {new Date(org.registeredAt).toLocaleDateString()}
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
                          onClick={() => copyPGPKey(org.pgpPublicKey, org.organizationName)}
                          className="h-8 px-2"
                        >
                          {copiedKeys.has(org.organizationName) ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpanded(org.organizationAddress)}
                          className="h-8 px-2"
                        >
                          {expandedCards.has(org.organizationAddress) ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {expandedCards.has(org.organizationAddress) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-muted/50 rounded-md p-3 border"
                      >
                        <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                          {org.pgpPublicKey}
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
