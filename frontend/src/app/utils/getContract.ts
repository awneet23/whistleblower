import { avalancheFuji } from 'viem/chains'
import { Chain, createPublicClient, createWalletClient, custom, getContract, http } from 'viem';
import { toast } from '@/components/ui/use-toast';

export const getContractInstance = async (
    contractAddress: `0x${string}`,
    abi: any[],
    selectedChain: Chain,
) => {
    try {
        // Create public client for reading contract data
        const publicClient = createPublicClient({
            chain: selectedChain,
            transport: http()
        })
        
        // Create wallet client for writing to contract (requires wallet connection)
        let walletClient = null
        if (typeof window !== 'undefined' && window.ethereum) {
            walletClient = createWalletClient({
                chain: selectedChain,
                transport: custom(window.ethereum)
            })
        } else {
            throw "Wallet not connected!";
        }
        
        // Create contract instance
        const contract = getContract({
            address: contractAddress,
            abi,
            client: {
                public: publicClient,
                wallet: walletClient
            }
        })
        
        console.log('Smart contract connected successfully:', {
            address: contractAddress,
            network: selectedChain,
            chain: selectedChain.name
        })
        
        return {
            contract,
            publicClient,
            walletClient,
            chain: selectedChain
        }
    } catch (error) {
        console.error('Failed to connect to smart contract:', error)
        toast({
            variant: "destructive",
            title: "Contract Connection Failed",
            description: error instanceof Error ? error.message : 'Failed to connect to smart contract'
        })
        throw error
    }
}