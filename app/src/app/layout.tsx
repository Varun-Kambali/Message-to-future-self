import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title:       'Future Self Messenger',
  description: 'Write a letter, record a voice note, or film a moment — sealed with wax, delivered to your future self.',
  openGraph: {
    title:       'Future Self Messenger',
    description: 'A time capsule for your future self, inspired by a quiet café in Tokyo.',
    type:        'website',
  },
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor:   '#1c1410',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
