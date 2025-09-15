'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Coins, ArrowRight, Shield, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  const router = useRouter()

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
            Trustless Whistleblower Marketplace
          </h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
            The first decentralized platform where news organizations post bounties for information, 
            and whistleblowers are paid automatically through smart contract escrow.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <Button 
            onClick={() => router.push('/bounties')}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 px-8 text-lg"
          >
            <Coins className="mr-2 h-5 w-5" />
            View Active Bounties
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="glass-card border-accent/20 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                Trustless Escrow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Funds are locked in smart contracts. Payment is automatic when information is approved - no trust required.
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="glass-card border-accent/20 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-accent" />
                Anonymous & Encrypted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your identity remains protected. Information is encrypted and stored on IPFS for maximum privacy.
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="glass-card border-accent/20 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-accent" />
                Guaranteed Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Smart contracts ensure you get paid immediately when your information is verified and approved.
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="text-center bg-accent/10 rounded-lg p-8 border border-accent/20"
      >
        <h2 className="text-2xl font-bold text-accent mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6">
          Browse active bounties from news organizations and submit your information to earn rewards.
        </p>
        <Button 
          onClick={() => router.push('/bounties')}
          variant="outline"
          className="border-accent/50 hover:border-accent hover:bg-accent/10"
        >
          Explore Bounties
        </Button>
      </motion.div>
    </motion.div>
  )
}
