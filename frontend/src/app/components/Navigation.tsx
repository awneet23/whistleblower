'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Send, Database, UserPlus, Coins, Wallet, LogOut, ArrowLeftRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/context/WalletContext'
import { useToast } from '@/hooks/use-toast'
import { useMetaMask } from '../hooks/useMetamask'
import WalletConnect from '../../components/WalletConnect'

export default function Navigation() {
  // const { isConnected, address, connect, disconnect } = useWallet()
  const { account, isConnected, chainId, getNetworkName, disconnect } = useMetaMask();
  const { toast } = useToast()

  const handleWalletConnect = (account: string): void => {
    console.log('Wallet connected with account:', account);
    // You can add analytics, notifications, etc. here
  };

  const handleWalletDisconnect = (): void => {
    console.log('Wallet disconnected');
    // Handle cleanup, redirect, etc. here
  };

  const handleWalletError = (error: string): void => {
    console.error('Wallet error:', error);
    // Show toast notification, log to analytics, etc.
  };

  const handleDisconnectWallet = (): void => {
    disconnect();
    handleWalletDisconnect();
  };

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="border-b border-accent/20 bg-card/80 backdrop-blur-md relative z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="/bounties" className="flex items-center space-x-2 text-xl font-bold">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Shield className="h-6 w-6 text-accent" />
              </motion.div>
              <span className="bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
                Whistleblower Platform
              </span>
            </Link>
          </motion.div>
          <div className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/bounties" 
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/20 hover:text-accent border border-transparent hover:border-accent/30"
              >
                <Coins className="h-4 w-4" />
                Bounties
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/20 hover:text-accent border border-transparent hover:border-accent/30"
              >
                <Database className="h-4 w-4" />
                Dashboard
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/converter" 
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/20 hover:text-accent border border-transparent hover:border-accent/30"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Converter
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/organizations" 
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/20 hover:text-accent border border-transparent hover:border-accent/30"
              >
                <Users className="h-4 w-4" />
                Organizations
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/register" 
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/20 hover:text-accent border border-transparent hover:border-accent/30"
              >
                <UserPlus className="h-4 w-4" />
                Register Org
              </Link>
            </motion.div>
            
            {/* Wallet Connection Section */}
            {!isConnected ? (
              <WalletConnect 
                onConnect={handleWalletConnect}
                onDisconnect={handleWalletDisconnect}
                onError={handleWalletError}
                showBalance={false}
                showNetwork={false}
                buttonSize="medium"
                className="my-wallet-connect"
                //  hideWalletInfo={true}
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-md border border-green-200 dark:border-green-800">
                  <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                  <span className="font-mono">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleDisconnectWallet}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}