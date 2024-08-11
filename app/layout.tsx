import Nav from '@/components/Nav'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import Providers from '@/components/providers'

export const metadata: Metadata = {
  title: 'SuperchainOwlFrame',
  description: 'Integrate SuperChain+Owl with NFTs directly in to frames',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
       
      <body className={inter.className}>
      <Providers>
       <Nav />
        {children}
        </Providers>
        </body>

    </html>
  )
}