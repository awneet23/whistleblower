import { createWalletClient, http, parseUnits, Address, Hash, createPublicClient, PrivateKeyAccount, PublicClient, WalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { avalancheFuji } from 'viem/chains'

const ERC20_ABI = [
    {
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function'
    }
] as const

export async function approveToken(
    tokenAddress: Address,
    spender: Address,
    amount: string,
    decimals: number,
    account: PrivateKeyAccount,
    walletClient: WalletClient,
    publicClient: PublicClient
) {    
    const approvalAmount = parseUnits(amount, decimals)
    
    const approvalTx = await walletClient.writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, approvalAmount],
        account,
        chain: avalancheFuji,
    })
    // wait for receipt
    await publicClient.waitForTransactionReceipt({
        hash: approvalTx,
    })
    return approvalTx;
}
