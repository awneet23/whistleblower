import { createPublicClient, http, createWalletClient } from 'viem';
import { avalancheFuji } from 'viem/chains';
import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto'; 
import { privateKeyToAccount } from 'viem/accounts';
import { depositERC20 } from './eer20-operations/deposit';
import { privateTransfer } from './eer20-operations/transfer';
import { EERC_CONTRACT, ERC20_TEST, REGISTRAR_CONTRACT } from './eer20-operations/contracts';


dotenv.config();
const app = express();

// IMPORTANT: We need the raw request body for signature verification.
// This special middleware saves the raw body before Express parses it as JSON.
app.use(express.json({
    verify: (req, res, buf) => {
        // HACK: Attach the raw body to the request object.
        (req as any).rawBody = buf;
    }
}));

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY as `0x${string}`;
const ALCHEMY_SIGNING_KEY = process.env.ALCHEMY_SIGNING_KEY; 


if (!RPC_URL || !PRIVATE_KEY || !ALCHEMY_SIGNING_KEY) {
    console.error("Missing required environment variables. Please check RPC_URL, ESCROW_PRIVATE_KEY, and ALCHEMY_SIGNING_KEY.");
}

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport: http(RPC_URL)
});

const walletClient = createWalletClient({
    chain: avalancheFuji,
    transport: http(RPC_URL),
    account,
});


app.post('/api/webhooks/alchemy', async (req, res) => {
    
    const signature = req.headers['x-alchemy-signature'] as string;
    const body = (req as any).rawBody;
    
    const hmac = crypto.createHmac('sha256', ALCHEMY_SIGNING_KEY!);
    hmac.update(body);
    const digest = hmac.digest('hex');
    
    if (signature !== digest) {
        console.warn("Invalid webhook signature received.");
        return res.status(401).send('Invalid Signature');
    }
    
    console.log("Webhook signature verified successfully!");
    
    
    try {
        const webhookData = req.body;
        const log = webhookData.event.data[0].log;
        const [rawBountyId, rawSubmitter, rawBountyAmount] = log.topics.slice(1);
        const bountyAmount = parseInt(rawBountyAmount, 16); 
        const decryptedAddress = '0x' + rawSubmitter.slice(26); 
        console.log(`Processing FullDescriptionSubmitted event for bounty amount: ${bountyAmount} to address: ${decryptedAddress}`);

        await depositERC20(
            publicClient, walletClient, account, bountyAmount,
            { tokenAddress: ERC20_TEST.address, decimals: 18 },
            { address: EERC_CONTRACT.address, abi: EERC_CONTRACT.abi },
            { address: REGISTRAR_CONTRACT.address, abi: REGISTRAR_CONTRACT.abi },
        );

        await privateTransfer(
            publicClient, walletClient, account, bountyAmount, decryptedAddress,
            { tokenAddress: ERC20_TEST.address, decimals: 18 },
            { address: EERC_CONTRACT.address, abi: EERC_CONTRACT.abi },
            { address: REGISTRAR_CONTRACT.address, abi: REGISTRAR_CONTRACT.abi },
        );
        
        console.log("Event processed successfully!");
        res.status(200).json({ message: 'Event processed successfully' });
        
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/api/health', (req: any, res: any) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
    });
});


export default app;