# 🛡️ Whistleblower Privacy Platform

A decentralized, trustless marketplace for anonymous information disclosure, built on Avalanche.

*This project is a submission for the Avalanche Privacy Hackathon (August 2025).*
---

## 🚀 Live Demo & Links

| Resource | Link |
|----------|------|
| Live Application | [whistleblower-sigma.vercel.app](https://whistleblower-sigma.vercel.app) |
| Project Roadmap | [View our Vision on Notion](https://notion.so) |


DEMO SCREENSHOTS

<img width="1899" height="854" alt="image" src="https://github.com/user-attachments/assets/45b3b710-d4a4-45e6-9950-8ecbce86781b" />



<img width="968" height="836" alt="image" src="https://github.com/user-attachments/assets/a79af38f-26bf-44e6-a8ce-069b3e92ef03" />


<img width="1500" height="758" alt="image" src="https://github.com/user-attachments/assets/b650a841-87e5-43fa-b214-1ee9bc5962dc" />


<img width="1361" height="586" alt="image" src="https://github.com/user-attachments/assets/dbd3d4e8-d609-4e0f-95d9-50a8b8d4a0d6" />



<img width="1569" height="653" alt="image" src="https://github.com/user-attachments/assets/aa470e10-8e9c-4c54-ba8e-725b01ced0cd" />






---

## 💡 The Problem: The Whistleblower's Dilemma

The flow of critical information is broken. Whistleblowers possess valuable, often world-changing information, but they have no guarantee of being compensated for their immense risk. They must trust news organizations to pay them after the information is revealed.

Conversely, news organizations cannot risk paying for information before they can verify its credibility. This results in a broken, trust-based system that stifles the flow of information. A simple "burner wallet" is not enough, as a public transaction creates a permanent, analyzable link between the payer and the payee.

---

## 🎯 Our Solution: A Trustless & Confidential Marketplace

Our platform replaces trust with cryptographic certainty. We have engineered a system where the exchange of information for payment is not only guaranteed by a smart contract but is also completely private, breaking the on-chain link between the sender and receiver.

---

## 🛠️ How It Works: The Three Pillars of Privacy

Our architecture is built on three pillars that work together to provide robust protection.

### 🤫 Pillar 1: Confidential Transactions (Encrypted ERC20)

This is the heart of our platform's privacy. We use the Encrypted ERC20 standard, which leverages Zero-Knowledge Proofs to enable truly confidential transactions.

- **Confidential Amounts:** The bounty and reward amounts are completely hidden from public view on the blockchain.
- **Broken Chain of Evidence:** By using a private ledger, it is cryptographically impossible to prove that the funds a news organization deposited are the same funds a whistleblower withdrew. This provides plausible deniability.

### 🤝 Pillar 2: Trustless Escrow (Smart Contract)

Our `BountyEscrow.sol` contract acts as an impartial robotic intermediary. News organizations lock the confidential payment in escrow before any information is shared. The contract guarantees the funds are released to the whistleblower automatically upon approval.

### 📦 Pillar 3: End-to-End Encrypted Data (IPFS + PGP)

The sensitive information itself never touches the blockchain. It is fully encrypted on the user's device using the organization's public PGP key and stored on the decentralized IPFS network. Only the organization with the matching private key can ever decrypt the file.

---

## 🌐 How to Test the Live Demo

You will need two separate wallets (e.g., two accounts in MetaMask) connected to the Avalanche Fuji Testnet.

### As a News Organization (Wallet A):

1. Go to the `/register-org` page and register your organization with a name and a PGP public key.
2. Navigate to your `/dashboard` and create a new bounty.
3. Wait for a whistleblower to submit a claim. You will see their anonymous "teaser" on your dashboard.
4. If you approve, click "Release Reward" to simulate the payment and receive the link to the full encrypted data.

### As a Whistleblower (Wallet B):

1. Ensure this wallet is "clean" and has no link to your real identity.
2. Go to the `/bounties` page and find a bounty you want to claim.
3. Click "Submit Claim," write a public teaser and your full confidential message.
4. If the news organization approves your teaser, the reward would be sent to your wallet's encrypted balance.

---

## 💻 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, Shadcn/UI, Ethers.js |
| **Backend & Blockchain** | Solidity, Hardhat, Encrypted ERC20 (EERC20), Zero-Knowledge Proofs |
| **Deployment** | Vercel (Frontend), Avalanche Fuji Testnet (Contracts) |
| **Data & Privacy** | IPFS, PGP (openpgp.js), Vercel KV (for off-chain data) |
