import { encryptMessage } from "../jub";
import { processPoseidonEncryption } from "../poseidon";
import * as snarkjs from 'snarkjs';

export async function privateTransferUtil(
    senderPublicKey: bigint[],
    senderFormattedPrivateKey: bigint,
    senderBalance: bigint,
    receiverPublicKey: bigint[],
    transferAmount: bigint,
    senderEncryptedBalance: bigint[],
    auditorPublicKey: bigint[],
): Promise<{
    proof: any;
    senderBalancePCT: bigint[];
}> {
    const senderNewBalance = senderBalance - transferAmount;
    // 1. encrypt the transfer amount with el-gamal for sender
    const { cipher: encryptedAmountSender } = encryptMessage(
        senderPublicKey,
        transferAmount,
    );
    
    // 2. encrypt the transfer amount with el-gamal for receiver
    const {
        cipher: encryptedAmountReceiver,
        random: encryptedAmountReceiverRandom,
    } = encryptMessage(receiverPublicKey, transferAmount);
    
    // 3. creates a pct for receiver with the transfer amount
    const {
        ciphertext: receiverCiphertext,
        nonce: receiverNonce,
        authKey: receiverAuthKey,
        encRandom: receiverEncRandom,
    } = processPoseidonEncryption([transferAmount], receiverPublicKey);
    
    // 4. creates a pct for auditor with the transfer amount
    const {
        ciphertext: auditorCiphertext,
        nonce: auditorNonce,
        authKey: auditorAuthKey,
        encRandom: auditorEncRandom,
    } = processPoseidonEncryption([transferAmount], auditorPublicKey);
    
    // 5. create pct for the sender with the newly calculated balance
    const {
        ciphertext: senderCiphertext,
        nonce: senderNonce,
        authKey: senderAuthKey,
    } = processPoseidonEncryption([senderNewBalance], senderPublicKey);
    
    const input = {
        ValueToTransfer: transferAmount,
        SenderPrivateKey: senderFormattedPrivateKey,
        SenderPublicKey: senderPublicKey,
        SenderBalance: senderBalance,
        SenderBalanceC1: senderEncryptedBalance.slice(0, 2),
        SenderBalanceC2: senderEncryptedBalance.slice(2, 4),
        SenderVTTC1: encryptedAmountSender[0],
        SenderVTTC2: encryptedAmountSender[1],
        ReceiverPublicKey: receiverPublicKey,
        ReceiverVTTC1: encryptedAmountReceiver[0],
        ReceiverVTTC2: encryptedAmountReceiver[1],
        ReceiverVTTRandom: encryptedAmountReceiverRandom,
        ReceiverPCT: receiverCiphertext,
        ReceiverPCTAuthKey: receiverAuthKey,
        ReceiverPCTNonce: receiverNonce,
        ReceiverPCTRandom: receiverEncRandom,
        
        AuditorPublicKey: auditorPublicKey,
        AuditorPCT: auditorCiphertext,
        AuditorPCTAuthKey: auditorAuthKey,
        AuditorPCTNonce: auditorNonce,
        AuditorPCTRandom: auditorEncRandom,
    };
    
    // Generate proof using snarkjs
    const wasmPath = './circuits/TransferCircuit.wasm';
    const zkeyPath = './circuits/TransferCircuit.groth16.zkey';
    
    //const proof = await transferCircuit.generateProof(input);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        wasmPath,
        zkeyPath
    );
    
    const formattedProof = {
        proofPoints: {
            a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])] as readonly [bigint, bigint],
            b: [
                [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
                [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])]
            ] as readonly [readonly [bigint, bigint], readonly [bigint, bigint]],
            c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])] as readonly [bigint, bigint]
        },
        publicSignals: (() => {
            const signals = publicSignals.map((signal: string) => BigInt(signal));
            if (signals.length !== 32) {
                throw new Error(`Expected 32 public signals, got ${signals.length}`);
            }
            return [signals[0], signals[1], signals[2], signals[3], signals[4], signals[5], signals[6], signals[7], signals[8], signals[9], signals[10], signals[11], signals[12], signals[13], signals[14], signals[15], signals[16], signals[17], signals[18], signals[19], signals[20], signals[21], signals[22], signals[23], signals[24], signals[25], signals[26], signals[27], signals[28], signals[29], signals[30], signals[31]] as const;
        })()
    };
    return {
        proof: formattedProof,
        senderBalancePCT: [...senderCiphertext, ...senderAuthKey, senderNonce],
    };
};
