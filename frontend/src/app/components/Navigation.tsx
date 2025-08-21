'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Send, Database, UserPlus, Coins } from 'lucide-react'

export default function Navigation() {
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
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
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
          <div className="flex space-x-2">
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
                href="/" 
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/20 hover:text-accent border border-transparent hover:border-accent/30"
              >
                <Send className="h-4 w-4" />
                Submit
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
                href="/register" 
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/20 hover:text-accent border border-transparent hover:border-accent/30"
              >
                <UserPlus className="h-4 w-4" />
                Register Org
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
