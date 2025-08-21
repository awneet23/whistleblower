# Deployment Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Update `.env.local` with your actual contract addresses:
   ```env
   NEXT_PUBLIC_EERC_CONTRACT_ADDRESS="0xYourContractAddress"
   NEXT_PUBLIC_NEWS_ORG_ADDRESS="0xNewsOrgWalletAddress"
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Production Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure KV Database**
   - Go to Vercel Dashboard → Your Project → Storage
   - Create a new KV Database
   - Connect it to your project
   - Environment variables will be automatically added

4. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add your contract addresses:
     - `NEXT_PUBLIC_EERC_CONTRACT_ADDRESS`
     - `NEXT_PUBLIC_NEWS_ORG_ADDRESS`

### Alternative: Self-Hosted

If not using Vercel, you'll need to:

1. Set up a Redis instance for KV storage
2. Update API routes to use your Redis connection
3. Configure environment variables for your hosting platform

## Testing the Application

### Prerequisites
- MetaMask installed in browser
- Test network with EERC tokens
- Valid PGP key pair for testing

### Test Flow
1. Generate a test PGP key pair
2. Navigate to homepage
3. Enter test message and public key
4. Connect MetaMask wallet
5. Submit (ensure you have test tokens and ETH for gas)
6. Check `/dashboard` for submission
7. Download from IPFS and decrypt with private key

## Security Considerations

- **Environment Variables**: Never commit real addresses to version control
- **IPFS Gateway**: Consider using private IPFS nodes for production
- **Rate Limiting**: Add rate limiting to API endpoints
- **Authentication**: Consider adding authentication to dashboard
- **HTTPS**: Always use HTTPS in production
- **CSP Headers**: Configure Content Security Policy headers

## Troubleshooting

### Common Issues

1. **"Cannot connect to IPFS"**
   - Check if Infura IPFS gateway is accessible
   - Try alternative gateway in code

2. **"Transaction failed"**
   - Ensure sufficient gas fees
   - Check token balance
   - Verify contract address

3. **"PGP encryption failed"**
   - Verify PGP key format (armored public key)
   - Check key validity

4. **"KV database error"**
   - Ensure Vercel KV is properly configured
   - Check environment variables

### Debug Mode

Add to `.env.local` for debugging:
```env
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```
