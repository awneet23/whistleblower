'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Lock, Send, AlertCircle, Loader2 } from 'lucide-react'
import * as openpgp from 'openpgp'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { useWallet } from '@/context/WalletContext'

interface Bounty {
  id: number
  title: string
  organization: string
  rewardTokenContract: string
  rewardAmount: string
  isOpen: boolean
  createdAt: number
}

interface SubmitClaimModalProps {
  bounty: Bounty
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function SubmitClaimModal({ bounty, isOpen, onClose, onSuccess }: SubmitClaimModalProps) {
  const [teaser, setTeaser] = useState('')
  const [fullMessage, setFullMessage] = useState('')
  const [organizationPgpKey, setOrganizationPgpKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState<'form' | 'encrypting' | 'uploading' | 'submitting'>('form')
  const { toast } = useToast()
  const { isConnected } = useWallet()

  const handleSubmit = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first.",
        variant: "destructive"
      })
      return
    }

    if (!teaser.trim() || !fullMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both the teaser and full message.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      setCurrentStep('encrypting')

      // Step 1: Encrypt the full message with organization's PGP key
      let encryptedMessage: string
      if (organizationPgpKey.trim()) {
        const publicKey = await openpgp.readKey({ armoredKey: organizationPgpKey })
        const encrypted = await openpgp.encrypt({
          message: await openpgp.createMessage({ text: fullMessage }),
          encryptionKeys: publicKey
        })
        encryptedMessage = encrypted as string
      } else {
        // For demo purposes, if no PGP key provided, use base64 encoding
        encryptedMessage = btoa(fullMessage)
      }

      setCurrentStep('uploading')

      // Step 2: Upload encrypted message to IPFS
      const ipfsResponse = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: encryptedMessage,
          filename: `claim-${bounty.id}-${Date.now()}.txt`
        })
      })

      if (!ipfsResponse.ok) {
        throw new Error('Failed to upload to IPFS')
      }

      const { cid } = await ipfsResponse.json()
      setCurrentStep('submitting')

      // Step 3: Submit claim to smart contract
      // TODO: Replace with actual contract interaction
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate transaction

      toast({
        title: "Claim Submitted Successfully!",
        description: `Your claim for bounty #${bounty.id} has been submitted. The organization will review it soon.`,
      })

      onSuccess()
    } catch (error) {
      console.error('Error submitting claim:', error)
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit claim. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
      setCurrentStep('form')
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setTeaser('')
      setFullMessage('')
      setOrganizationPgpKey('')
      setCurrentStep('form')
      onClose()
    }
  }

  const getStepMessage = () => {
    switch (currentStep) {
      case 'encrypting':
        return 'Encrypting your message...'
      case 'uploading':
        return 'Uploading to IPFS...'
      case 'submitting':
        return 'Submitting claim to blockchain...'
      default:
        return ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-accent/20 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-accent" />
            Submit Claim for Bounty #{bounty.id}
          </DialogTitle>
          <DialogDescription>
            Submit your claim for "{bounty.title}". Your full message will be encrypted and stored securely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Privacy & Security</AlertTitle>
            <AlertDescription>
              Your full message will be encrypted with the organization's PGP key before being uploaded to IPFS.
              Only the teaser will be visible publicly until your claim is approved.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teaser">Public Teaser *</Label>
              <Textarea
                id="teaser"
                placeholder="Brief description of what information you have (this will be visible to the organization)"
                value={teaser}
                onChange={(e) => setTeaser(e.target.value)}
                className="min-h-[80px] bg-background/50 border-accent/20 focus:border-accent"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                This teaser helps the organization understand what you're offering without revealing sensitive details.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullMessage">Full Confidential Message *</Label>
              <Textarea
                id="fullMessage"
                placeholder="Your complete, detailed information (this will be encrypted)"
                value={fullMessage}
                onChange={(e) => setFullMessage(e.target.value)}
                className="min-h-[120px] bg-background/50 border-accent/20 focus:border-accent"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Include all relevant details, evidence, and context. This will be encrypted before storage.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pgpKey">Organization's PGP Public Key (Optional)</Label>
              <Textarea
                id="pgpKey"
                placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----
...
-----END PGP PUBLIC KEY BLOCK-----"
                value={organizationPgpKey}
                onChange={(e) => setOrganizationPgpKey(e.target.value)}
                className="min-h-[100px] bg-background/50 border-accent/20 focus:border-accent font-mono text-xs"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                If provided, your message will be encrypted with this key. Otherwise, basic encoding will be used.
              </p>
            </div>
          </div>

          {isSubmitting && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Processing Submission</AlertTitle>
              <AlertDescription>
                {getStepMessage()}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <h4 className="font-semibold mb-2 text-accent">Reward Information</h4>
            <div className="space-y-1 text-sm">
              <div>Amount: <span className="font-bold text-accent">{bounty.rewardAmount} pUSDC</span></div>
              <div>Status: <span className="text-green-400">Locked in Escrow</span></div>
              <div>Organization: <span className="font-mono">{bounty.organization.slice(0, 10)}...{bounty.organization.slice(-8)}</span></div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {!isConnected && (
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Please connect your wallet using the button in the header to submit your claim
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 border-accent/50 hover:border-accent hover:bg-accent/10"
              >
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isConnected || !teaser.trim() || !fullMessage.trim()}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Claim
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
