import { PublicClient, WalletClient, Address, Abi, PrivateKeyAccount } from "viem";
import { avalancheFuji } from "viem/chains";
import { EERC_CONTRACT, REGISTRAR_CONTRACT } from "./contracts";
import { decryptEGCTBalance, i0 } from "./lib/balances/balances";
import { formatPrivKeyForBabyJub } from 'maci-crypto'
import { Base8, mulPointEscalar, subOrder } from '@zk-kit/baby-jubjub'
import { privateTransferUtil } from "./lib/utils/privateTranserUtil";

export async function privateTransfer(
    publicClient: PublicClient,
    walletClient: WalletClient,
    account: PrivateKeyAccount,
    transferAmount: number, 
    receiverAddress: string,
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
    const recipientPublicKey = await publicClient.readContract({
        address: registrarContractDetails.address,
        abi: REGISTRAR_CONTRACT.abi,
        functionName: 'getUserPublicKey',
        args: [receiverAddress as `0x${string}`],
    });
    
    const auditorPublicKey = await publicClient.readContract({
        address: eerc20ContractDetails.address,
        abi: EERC_CONTRACT.abi,
        functionName: 'auditorPublicKey',
    });
    
    const tokenId = await publicClient.readContract({
        address: eerc20ContractDetails.address,
        abi: EERC_CONTRACT.abi,
        functionName: 'tokenIds',
        args: [erc20TokenDetails.tokenAddress],
    });
    
    const balanceOfSender = await publicClient.readContract({
        address: eerc20ContractDetails.address,
        abi: EERC_CONTRACT.abi,
        functionName: 'balanceOf',
        args: [account.address, tokenId],
    });
    
    const message = `eERC\nRegistering user with\n Address:${account.address.toLowerCase()}`;
    const signature = await walletClient.signMessage({
        message,
        account,
    })
    const senderPrivateKey = i0(signature);
    const senderFormattedPrivateKey = formatPrivKeyForBabyJub(senderPrivateKey) % subOrder;
    const senderPublicKey = mulPointEscalar(Base8, senderFormattedPrivateKey).map((x) => BigInt(x)) as [bigint, bigint];
    
    const [eGCT, , , ,] = balanceOfSender;

    // Decrypt sender's balance using EGCT
    const c1: [bigint, bigint] = [BigInt(eGCT.c1.x.toString()), BigInt(eGCT.c1.y.toString())];
    const c2: [bigint, bigint] = [BigInt(eGCT.c2.x.toString()), BigInt(eGCT.c2.y.toString())];
    
    const isEGCTEmpty = c1[0] === BigInt(0) && c1[1] === BigInt(0) && c2[0] === BigInt(0) && c2[1] === BigInt(0);
    if (isEGCTEmpty) {
        console.error("Sender has no encrypted balance to transfer");
        return;
    }
    const egctBalance = decryptEGCTBalance(senderPrivateKey, c1, c2);
    
    // Convert transfer amount to encrypted system units
    const transferAmountBigInt = BigInt(Math.floor(transferAmount * (10 ** 2)));    
    
    const senderEncryptedBalance = [c1[0], c1[1], c2[0], c2[1]];
    const receiverPublicKeyArray = [BigInt(recipientPublicKey[0].toString()), BigInt(recipientPublicKey[1].toString())];
    const auditorPublicKeyArray = [BigInt(auditorPublicKey[0].toString()), BigInt(auditorPublicKey[1].toString())];
    const { proof, senderBalancePCT } = await privateTransferUtil(
        senderPublicKey,
        senderFormattedPrivateKey,
        egctBalance,
        receiverPublicKeyArray,
        transferAmountBigInt,
        senderEncryptedBalance,
        auditorPublicKeyArray
    );
    const transferTx = await walletClient.writeContract({
        address: EERC_CONTRACT.address,
        abi: EERC_CONTRACT.abi,
        functionName: 'transfer',
        args: [
            receiverAddress as `0x${string}`,
            tokenId,
            proof,
            senderBalancePCT as [bigint, bigint, bigint, bigint, bigint, bigint, bigint],
        ],
        account,
        chain: avalancheFuji,
    });
    // wait for receipt
    await publicClient.waitForTransactionReceipt({
        hash: transferTx,
    })
    console.log("Transfer transaction sent:", transferTx);
    console.log("✅ Transfer confirmed");
    return transferTx;
}
