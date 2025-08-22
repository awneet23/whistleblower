import type { Metadata } from 'next'
import './globals.css'
import Navigation from './components/Navigation'
import { Toaster } from '@/components/ui/toaster'
import ParticleBackground from '@/components/ui/particle-background'
import { WalletProvider } from '@/context/WalletContext'
import { PrototypeBanner } from '@/components/PrototypeBanner'

export const metadata: Metadata = {
  title: 'Anonymous Whistleblower Platform',
  description: 'Secure, anonymous submission platform for whistleblowers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground font-sans antialiased relative overflow-x-hidden">
        <WalletProvider>
          <ParticleBackground />
          <div className="relative z-10">
            <PrototypeBanner />
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  )
}
