import type { Metadata } from 'next'
// import { Geist, Geist_Mono } from 'next/font/google'
import '../index.css'
import Header from '@/components/header'
import Providers from '@/components/providers'

// const geistSans = Geist({
//   subsets: ['latin'],
//   variable: '--font-geist-sans',
// })

// const geistMono = Geist_Mono({
//   subsets: ['latin'],
//   variable: '--font-geist-mono',
// })

export const metadata: Metadata = {
  description: 'novel-planet',
  title: 'novel-planet',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        className={`antialiased`}
      >
        <Providers>
          <div className="grid h-svh grid-rows-[auto_1fr]">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
