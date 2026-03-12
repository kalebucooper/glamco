import type { Metadata } from 'next'
import './globals.css'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import { ToastProvider } from '@/components/ui/Toaster'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'glam.co — Find & Book Makeup Artists',
  description: 'Discover exceptional makeup artists for weddings, editorial, drag, glam, and more. Book instantly, pay securely.',
  openGraph: {
    title: 'glam.co',
    description: 'Find & book exceptional makeup artists.',
    siteName: 'glam.co',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <CartProvider>
            <ToastProvider>
              <Navbar />
              {children}
            </ToastProvider>
          </CartProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
