import type { Metadata, Viewport } from 'next'
import { Fraunces, Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' })

export const metadata: Metadata = {
  title: 'Buno | Pacing Sanctuary',
  description:
    'A mindful budgeting sanctuary that shows spending zones instead of exact balances, so you can pace your month with peace of mind.',
  icons: {
    icon: [
      { url: '/images/buno-bunny-logo.jpg' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/images/buno-bunny-logo.jpg',
    apple: '/images/buno-bunny-logo.jpg',
  },
}

export const viewport: Viewport = {
  themeColor: '#4c2b08',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} bg-background`}
    >
      <body>{children}</body>
    </html>
  )
}
