import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'

import TheHeader from './components/layout/TheHeader'
import TheFooter from './components/layout/TheFooter'

import Loader from './components/Loader'
import AppProvider from './components/AppProvider'
import { Suspense } from 'react'
import Spinner from './components/Spinner'

const siteUrl = 'https://ampedent.vercel.app'
const siteName = 'Odonto Prime Studio'
const siteDescription =
  'Odonto Prime Studio oferece odontologia de alto padrão: implantes, estética dental, ortodontia e muito mais. Agende sua consulta online e sorria com confiança.'

export const metadata: Metadata = {
  title: {
    default: `${siteName} | Odontologia de Alto Padrão`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'odontologia',
    'clínica odontológica',
    'implantes dentários',
    'estética dental',
    'ortodontia',
    'clareamento dental',
    'dentista',
    'Odonto Prime Studio',
    'saúde bucal',
    'sorriso perfeito',
  ],
  metadataBase: new URL(siteUrl),
  authors: [{ name: 'Odonto Prime Studio' }],
  robots: { index: true, follow: true },

  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },

  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName,
    title: `${siteName} | Odontologia de Alto Padrão`,
    description: siteDescription,
    locale: 'pt_BR',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Odonto Prime Studio – Odontologia de Alto Padrão',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@odontoprimestudio',
    title: `${siteName} | Odontologia de Alto Padrão`,
    description: siteDescription,
    images: [`${siteUrl}/og-image.png`],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='pt-BR'>
      <head>
        <link rel='icon' type='image/svg+xml' href='/favicon.svg' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
      </head>
      <body>
        <AppProvider>
          <div className='flex min-h-screen flex-col'>
            <TheHeader />
            <Suspense fallback={<Spinner />}>
              <Loader />
            </Suspense>
            {children}
            <Analytics />
          </div>
          <TheFooter />
        </AppProvider>
      </body>
    </html>
  )
}
