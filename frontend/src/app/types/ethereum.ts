export interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener?: (eventName: string, handler: (...args: any[]) => void) => void;
  selectedAddress: string | null;
  chainId: string | null;
}

declare global {
  interface Window {
    ethereum: EthereumProvider | undefined;
  }
}

export interface WalletState {
  account: string | null;
  chainId: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
  isMetaMaskInstalled: boolean;
  isConnected: boolean;
}

export interface UseMetaMaskReturn extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (targetChainId: string) => Promise<void>;
  getNetworkName: (chainId: string) => string;
  clearError: () => void;
}

export interface NetworkConfig {
  [key: string]: string;
}
