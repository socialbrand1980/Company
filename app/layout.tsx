import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SocialBrand 1980 | Strategic Digital Agency',
  description: 'SocialBrand 1980 helps brands grow through structured strategy, creative storytelling, and data-driven execution. We manage brands, not just content.',
  generator: 'v0.app',
  icons: {
    icon: '/socialbrand1980.png',
    apple: '/socialbrand1980.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_geist.className} ${_geistMono.className}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
