# 🛡️ Whistleblower Privacy Platform

A decentralized, trustless marketplace for anonymous information disclosure, built on Avalanche.

**This project is a submission for the Avalanche Privacy Hackathon (August 2025).**

## 🚀 Live Demo & Links

| Resource | Link |
|----------|------|
| **Live Application** | [whistleblower-sigma.vercel.app](https://whistleblower-sigma.vercel.app) |
| **Project Roadmap** | [View our Vision on Notion](https://notion.so) |

## 💡 The Problem: The Whistleblower's Dilemma

The flow of critical information is broken. Whistleblowers possess valuable, often world-changing information, but they have no guarantee of being compensated for their immense risk. They must trust news organizations to pay them after the information is revealed.

Conversely, news organizations cannot risk paying for information before they can verify its credibility. This results in a broken, trust-based system that stifles the flow of information and fails to protect its most vulnerable participants. A simple "burner wallet" is not enough, as a public transaction creates a permanent, analyzable link between the payer and the payee.

## 🎯 Our Solution: A Trustless & Confidential Marketplace

Our platform replaces trust with cryptographic certainty. We have engineered a system where the exchange of information for payment is not only guaranteed by a smart contract but is also completely private, breaking the on-chain link between the sender and receiver.

## 🛠️ How It Works: The Three Pillars of Privacy

Our architecture is built on three pillars that work together to provide robust protection.

### 🤫 Pillar 1: Confidential Transactions (Encrypted ERC20)

This is the heart of our platform's privacy. We use the Encrypted ERC20 standard, which leverages Zero-Knowledge Proofs and ElGamal encryption to enable truly confidential transactions.

- **Anonymous Sender**: The whistleblower's identity is never revealed on-chain
- **Anonymous Receiver**: The news organization's identity is shielded
- **Confidential Amounts**: Crucially, the bounty and reward amounts are completely hidden from public view on the blockchain. Only the sender, receiver, and an optional auditor can see the values

### 🤝 Pillar 2: Trustless Escrow (Smart Contract)

Our `BountyEscrow.sol` contract acts as an impartial robotic intermediary. News organizations lock the confidential payment in escrow before any information is shared. The contract guarantees the funds are released to the whistleblower automatically upon approval, eliminating the need for trust.

### 📦 Pillar 3: End-to-End Encrypted Data (IPFS + PGP)

The sensitive information itself never touches the blockchain. It is fully encrypted on the user's device using the organization's public PGP key and stored on the decentralized IPFS network. Only the organization with the matching private key can ever decrypt the file.

## 🌐 How to Test the Live Demo

You will need two separate wallets (e.g., two accounts in MetaMask) connected to the **Avalanche Fuji Testnet**.

### As a News Organization (Wallet A):

1. Go to the `/register` page and register your organization with a name and a PGP public key
2. Navigate to your `/dashboard` and click "Create Bounty"
3. Lock a private token amount in escrow (you will need to deposit public tokens first if you have none)
4. Wait for a whistleblower to submit a claim. You will see their anonymous "teaser" on your dashboard
5. If you approve, click "Release Reward" to automatically pay them and receive the link to the full encrypted data

### As a Whistleblower (Wallet B):

1. Ensure this wallet is "clean" and has no link to your real identity
2. Go to the `/bounties` page and find a bounty you want to claim
3. Click "Submit Claim," write a public teaser and your full confidential message
4. Submit the claim. If the news organization approves your teaser, the reward will be sent to your wallet's encrypted balance automatically
5. You can then withdraw your encrypted tokens to convert them back to a public ERC20 token

## 💻 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, Shadcn/UI, Ethers.js |
| **Backend & Blockchain** | Solidity, Hardhat, Encrypted ERC20 (EERC20), Zero-Knowledge Proofs |
| **Deployment** | Vercel (Frontend), Avalanche Fuji Testnet (Contracts) |
| **Data & Privacy** | IPFS, PGP (openpgp.js), Vercel KV (for off-chain data) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MetaMask or compatible Web3 wallet
- Access to Avalanche Fuji Testnet

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/whistleblower-privacy-platform.git

# Navigate to the project directory
cd whistleblower-privacy-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run the development server
npm run dev
```

Visit `http://localhost:3000` to see the application running locally.

## 🔒 Security Features

- **Zero-Knowledge Proofs**: Transactions are verified without revealing sensitive information
- **End-to-End Encryption**: Data is encrypted client-side before storage
- **Decentralized Storage**: Files stored on IPFS for censorship resistance
- **Smart Contract Escrow**: Trustless automated payment system
- **Anonymous Transactions**: No on-chain link between parties

## 🤝 Contributing

We welcome contributions to improve the platform! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## 🛡️ Disclaimer

This platform is designed for legitimate whistleblowing activities to promote transparency and accountability. Users are responsible for complying with all applicable laws and regulations in their jurisdiction.

---

**Built for the Avalanche Privacy Hackathon 2025** 🏆
