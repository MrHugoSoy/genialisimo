import type { Metadata } from 'next'
import './globals.css'
import { Topbar } from '@/components/layout/Topbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Toaster } from '@/components/ui/Toaster'
import { AuthProvider } from '@/components/auth/AuthProvider'

export const metadata: Metadata = {
  title: 'Genialisimo 🔥',
  description: 'El feed de memes y contenido viral en español',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="pb-16 md:pb-0">
        <AuthProvider>
          <Toaster>
            <Topbar />
            <main>{children}</main>
            <MobileNav />
          </Toaster>
        </AuthProvider>
      </body>
    </html>
  )
}
