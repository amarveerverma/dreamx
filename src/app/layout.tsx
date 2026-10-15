import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CommandMenu } from '@/components/CommandMenu'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DreamX — AI-Powered Mentorship & Career Platform',
  description: 'The right help at every stage with your dream company\'s best people.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
        {children}
        <CommandMenu />
      </body>
    </html>
  )
}
