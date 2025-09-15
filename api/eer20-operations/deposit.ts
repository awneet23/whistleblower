import { Abi, Address, erc20Abi, parseUnits, PrivateKeyAccount, PublicClient, WalletClient } from "viem";
import { avalancheFuji } from "viem/chains";
import { processPoseidonEncryption } from "./lib/poseidon";

export async function depositERC20(
    publicClient: PublicClient,
    walletClient: WalletClient,
    account: PrivateKeyAccount,
    depositAmount: number,
    erc20TokenDetails: {
        tokenAddress: Address,
        decimals: number,
    },
    eerc20ContractDetails: {
        address: Address,
        abi: Abi,
    },
    registrarContractDetails: {
        address: Address,
        abi: Abi,
    },
) {
    const allowanceAmount = depositAmount + 1; // add 1 to allow for rounding errors
    const allowanceAmountInSmallestDenomination = parseUnits(allowanceAmount.toString(), erc20TokenDetails.decimals)
    const depositAmountInSmallestDenominatino = parseUnits(depositAmount.toString(), erc20TokenDetails.decimals)

    const depositorPublicKey = await publicClient.readContract({
        address: registrarContractDetails.address,
        abi: registrarContractDetails.abi,
        functionName: 'getUserPublicKey',
        args: [account.address], // depositor
    }) as [bigint, bigint];

    const approvalTx = await walletClient.writeContract({
        address: erc20TokenDetails.tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [eerc20ContractDetails.address, allowanceAmountInSmallestDenomination], // spender, allowanceAmount
        account,
        chain: avalancheFuji,
    })
    // wait for receipt
    await publicClient.waitForTransactionReceipt({
        hash: approvalTx,
    })
    console.log("Approval transaction sent:", approvalTx);

    const publicKeyBigInt = [
        BigInt(depositorPublicKey[0]!.toString()), 
        BigInt(depositorPublicKey[1]!.toString())
    ];

    const {
        ciphertext: amountCiphertext,
        nonce: amountNonce,
        authKey: amountAuthKey,
    } = processPoseidonEncryption([BigInt(depositAmount)], publicKeyBigInt);

    const amountPCT: [bigint, bigint, bigint, bigint, bigint, bigint, bigint] = [
        ...amountCiphertext,
        ...amountAuthKey,
        amountNonce
    ] as [bigint, bigint, bigint, bigint, bigint, bigint, bigint];

    const depositTx = await walletClient.writeContract({
        address: eerc20ContractDetails.address,
        abi: eerc20ContractDetails.abi,
        functionName: 'deposit',
        args: [depositAmountInSmallestDenominatino, erc20TokenDetails.tokenAddress, amountPCT], // depositAmount, erc20TokenAddress, amountPCT
        account,
        chain: avalancheFuji,
    });
    await publicClient.waitForTransactionReceipt({
        hash: depositTx,
    })

    console.log("Deposit transaction sent:", depositTx);
    console.log("✅ Deposit confirmed");
}
