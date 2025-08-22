'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any
  }
}

interface WalletContextType {
  walletAddress: string | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Set up event listeners for MetaMask changes (no automatic connection)
  useEffect(() => {

    // Set up event listeners for MetaMask changes
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts)
        if (accounts.length === 0) {
          // User disconnected wallet or locked MetaMask
          setWalletAddress(null)
          setIsConnected(false)
        } else if (isConnected) {
          // Only update if user was already connected - don't auto-connect
          setWalletAddress(accounts[0])
          setIsConnected(true)
        }
      }

      const handleChainChanged = (chainId: string) => {
        console.log('Chain changed to:', chainId)
        // Reload the page to ensure application state is consistent with new network
        window.location.reload()
      }

      const handleConnect = (connectInfo: { chainId: string }) => {
        console.log('Wallet connected:', connectInfo)
        // Note: We don't auto-connect here - user must explicitly click Connect Wallet
      }

      const handleDisconnect = (error: { code: number; message: string }) => {
        console.log('Wallet disconnected:', error)
        setWalletAddress(null)
        setIsConnected(false)
      }

      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('connect', handleConnect)
      window.ethereum.on('disconnect', handleDisconnect)

      // Cleanup listeners on unmount
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
          window.ethereum.removeListener('connect', handleConnect)
          window.ethereum.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [])

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // First, try to request permissions to force the popup
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        })
        
        // Then request accounts
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0])
          setIsConnected(true)
        } else {
          throw new Error('No accounts returned')
        }
      } else {
        throw new Error('MetaMask is not installed')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
    setIsConnected(false)
  }

  const value: WalletContextType = {
    walletAddress,
    isConnected,
    connectWallet,
    disconnectWallet
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
