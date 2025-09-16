'use client';

import React from 'react';
import WalletConnect from '../../components/WalletConnect';
import { useMetaMask } from '../hooks/useMetamask';

export default function ConnectPage() {
  const { account, isConnected, chainId, getNetworkName } = useMetaMask();

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

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Connect Your Wallet</h1>
      <WalletConnect 
        onConnect={handleWalletConnect}
        onDisconnect={handleWalletDisconnect}
        onError={handleWalletError}
        showBalance={true}
        showNetwork={true}
        buttonSize="medium"
        className="my-wallet-connect"
      />
      
      {isConnected && (
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
          <h2>Welcome to the DApp!</h2>
          <p><strong>Account:</strong> {account}</p>
          <p><strong>Network:</strong> {chainId ? getNetworkName(chainId) : 'Unknown'}</p>
          <p>You can now interact with the blockchain!</p>
        </div>
      )}
    </div>
  );
}