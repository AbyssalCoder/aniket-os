import type { Metadata } from 'next'
import { Orbitron, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Aniket Chowdhury | AI/ML Engineer',
  description:
    'Portfolio of Aniket Chowdhury — AI/ML Engineer specializing in Deep Learning, Computer Vision, NLP, and Generative AI.',
  keywords: ['AI', 'ML', 'Deep Learning', 'Portfolio', 'Aniket Chowdhury'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="font-inter bg-dark-900 text-white noise-overlay">
        {children}
      </body>
    </html>
  )
}
