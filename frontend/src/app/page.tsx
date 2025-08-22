'use client'

import { useWallet } from '@/context/WalletContext'

export default function WhistleblowerPage() {
  const { isConnected } = useWallet()

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-gray-900 text-white rounded-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Anonymous Whistleblower Platform</h1>
          <p className="text-xl text-gray-300">Secure, encrypted submission platform for whistleblowers</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select News Organization</label>
            <select className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white">
              <option>Choose a news organization</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Your Confidential Message</label>
            <textarea 
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white min-h-[120px]"
              placeholder="Enter your confidential information here..."
            />
          </div>
          
          <div className="bg-blue-900/50 border border-blue-700 rounded-md p-4">
            <h3 className="font-semibold mb-2">How it works</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Your message is encrypted with the news organization's public key</li>
              <li>The encrypted message is uploaded to IPFS (decentralized storage)</li>
              <li>A small token transfer notifies the news organization anonymously</li>
              <li>Only the news organization can decrypt and read your message</li>
            </ol>
          </div>
          
          <div className="space-y-3">
            <button 
              disabled={!isConnected}
              className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${
                isConnected 
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Anonymously
            </button>
            {!isConnected && (
              <p className="text-sm text-gray-400 text-center">
                Please connect your wallet using the button in the header to submit anonymously
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
