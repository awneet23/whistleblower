import { createPublicClient, http, parseAbiItem, getContract, Log, AbiEvent, parseUnits, createWalletClient } from 'viem'
import { avalancheFuji } from 'viem/chains'
import express from 'express'
import dotenv from 'dotenv'
import { MainContract } from './contracts/MainContract'
import { privateKeyToAccount } from 'viem/accounts'
import { depositERC20 } from './eer20-operations/deposit'
import { EERC_CONTRACT, ERC20_TEST, REGISTRAR_CONTRACT } from './eer20-operations/contracts'
import { privateTransfer } from './eer20-operations/transfer'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

const RPC_URL = process.env.RPC_URL
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY as `0x${string}`

// Setup clients and account
const account = privateKeyToAccount(PRIVATE_KEY)
const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport: http(RPC_URL)
})
const walletClient = createWalletClient({
    chain: avalancheFuji,
    transport: http(RPC_URL),
    account,
})

const EVENTS_TO_LISTEN = ['FullDescriptionSubmitted']

interface EventHandler {
    eventName: string
    handler: (log: Log) => void
}

class ContractEventListener {
    private contract: any
    private eventHandlers: Map<string, (log: Log) => void> = new Map()
    private isListening = false
    
    constructor() {
        this.contract = getContract({
            address: MainContract.address as `0x${string}`,
            abi: MainContract.abi,
            client: publicClient
        })
        
        this.setupEventHandlers()
    }
    
    private setupEventHandlers() {
        this.eventHandlers.set('FullDescriptionSubmitted', (log: Log) => {
            this.handleFullDescriptionSubmittedEvent(log)
        })
    }

    // Deposit ERC20 and Transfer EERC20 to the user
    private async handleFullDescriptionSubmittedEvent(log: Log) {
        console.log('FullDescriptionSubmitted event detected')
        const [rawBountyId, rawSubmitter, rawBountyAmount] = log.topics.slice(1);
        const bountyAmount = parseInt(rawBountyAmount);
        const enryptedAddress = rawSubmitter;
        const decryptedAddress = enryptedAddress.slice(2).slice(-40);

        // Deposit ERC20
        await depositERC20(
            publicClient,
            walletClient,
            account,
            bountyAmount,
            {
                tokenAddress: ERC20_TEST.address,
                decimals: 18,
            },
            {
                address: EERC_CONTRACT.address,
                abi: EERC_CONTRACT.abi,
            },
            {
                address: REGISTRAR_CONTRACT.address,
                abi: REGISTRAR_CONTRACT.abi,
            },
        );

        // Transfer EERC20 to the user
        await privateTransfer(
            publicClient,
            walletClient,
            account,
            bountyAmount,
            decryptedAddress,
            {
                tokenAddress: ERC20_TEST.address,
                decimals: 18,
            },
            {
                address: EERC_CONTRACT.address,
                abi: EERC_CONTRACT.abi,
            },
            {
                address: REGISTRAR_CONTRACT.address,
                abi: REGISTRAR_CONTRACT.abi,
            },
        )
    }
    
    async startListening() {
        if (this.isListening) {
            console.log('Already listening for events')
            return
        }
        
        console.log(`Starting to listen for events from contract: ${MainContract.address}`)
        console.log(`Events to monitor: ${EVENTS_TO_LISTEN.join(', ')}`)
        
        try {
            // Listen for multiple events
            for (const eventName of EVENTS_TO_LISTEN) {
                const eventAbi = parseAbiItem(`event ${eventName}(${this.getEventSignature(eventName)})`)
                
                // Watch for events
                publicClient.watchEvent({
                    address: MainContract.address as `0x${string}`,
                    event: eventAbi as AbiEvent,
                    onLogs: (logs) => {
                        logs.forEach(log => {
                            const handler = this.eventHandlers.get(eventName)
                            if (handler) {
                                handler(log)
                            }
                        })
                    },
                    onError: (error) => {
                        console.error(`Error listening for ${eventName} events:`, error)
                    }
                })
            }
            
            this.isListening = true
            console.log('Event listening started successfully')
        } catch (error) {
            console.error('Failed to start event listening:', error)
            throw error
        }
    }
    
    private getEventSignature(eventName: string): string {
        const eventSignatures: Record<string, string> = {
            'FullDescriptionSubmitted': 'uint indexed bountyId, address indexed submitter, uint indexed bountyAmount'
        }

        return eventSignatures[eventName] || ''
    }

    getStatus() {
        return {
            isListening: this.isListening,
            contractAddress: MainContract.address,
            eventsMonitored: EVENTS_TO_LISTEN,
            chainId: avalancheFuji.id
        }
    }
}

// Initialize the event listener
const eventListener = new ContractEventListener();

// API Routes
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Smart Contract Event Listener',
    })
})

app.get('/status', (req, res) => {
    res.json(eventListener.getStatus())
})

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', error)
    res.status(500).json({
        message: 'Internal server error',
        error: error.message
    })
})

// Start the server
async function startServer() {
    try {
        // Test the RPC connection
        const blockNumber = await publicClient.getBlockNumber()
        console.log(`Connected to blockchain. Latest block: ${blockNumber}`)
        
        // Start the Express server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
            console.log(`Health check: http://localhost:${PORT}/health`)
            console.log(`Status endpoint: http://localhost:${PORT}/status`)
        })
        
        // Automatically start listening for events
        await eventListener.startListening()
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

// Start the server
startServer().catch(console.error)

export default app