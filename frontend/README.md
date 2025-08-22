# Anonymous Whistleblower Platform

A modern, secure whistleblower platform built with Next.js 14, featuring end-to-end encryption, decentralized storage, and a beautiful dark-themed UI powered by Tailwind CSS and Shadcn/UI.

## ✨ Features

### 🔒 Security & Privacy
- **End-to-End Encryption**: Messages encrypted with PGP before upload
- **Decentralized Storage**: Files stored on IPFS for censorship resistance
- **Anonymous Notifications**: Blockchain transactions notify organizations without revealing identity
- **Client-Side Processing**: All encryption happens in the browser

### 🎨 Modern UI/UX
- **Dark Theme**: Professional dark theme with Shadcn/UI components
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Interactive Feedback**: Loading states, animations, and toast notifications
- **Accessible**: Built with accessibility best practices

### 🏢 Organization Management
- **Registration System**: News organizations can register with PGP keys
- **Dynamic Selection**: Whistleblowers choose from registered organizations
- **Submission Tracking**: Dashboard for viewing encrypted submissions

## 🛠 Technology Stack

- **Framework**: Next.js 14 with TypeScript and App Router
- **Styling**: Tailwind CSS + Shadcn/UI components
- **Web3**: Ethers.js v6 for blockchain interactions
- **Encryption**: OpenPGP for message encryption
- **Storage**: IPFS via ipfs-http-client
- **Database**: Vercel KV for organization and submission tracking
- **Icons**: Lucide React icons

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Update the `.env.local` file:

```env
# Contract address of the deployed EncryptedERC token
NEXT_PUBLIC_EERC_CONTRACT_ADDRESS="0x..."

# Vercel KV credentials (auto-configured on Vercel)
KV_REST_API_URL="your_kv_url"
KV_REST_API_TOKEN="your_kv_token"
```

### 3. Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Production Deployment

```bash
vercel deploy
```

## 📱 Application Pages

### 🏠 Homepage (`/`) - Whistleblower Submission
- Select registered news organization from dropdown
- Enter confidential message
- Connect Web3 wallet
- Submit encrypted message anonymously

### 📊 Dashboard (`/dashboard`) - News Organization View
- View all encrypted submissions in a table
- Download files from IPFS gateways
- Instructions for decrypting messages

### 🏢 Registration (`/register`) - Organization Setup
- Register news organization
- Upload public PGP key
- Connect organization wallet

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/submit` | Save IPFS CID after submission |
| `GET` | `/api/submissions` | Get list of submission CIDs |
| `POST` | `/api/register-org` | Register news organization |
| `GET` | `/api/get-orgs` | Get registered organizations |

## 🏗 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── get-orgs/route.ts
│   │   │   ├── register-org/route.ts
│   │   │   ├── submit/route.ts
│   │   │   └── submissions/route.ts
│   │   ├── components/
│   │   │   └── Navigation.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── register/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/ui/
│   │   ├── alert.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   ├── hooks/
│   │   └── use-toast.ts
│   └── lib/
│       └── utils.ts
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## 🔐 Security Workflow

1. **Organization Registration**:
   - News org generates PGP key pair
   - Registers with public key and wallet address
   - Stored in Vercel KV database

2. **Whistleblower Submission**:
   - Selects organization from dropdown
   - Message encrypted with org's public key
   - Encrypted file uploaded to IPFS
   - Small token transfer notifies organization
   - IPFS CID saved for organization access

3. **News Organization Access**:
   - Views submissions in dashboard
   - Downloads encrypted files from IPFS
   - Decrypts with private PGP key

## 📦 Dependencies

### Core
- `next`: React framework
- `react`: UI library
- `typescript`: Type safety

### Web3 & Crypto
- `ethers`: Ethereum interactions
- `openpgp`: PGP encryption
- `ipfs-http-client`: IPFS uploads

### UI & Styling
- `tailwindcss`: Utility-first CSS
- `@radix-ui/*`: Headless UI primitives
- `lucide-react`: Icons
- `class-variance-authority`: Component variants
- `clsx` & `tailwind-merge`: Utility functions

### Backend
- `@vercel/kv`: Key-value database

## 🔧 Development Notes

### TypeScript Errors
The lint errors shown are expected during development before `npm install` runs. They will resolve once dependencies are installed.

### IPFS Configuration
Currently uses Infura's public gateway. For production, consider:
- Private IPFS nodes
- Pinning services like Pinata
- Multiple gateway fallbacks

### Security Considerations
- Environment variables never committed
- PGP keys validated on registration
- Wallet addresses normalized to lowercase
- Rate limiting recommended for production

## 📖 Usage Guide

### For News Organizations

1. **Generate PGP Key Pair**:
   ```bash
   gpg --gen-key
   gpg --armor --export your-email@example.com
   ```

2. **Register Organization**:
   - Visit `/register`
   - Enter organization name
   - Paste public PGP key
   - Connect wallet and register

3. **Monitor Submissions**:
   - Visit `/dashboard`
   - Download encrypted files
   - Decrypt with private key

### For Whistleblowers

1. **Prepare Submission**:
   - Visit homepage
   - Select news organization
   - Write confidential message

2. **Submit Anonymously**:
   - Connect Web3 wallet
   - Click "Submit Anonymously"
   - Wait for confirmation

3. **Verification**:
   - Message encrypted client-side
   - Uploaded to IPFS
   - Organization notified via blockchain

## 🚨 Troubleshooting

### Common Issues

- **MetaMask Connection**: Ensure MetaMask is installed and unlocked
- **Transaction Failures**: Check gas fees and token balance
- **PGP Errors**: Verify key format includes header/footer blocks
- **IPFS Upload**: Check network connectivity to Infura gateway

### Debug Mode

Set environment variable for additional logging:
```env
NEXT_PUBLIC_DEBUG=true
```
