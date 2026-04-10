import type { Metadata } from 'next'
import './globals.css'
import { Topbar } from '@/components/layout/Topbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Toaster } from '@/components/ui/Toaster'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { Analytics } from '@/components/ui/Analytics'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Genialisimo 🔥 — Memes y contenido viral en español',
  description: 'El mejor feed de memes, fails y contenido viral en español. Vota, comenta y comparte lo mejor de internet.',
  keywords: 'memes, viral, fails, humor, español, latino, gifs',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Genialisimo 🔥',
    description: 'Memes y contenido viral en español',
    url: 'https://genialisimo.com',
    siteName: 'Genialisimo',
    images: [{ url: 'https://genialisimo.com/og-image.png', width: 1200, height: 630 }],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Genialisimo 🔥',
    description: 'Memes y contenido viral en español',
    images: ['https://genialisimo.com/og-image.png'],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://genialisimo.com'),
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Genialisimo",
  "url": "https://genialisimo.com",
  "description": "El mejor feed de memes y contenido viral en español",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://genialisimo.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className="pb-16 md:pb-0">
        <div style={{ overflowX: 'hidden', maxWidth: '100vw', position: 'relative' }}>
          <AuthProvider>
            <Toaster>
              <Analytics />
              <Topbar />
              <main className="min-h-screen">{children}</main>
              <MobileNav />
              <footer className="border-t border-border py-6 px-4 hidden md:block">
                <div className="max-w-[1100px] mx-auto flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <p className="text-[11px] font-mono text-muted">
                      © 2026 Genialisimo
                    </p>
                    
                     <a href="https://www.youtube.com/@Genialisimo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[11px] font-mono text-muted hover:text-red-500 transition-colors"
                    >
                      ▶️ YouTube
                    </a>
                  </div>
                  <div className="flex gap-4">
                    <a href="/privacidad" className="text-[11px] font-mono text-muted hover:text-accent transition-colors">
                      Privacidad
                    </a>
                    <a href="/terminos" className="text-[11px] font-mono text-muted hover:text-accent transition-colors">
                      Terminos
                    </a>
                    <a href="/acerca" className="text-[11px] font-mono text-muted hover:text-accent transition-colors">
                      Acerca
                    </a>
                    <a href="mailto:contacto@genialisimo.com" className="text-[11px] font-mono text-muted hover:text-accent transition-colors">
                      Contacto
                    </a>
                  </div>
                </div>
              </footer>
            </Toaster>
          </AuthProvider>
        </div>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8458170443836025"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}