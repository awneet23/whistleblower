'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, Lock, Send, AlertCircle, Loader2, Shield, Check } from 'lucide-react'
import * as openpgp from 'openpgp'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { useWallet } from '@/context/WalletContext'
import { Bounty } from '../app/types/bounty';
import { useMetaMask } from '@/app/hooks/useMetamask'
import { getContractInstance } from '@/app/utils/getContract'
import { MainContractABI, MainContractAddress } from '@/app/abis/MainContract'
import { avalancheFuji } from 'viem/chains'
interface Organization {
  organizationName: string
  organizationAddress: string
  pgpPublicKey: string
  registeredAt: number
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
  const [orgDataError, setOrgDataError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState<'form' | 'encrypting' | 'uploading' | 'submitting'>('form')
  const { toast } = useToast()
  const [contract, setContract] = useState<any | undefined>();

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

      // Step 1: Encrypt the full message with organization's PGP key (mandatory)
      const publicKey = await openpgp.readKey({ armoredKey: bounty.newsOrganizationPublicKey })
      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: fullMessage }),
        encryptionKeys: publicKey
      })

      setCurrentStep('uploading')
      if (contract) {
        const txHash = await contract.write.submitBounty(
          [bounty.bountyId, account, encrypted],
          {
            account,
          }
        )
        console.log('Submit Bounty Transaction Hash:', txHash)
      }

      toast({
        title: "Claim Submitted Successfully!",
        description: `Your claim for bounty #${bounty.bountyId} has been submitted securely. The organization will review it soon.`,
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
      setOrgDataError(null)
      setCurrentStep('form')
      onClose()
    }
  }

  const getStepMessage = () => {
    switch (currentStep) {
      case 'encrypting':
        return 'Encrypting your message with PGP...'
      case 'uploading':
        return 'Uploading encrypted data to IPFS...'
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
            Submit Claim for Bounty #{bounty.bountyId}
          </DialogTitle>
          <DialogDescription>
            Submit your claim for "{bounty.topic}". Your message will be automatically encrypted with the organization's PGP key.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Status Alert */}
          {(
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-200">🔒 Secure Encryption Ready</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your message will be securely encrypted with the public key for <strong>{bounty.orgName}</strong>.
                Only they can decrypt and read your submission.
              </AlertDescription>
            </Alert>
          )}

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
                placeholder="Your complete, detailed information (this will be automatically encrypted)"
                value={fullMessage}
                onChange={(e) => setFullMessage(e.target.value)}
                className="min-h-[120px] bg-background/50 border-accent/20 focus:border-accent"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Include all relevant details, evidence, and context. This will be automatically encrypted with PGP before storage.
              </p>
            </div>
          </div>

          {isSubmitting && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Processing Secure Submission</AlertTitle>
              <AlertDescription>
                {getStepMessage()}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <h4 className="font-semibold mb-2 text-accent">Reward Information</h4>
            <div className="space-y-1 text-sm">
              <div>Amount: <span className="font-bold text-accent">{bounty.bountyAmount} pUSDC</span></div>
              <div>Status: <span className="text-green-400">Locked in Escrow</span></div>
              <div>Organization: <span className="font-mono">{bounty.orgName.slice(0, 10)}...{bounty.orgName.slice(-8)}</span></div>
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
                      Submitting Securely...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Submit Encrypted Claim
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
