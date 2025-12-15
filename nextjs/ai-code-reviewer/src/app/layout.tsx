import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Code Reviewer - Smart Code Analysis with Memory',
  description: 'AI-powered code reviewer that learns your patterns',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">{children}</body>
    </html>
  )
}
