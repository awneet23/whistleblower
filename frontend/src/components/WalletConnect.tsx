'use client';
// components/WalletConnect.tsx
import React from 'react';
import { useMetaMask } from '../app/hooks/useMetamask';

interface WalletConnectProps {
  onConnect?: (account: string) => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  showBalance?: boolean;
  showNetwork?: boolean;
  className?: string;
  buttonSize?: 'small' | 'medium' | 'large';
   hideWalletInfo?: boolean;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ 
  onConnect, 
  onDisconnect,
  onError,
  showBalance = true, 
  showNetwork = true,
  className = '',
  buttonSize = 'medium',
  hideWalletInfo = false 
}) => {
  const {
    account,
    chainId,
    balance,
    isConnecting,
    error,
    isMetaMaskInstalled,
    connect,
    disconnect,
    getNetworkName,
    clearError,
    isConnected
  } = useMetaMask();

  // Handle callbacks
  React.useEffect(() => {
    if (account && onConnect) {
      onConnect(account);
    }
  }, [account, onConnect]);

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handleConnect = async (): Promise<void> => {
    clearError();
    await connect();
  };

  const handleDisconnect = (): void => {
    disconnect();
    if (onDisconnect) onDisconnect();
  };

  const formatAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getButtonSizeClass = (size: string): string => {
    switch (size) {
      case 'small': return 'button-small';
      case 'large': return 'button-large';
      default: return 'button-medium';
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <div className={`wallet-connect ${className}`}>
        <div className="wallet-error">
          <div className="error-icon">⚠️</div>
          <p>MetaMask is not installed</p>
          <p className="error-subtitle">Please install MetaMask to connect your wallet</p>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="install-button"
          >
            Install MetaMask
          </a>
        </div>
        <style jsx>{`
          .wallet-error {
            text-align: center;
            padding: 24px;
            border: 2px dashed #ff6b6b;
            border-radius: 12px;
            background-color: #fff5f5;
          }
          
          .error-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }
          
          .error-subtitle {
            color: #666;
            font-size: 14px;
            margin-bottom: 16px;
          }
          
          .install-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #ff6b6b;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .install-button:hover {
            background-color: #ff5252;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
          }
        `}</style>
      </div>
    );
  }
//   if (isConnected ) {
//   return null; // Don't render anything when connected if hideWalletInfo is true
// }

  return (
    <div className={`wallet-connect ${className}`}>
      {error && (
        <div className="error-message">
          <span className="error-text">{error}</span>
          <button 
            onClick={clearError} 
            className="error-dismiss"
            type="button"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`connect-button ${getButtonSizeClass(buttonSize)}`}
          type="button"
          aria-label={isConnecting ? 'Connecting to wallet' : 'Connect wallet'}
        >
          {isConnecting ? (
            <>
              <span className="spinner"></span>
              Connecting...
            </>
          ) : (
            'Connect Wallet'
          )}
        </button>
      ) : (
         !hideWalletInfo &&(
        <div className="wallet-info">
          <div className="wallet-header">
            <div className="connection-status">
              <div className="status-indicator"></div>
              <span>Connected</span>
            </div>
          </div>

          <div className="account-info">
            <div className="info-label">Account:</div>
            <div className="account-address" title={account || ''}>
              {formatAddress(account)}
            </div>
          </div>

          {showBalance && balance && (
            <div className="balance-info">
              <div className="info-label">Balance:</div>
              <div className="balance-value">{balance} AVAX</div>
            </div>
          )}

          {showNetwork && chainId && (
            <div className="network-info">
              <div className="info-label">Network:</div>
              <div className="network-value">{getNetworkName(chainId)}</div>
            </div>
          )}

          <button 
            onClick={handleDisconnect} 
            className="disconnect-button"
            type="button"
            aria-label="Disconnect wallet"
          >
            Disconnect
  </button>
        </div>
        )
      )}

      <style jsx>{`
        .wallet-connect {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 100%;
          max-width: 400px;
        }
        
        .error-message {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #fee;
          color: #c33;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          border: 1px solid #fcc;
        }

        .error-text {
          flex: 1;
          margin-right: 8px;
        }

        .error-dismiss {
          background: none;
          border: none;
          color: #c33;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .connect-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .button-small {
          padding: 8px 16px;
          font-size: 14px;
        }

        .button-medium {
          padding: 14px 28px;
          font-size: 16px;
        }

        .button-large {
          padding: 18px 36px;
          font-size: 18px;
        }

        .connect-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
        }

        .connect-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .wallet-info {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(226, 232, 240, 0.5);
          margin-top: 450px;
          margin-left:200px;
          position: relative;
          marginright:20px;
        }

        .wallet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #22c55e;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          background-color: #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .account-info,
        .balance-info,
        .network-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }

        .network-info {
          border-bottom: none;
          margin-bottom: 20px;
        }

        .info-label {
          font-weight: 600;
          color: #475569;
          font-size: 14px;
        }

        .account-address {
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          background-color: rgba(0, 0, 0, 0.05);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          color: #1e293b;
          font-weight: 500;
        }

        .balance-value {
          font-weight: 700;
          color: #059669;
          font-size: 15px;
        }

        .network-value {
          font-size: 14px;
          color: #334155;
          font-weight: 500;
        }

        .disconnect-button {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          margin-top: 0;
        }

        .disconnect-button:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        @media (max-width: 640px) {
          .wallet-info {
            padding: 20px;
          }
          
          .account-info,
          .balance-info,
          .network-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .account-address {
            align-self: stretch;
            text-align: center;
          }
        }
      `}</style>
    </div>
  
  );
};

export default WalletConnect;
