import { useState, useEffect, useCallback, useRef } from 'react';
import type { UseMetaMaskReturn, NetworkConfig, EthereumProvider } from '../types/ethereum';

export const useMetaMask = (): UseMetaMaskReturn => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
  
  // Use refs to store the latest handlers to avoid stale closures
  const handlersRef = useRef<{
    accountsChanged?: (accounts: string[]) => void;
    chainChanged?: (chainId: string) => void;
  }>({});

  // Check if MetaMask is installed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isInstalled = !!(window.ethereum?.isMetaMask);
      setIsMetaMaskInstalled(isInstalled);
      
      if (!isInstalled) {
        setError('MetaMask is not installed. Please install MetaMask to continue.');
      }
    }
  }, []);
  

  // Get account balance with better error handling
  const getBalance = useCallback(async (address: string): Promise<string | null> => {
    if (!window.ethereum || !address) return null;
    
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      if (!balance) return null;
      
      // Convert from wei to ether with better precision handling
      const balanceInWei = BigInt(balance);
      const balanceInEth = (Number(balanceInWei) / Math.pow(10, 18)).toFixed(4);
      return balanceInEth;
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Connect to MetaMask with improved error handling
  const connect = useCallback(async (): Promise<void> => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts: string[] = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please make sure MetaMask is unlocked.');
      }

      const account = accounts[0];
      setAccount(account);

      // Get chain ID
      const chainId: string = await window.ethereum.request({
        method: 'eth_chainId'
      });
      setChainId(chainId);

      // Get balance
      const balance = await getBalance(account);
      setBalance(balance);

    } catch (error: any) {
      let errorMessage = 'Failed to connect to MetaMask';
      
      if (error.code === 4001) {
        errorMessage = 'Connection rejected. Please approve the connection request.';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending. Please check MetaMask.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [getBalance]);

  // Disconnect wallet
  const disconnect = useCallback((): void => {
    setAccount(null);
    setChainId(null);
    setBalance(null);
    setError(null);
  }, []);

  // Switch network with better error handling
  const switchNetwork = useCallback(async (targetChainId: string): Promise<void> => {
    if (!window.ethereum) {
      setError('MetaMask is not available');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
      
      // Clear any previous errors on successful switch
      setError(null);
    } catch (error: any) {
      let errorMessage = 'Failed to switch network';
      
      if (error.code === 4001) {
        errorMessage = 'Network switch rejected by user';
      } else if (error.code === 4902) {
        errorMessage = 'Network not found. Please add the network to MetaMask first.';
      } else if (error.message) {
        errorMessage = `Failed to switch network: ${error.message}`;
      }
      
      setError(errorMessage);
      console.error('Network switch error:', error);
    }
  }, []);

  // Event handlers
  const handleAccountsChanged = useCallback((accounts: string[]): void => {
    if (accounts.length === 0) {
      disconnect();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      getBalance(accounts[0]).then(setBalance).catch(() => setBalance(null));
    }
  }, [account, disconnect, getBalance]);

  const handleChainChanged = useCallback((newChainId: string): void => {
    setChainId(newChainId);
    if (account) {
      getBalance(account).then(setBalance).catch(() => setBalance(null));
    }
  }, [account, getBalance]);

  // Update refs when handlers change
  useEffect(() => {
    handlersRef.current.accountsChanged = handleAccountsChanged;
    handlersRef.current.chainChanged = handleChainChanged;
  }, [handleAccountsChanged, handleChainChanged]);

  // Listen for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const accountsHandler = (accounts: string[]) => {
      handlersRef.current.accountsChanged?.(accounts);
    };

    const chainHandler = (chainId: string) => {
      handlersRef.current.chainChanged?.(chainId);
    };

    window.ethereum.on('accountsChanged', accountsHandler);
    window.ethereum.on('chainChanged', chainHandler);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', accountsHandler);
        window.ethereum.removeListener('chainChanged', chainHandler);
      }
    };
  }, []); // Empty dependency array is correct here

  // Check if already connected on mount
  useEffect(() => {
    if (!window.ethereum) return;

    const checkConnection = async (): Promise<void> => {
      try {
        const accounts: string[] = await window.ethereum!.request({
          method: 'eth_accounts'
        });

        if (accounts.length > 0) {
          const account = accounts[0];
          setAccount(account);

          const chainId: string = await window.ethereum!.request({
            method: 'eth_chainId'
          });
          setChainId(chainId);

          const balance = await getBalance(account);
          setBalance(balance);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        // Don't set error here as it might be a temporary issue
      }
    };

    checkConnection();
  }, [getBalance]);

  // Helper function to get network name with updated networks
  const getNetworkName = useCallback((chainId: string): string => {
    const networks: NetworkConfig = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Mumbai Testnet',
      '0xa86a': 'Avalanche Mainnet',
      '0xa869': 'Fuji Testnet',
      '0x38': 'BSC Mainnet',
      '0x61': 'BSC Testnet',
      '0xa4b1': 'Arbitrum One',
      '0x66eed': 'Arbitrum Goerli',
      '0xa': 'Optimism',
      '0x1a4': 'Optimism Goerli',
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  }, []);

  return {
    account,
    chainId,
    balance,
    isConnecting,
    error,
    isMetaMaskInstalled,
    connect,
    disconnect,
    switchNetwork,
    getNetworkName,
    clearError,
    isConnected: !!account && !!chainId
  };
};
