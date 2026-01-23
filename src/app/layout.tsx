import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'REPal - Real Estate Professional Assistant',
  description: 'All-in-one real estate toolkit: Lead CRM, Investment Calculator, Transaction Tracker, Seller Net Sheet, and more.',
  manifest: '/manifest.json',
  themeColor: '#0D0D0D',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'REPal',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#D4AF37',
          colorBackground: '#0D0D0D',
          colorInputBackground: '#1A1A1A',
          colorInputText: '#FFFFFF',
        },
        elements: {
          formButtonPrimary: 'bg-primary-500 hover:bg-primary-600 text-dark-bg',
          card: 'bg-dark-card border border-dark-border',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-400',
          socialButtonsBlockButton: 'bg-dark-card border border-dark-border text-white hover:bg-dark-border',
          formFieldInput: 'bg-dark-bg border-dark-border text-white',
          footerActionLink: 'text-primary-500 hover:text-primary-400',
        }
      }}
    >
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-dark-bg min-h-screen`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
