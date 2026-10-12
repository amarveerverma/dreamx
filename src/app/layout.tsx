import type { Metadata } from 'next'
import './globals.css'
import { CommandMenu } from '@/components/CommandMenu'

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
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
