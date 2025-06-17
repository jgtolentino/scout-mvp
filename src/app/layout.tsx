import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Scout Analytics Dashboard - TBWA AI Platform',
  description: 'AI-powered retail intelligence platform for the Philippines market',
  keywords: 'retail analytics, AI, Philippines, business intelligence, TBWA',
  openGraph: {
    title: 'Scout Analytics Dashboard',
    description: 'AI-powered retail intelligence platform',
    type: 'website',
    url: 'https://ai-analytics-platform.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scout Analytics Dashboard',
    description: 'AI-powered retail intelligence platform',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  )
}
