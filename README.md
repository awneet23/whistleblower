# 🔒 Whistleblower Platform

**Secure, Anonymous, Trustless Payments for Information Sources**

*Built for the Avalanche Privacy Hackathon*

---

## 🚀 Live Application

🌐 **[Live Demo]** - *[https://whistleblower-platform-hnosy5jou-awneets-projects.vercel.app/]*

📹 **[Demo Video]** - *[https://youtu.be/bKrcB8PbHSk]*

---

## 📋 Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Security Guarantees](#security-guarantees)


---

## 🎯 Overview

Whistleblower Platform revolutionizes the way sensitive information is exchanged between sources and news organizations. By leveraging advanced cryptographic techniques and the Avalanche blockchain, we eliminate the trust barriers that have historically prevented the secure flow of crucial information to the public.

Our platform ensures that whistleblowers can receive guaranteed compensation while maintaining complete anonymity, and news organizations can verify information quality before making payments.

---

## ⚠️ The Problem

The current whistleblower ecosystem faces critical vulnerabilities that endanger sources and limit information flow:

### **The Whistleblower's Risk**
Individuals with valuable, often world-changing information, must operate on blind trust. They risk their careers and safety with no guarantee of being compensated for their information, as payment only occurs *after* the data has been revealed.

### **The Organization's Dilemma** 
News organizations are willing to pay for credible information but are constantly dealing with false leads. They cannot risk financial resources on a source *before* they have had a chance to verify the credibility of the information.

### **The Failure of Basic Anonymity**
The default Web3 solution—a simple "burner wallet"—is critically flawed. A public ERC20 transaction creates a permanent and publicly analyzable on-chain link between the known paying organization and the anonymous receiving wallet. This leaves the source vulnerable to discovery through blockchain analysis.

### **The Consequence**
This creates a fragile, trust-based system that fails to protect its most vulnerable participants and ultimately stifles the flow of important information to the public.

---

## ✅ Our Solution

Our platform replaces trust with cryptographic certainty through a unique hybrid architecture that combines a public-facing smart contract with a secure, off-chain relayer to execute private transactions.

### Key Pillars of Our Solution:

🔐 **Public Escrow with a Main Smart Contract**
News organizations lock standard, public ERC20 tokens (like USDC) into our primary MainContract. This action is public, transparent, and creates a verifiable on-chain guarantee that the funds are secured for the bounty.

⚡ **Just-in-Time Privacy Conversion**
The locked funds remain as standard, public ERC20 tokens until the moment a whistleblower's submission is approved. This is highly efficient and means we only use the complex and gas-intensive privacy features at the final payout stage.

📡 **Secure Communication via Encrypted Events**
When a bounty is approved, the MainContract emits an Event containing the whistleblower's payout information (their address and the amount) in an **encrypted format**. This allows the public contract to securely pass confidential instructions to our off-chain system without revealing them on the blockchain.

🛡️ **A Trusted Relayer for Confidential Payouts**
A secure, off-chain **Escrow Relayer** constantly listens for these encrypted events. When it detects a new event, it performs the final, critical steps:

1. It takes the public ERC20 tokens from the escrow
2. It **deposits** them into the eERC20 contract, converting them into private, encrypted tokens
3. It decrypts the whistleblower's address from the event payload
4. It executes the final, **private transfer** of the eERC20 tokens to the whistleblower

This hybrid model provides the best of both worlds: the unbreakable, trustless guarantee of a public smart contract escrow, combined with the powerful confidentiality of the Encrypted ERC20 standard for the final, anonymous payout.

---

## 🏗️ Architecture

<img width="1584" height="873" alt="image" src="https://github.com/user-attachments/assets/7c395820-9046-4976-b1fd-e96c70e0dcef" />


### Architecture Flow:

1. **Registration**: News Organization registers and locks funding ERC20 tokens
2. **New Bounty**: Creates bounty with encrypted submission requirements
3. **Secure Locking**: ERC20 tokens locked to ESCROW Address
4. **Encrypted Submission**: Reporter submits encrypted news report using Organization's Public Key
5. **Verification**: Organization accepts any 1 submission after verification
6. **Encrypted Events**: System generates encrypted events with user address and amount
7. **Off-chain Processing**: ESCROW Relayer decrypts user address off-chain
8. **Privacy Conversion**: Deposits received ERC20 token to eERC contract
9. **Anonymous Transfer**: Transfers eERC token to reporter with full privacy

### Privacy Guarantees:

1. ✅ Bounty Amount transferred with full **privacy**
2. ✅ Wallet address remained **encrypted**
3. ✅ No trace of bounty amount due **eERC20 privacy solution**
4. ✅ All transactions are fully **decentralized** ensuring a trustless environment

---

## 🌟 Key Features

- **🔒 Complete Anonymity**: Zero-knowledge payments using eERC20 tokens
- **💰 Guaranteed Escrow**: Smart contract-based fund locking ensures payment
- **🔐 End-to-End Encryption**: All sensitive communications encrypted
- **⚡ Gas Efficient**: Privacy features only activated at payout
- **🌐 Decentralized**: No single point of failure
- **📱 User-Friendly**: Intuitive interface for both sources and organizations
- **🛡️ Secure**: Advanced cryptographic protections throughout





## 🛠️ Technology Stack

- **Blockchain**: Avalanche Network
- **Smart Contracts**: Solidity
- **Privacy Layer**: eERC20 (Encrypted ERC20)
- **Frontend**: [Next js]
- **Backend**: [Node js]
- **Off-chain Components**: ESCROW Relayer System

---



## 🔐 Security Guarantees

Our platform provides multiple layers of security:

- **Smart Contract Escrow**: Funds are cryptographically locked until conditions are met
- **Zero-Knowledge Payments**: No on-chain link between payer and recipient
- **End-to-End Encryption**: All sensitive data encrypted in transit and at rest
- **Decentralized Architecture**: No central authority can compromise the system
- **Audit Trail**: Verifiable without compromising privacy

---


## 🏆 Hackathon Submission

This project was built for the **Avalanche Privacy Hackathon**. It demonstrates innovative use of privacy-preserving technologies to solve real-world problems in journalism and information transparency.






