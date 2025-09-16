'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'
import type { Bounty, Claim } from '@/types'

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any
  }
}

// --- New Interfaces for BountyEscrow Simulation ---
interface WalletContextType {
  isConnected: boolean
  address: string | null
  signer: ethers.Signer | null
  isRegistered: boolean
  isCheckingRegistration: boolean
  isOnChainRegistered: boolean
  isCheckingOnChainRegistration: boolean
  connect: () => Promise<void>
  disconnect: () => void
  checkRegistration: () => Promise<void>
  checkRegistrationStatus: (address: string) => Promise<void>
  checkOnChainRegistration: () => Promise<void>
  // --- New BountyEscrow Simulation State & Functions ---
  bounties: Bounty[];
  claims: Claim[];
  getBounties: () => Bounty[];
  getClaimsForBounty: (bountyId: number) => Claim[];
  getBountiesByOrganization: (organizationAddress: string) => Bounty[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletSigner, setWalletSigner] = useState<ethers.Signer | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false)
  const [isOnChainRegistered, setIsOnChainRegistered] = useState(false)
  const [isCheckingOnChainRegistration, setIsCheckingOnChainRegistration] = useState(false)
  // --- New states for BountyEscrow Simulation ---
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [bountyCounter, setBountyCounter] = useState(0);
  const [claimCounter, setClaimCounter] = useState(0);

  // Initialize wallet state from localStorage and check for existing connection
  useEffect(() => {
    const initializeWallet = async () => {
      // Check if wallet was previously connected
      const wasConnected = localStorage.getItem('walletConnected') === 'true'
      const savedAddress = localStorage.getItem('walletAddress')
      
      if (wasConnected && savedAddress && typeof window.ethereum !== 'undefined') {
        try {
          // Check if MetaMask is still connected to this address
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
            // Restore connection
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            setWalletAddress(accounts[0])
            setWalletSigner(signer)
            setIsConnected(true)
            console.log('🔄 Restored wallet connection:', accounts[0])
          } else {
            // Clear stale data
            localStorage.removeItem('walletConnected')
            localStorage.removeItem('walletAddress')
          }
        } catch (error) {
          console.warn('Failed to restore wallet connection:', error)
          localStorage.removeItem('walletConnected')
          localStorage.removeItem('walletAddress')
        }
      }
    }

    initializeWallet()
  }, [])

  // Set up MetaMask event listeners
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('👤 Accounts changed:', accounts)
        if (accounts.length === 0) {
          // User disconnected
          disconnect()
        } else if (accounts[0] !== walletAddress) {
          // User switched accounts - update to new account
          setWalletAddress(accounts[0])
          localStorage.setItem('walletAddress', accounts[0])
          // Signer will be updated in the next useEffect
        }
      }

      const handleChainChanged = (chainId: string) => {
        console.log('🔗 Chain changed:', chainId)
        // Reload the page to reset the dapp state
        window.location.reload()
      }

      const handleDisconnect = () => {
        console.log('🔌 Wallet disconnected')
        disconnect()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('disconnect', handleDisconnect)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
          window.ethereum.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [walletAddress])

  // Update signer when address changes
  useEffect(() => {
    const updateSigner = async () => {
      if (walletAddress && isConnected && typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          setWalletSigner(signer)
        } catch (error) {
          console.error('Failed to update signer:', error)
        }
      }
    }

    updateSigner()
  }, [walletAddress, isConnected])

  // Check registration when wallet state changes
  useEffect(() => {
    console.log('WalletContext useEffect - Wallet state changed:', { isConnected, walletAddress })
    
    if (isConnected && walletAddress) {
      console.log('WalletContext useEffect - Calling checkRegistrationStatus for:', walletAddress)
      checkRegistrationStatus(walletAddress)
      checkOnChainRegistration()
    } else {
      console.log('WalletContext useEffect - Wallet not connected, setting registration states to false')
      setIsRegistered(false)
      setIsOnChainRegistered(false)
    }
  }, [isConnected, walletAddress])

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Request accounts directly - this will trigger MetaMask popup
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        
        if (accounts && accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const newSigner = await provider.getSigner()
          setWalletAddress(accounts[0])
          setWalletSigner(newSigner)
          setIsConnected(true)
          localStorage.setItem('walletConnected', 'true')
          localStorage.setItem('walletAddress', accounts[0])
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

  const disconnect = () => {
    setWalletAddress(null)
    setWalletSigner(null)
    setIsConnected(false)
    setIsRegistered(false)
    setIsOnChainRegistered(false)
    setIsCheckingOnChainRegistration(false)
    setIsCheckingRegistration(false)
    localStorage.removeItem('walletConnected')
    localStorage.removeItem('walletAddress')
  }

  const checkRegistration = async () => {
    if (!walletAddress) {
      setIsRegistered(false)
      return
    }

    setIsCheckingRegistration(true)

    try {
      // Check off-chain registration first
      const response = await fetch(`/api/check-registration?address=${walletAddress}`)
      const data = await response.json()
      const isOffChainRegistered = data.isRegistered || false
      
      // Check on-chain registration if wallet is connected and off-chain is registered
      if (isOffChainRegistered && walletSigner) {
        try {
          const registrarContract = new ethers.Contract(
            '0xd1B3e920E381410b7537c313f2FBE20A9f2c2703', // Correct Registrar address
            ['function isUserRegistered(address) view returns (bool)'],
            walletSigner
          )
          const isOnChainRegistered = await registrarContract.isUserRegistered(walletAddress)
          
          // User must be registered both off-chain and on-chain
          setIsRegistered(isOffChainRegistered && isOnChainRegistered)
          setIsOnChainRegistered(isOnChainRegistered)
        } catch (onChainError) {
          console.warn('Could not check on-chain registration:', onChainError)
          // Fall back to off-chain only if on-chain check fails
          setIsRegistered(isOffChainRegistered)
          setIsOnChainRegistered(false)
        }
      } else {
        setIsRegistered(isOffChainRegistered)
        setIsOnChainRegistered(false)
      }
    } catch (error) {
      console.error('Error checking registration:', error)
      setIsRegistered(false)
      setIsOnChainRegistered(false)
    } finally {
      setIsCheckingRegistration(false)
    }
  }

  const checkRegistrationStatus = async (address: string) => {
    console.log('WalletContext - checkRegistrationStatus called with address:', address)
    
    if (!address) {
      console.log('WalletContext - No address provided, setting isRegistered to false')
      setIsRegistered(false)
      return
    }

    console.log('WalletContext - Setting isCheckingRegistration to true')
    setIsCheckingRegistration(true)

    try {
      // Check off-chain registration first
      const apiUrl = `/api/check-registration?address=${address}`
      console.log('WalletContext - Calling API:', apiUrl)
      
      const response = await fetch(apiUrl)
      console.log('WalletContext - API response status:', response.status)
      
      const data = await response.json()
      console.log('WalletContext - API response data:', data)
      
      const isOffChainRegistered = data.isRegistered || false
      console.log('WalletContext - isOffChainRegistered:', isOffChainRegistered)
      
      console.log('WalletContext - Setting isRegistered to:', isOffChainRegistered)
      setIsRegistered(isOffChainRegistered)
    } catch (error) {
      console.error('WalletContext - Error checking registration:', error)
      setIsRegistered(false)
    } finally {
      console.log('WalletContext - Setting isCheckingRegistration to false')
      setIsCheckingRegistration(false)
    }
  }

  const checkOnChainRegistration = async () => {
    if (!walletAddress || !walletSigner) {
      console.log('🔍 checkOnChainRegistration - No wallet address or signer')
      setIsOnChainRegistered(false)
      setIsCheckingOnChainRegistration(false)
      return
    }

    console.log('🔍 checkOnChainRegistration - Starting check for:', walletAddress)
    setIsCheckingOnChainRegistration(true)

    try {
      const registrarContract = new ethers.Contract(
        '0xd1B3e920E381410b7537c313f2FBE20A9f2c2703', // Correct Registrar address
        ['function isUserRegistered(address) view returns (bool)'],
        walletSigner
      )
      console.log('🔍 checkOnChainRegistration - Calling isUserRegistered for:', walletAddress)
      const isOnChainRegistered = await registrarContract.isUserRegistered(walletAddress)
      console.log('🔍 checkOnChainRegistration - Result:', isOnChainRegistered)
      setIsOnChainRegistered(isOnChainRegistered)
    } catch (error) {
      console.error('❌ Error checking on-chain registration:', error)
      setIsOnChainRegistered(false)
    } finally {
      setIsCheckingOnChainRegistration(false)
      console.log('🔍 checkOnChainRegistration - Check completed')
    }
  }

  const getBounties = () => { return bounties; };

  const getClaimsForBounty = (bountyId: number) => { 
    return claims.filter(claim => claim.bountyId === bountyId);
  };

  const getBountiesByOrganization = (organizationAddress: string) => {
    return bounties.filter(bounty => bounty.organization.toLowerCase() === organizationAddress.toLowerCase());
  };

  const value: WalletContextType = {
    address: walletAddress,
    signer: walletSigner,
    isConnected,
    isRegistered,
    isCheckingRegistration,
    isOnChainRegistered,
    isCheckingOnChainRegistration,
    connect: connectWallet,
    disconnect,
    checkRegistration,
    checkRegistrationStatus,
    checkOnChainRegistration,
    // --- New BountyEscrow Simulation Context Values ---
    bounties,
    claims,
    getBounties,
    getClaimsForBounty,
    getBountiesByOrganization,
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
