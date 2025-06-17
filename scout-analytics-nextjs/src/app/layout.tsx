import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Scout Analytics Dashboard - TBWA AI Platform',
  description: 'AI-powered retail intelligence platform for the Philippines market',
  robots: 'index, follow',
  openGraph: {
    title: 'Scout Analytics Dashboard',
    description: 'AI-powered retail intelligence platform',
    type: 'website',
    url: 'https://scout-mvp.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scout Analytics Dashboard',
    description: 'AI-powered retail intelligence platform',
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
      <body>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}