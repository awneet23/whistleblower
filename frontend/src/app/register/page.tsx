'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Loader2, CheckCircle, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useWallet } from '@/context/WalletContext'

export default function RegisterPage() {
  const [orgName, setOrgName] = useState('')
  const [pgpKey, setPgpKey] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const { toast } = useToast()
  const { isConnected, walletAddress } = useWallet()

  const registerOrganization = async () => {
    if (!orgName.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter your organization name.",
      })
      return
    }

    if (!pgpKey.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter your public PGP key.",
      })
      return
    }

    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet Required",
        description: "Please connect your wallet first.",
      })
      return
    }

    setIsRegistering(true)

    try {
      const response = await fetch('/api/register-org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgName: orgName.trim(),
          pgpKey: pgpKey.trim(),
          walletAddress: walletAddress,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      toast({
        title: "Registration Successful",
        description: "Your organization has been registered successfully.",
      })

      // Clear form
      setOrgName('')
      setPgpKey('')

    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage,
      })
    } finally {
      setIsRegistering(false)
    }
  }

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
            <Building2 className="h-8 w-8 text-accent" />
            Register News Organization
          </CardTitle>
          <CardDescription>
            Register your news organization to receive encrypted whistleblower submissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Registration Requirements</AlertTitle>
            <AlertDescription>
              To register your news organization, you need a valid PGP key pair and a Web3 wallet. 
              Whistleblowers will use your public key to encrypt their submissions.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label htmlFor="orgName" className="text-sm font-medium">
              Organization Name
            </label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g., The Daily News, Investigative Journalism Network"
              disabled={isRegistering}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pgpKey" className="text-sm font-medium">
              Public PGP Key
            </label>
            <Textarea
              id="pgpKey"
              value={pgpKey}
              onChange={(e) => setPgpKey(e.target.value)}
              placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----
...
-----END PGP PUBLIC KEY BLOCK-----"
              disabled={isRegistering}
              className="min-h-[200px] font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Paste your armored public PGP key here. This will be used by whistleblowers to encrypt their submissions.
            </p>
          </div>

          <Alert>
            <AlertTitle>How to generate a PGP key pair</AlertTitle>
            <AlertDescription>
              <ol className="mt-2 list-decimal list-inside space-y-1 text-sm">
                <li>Use GPG: <code className="bg-muted px-1 rounded">gpg --gen-key</code></li>
                <li>Export public key: <code className="bg-muted px-1 rounded">gpg --armor --export your-email@example.com</code></li>
                <li>Or use online tools like Keybase, ProtonMail, or Mailvelope</li>
                <li>Keep your private key secure - you'll need it to decrypt submissions</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-4">
            {!isConnected ? (
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Please connect your wallet using the button in the header to register your organization
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                Wallet Connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={registerOrganization}
                disabled={!isConnected || isRegistering || !orgName.trim() || !pgpKey.trim()}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-lg"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Register Organization
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          <Alert>
            <AlertTitle>After Registration</AlertTitle>
            <AlertDescription>
              Once registered, your organization will appear in the dropdown list on the submission page. 
              Whistleblowers can then select your organization and submit encrypted messages directly to you.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  )
}
