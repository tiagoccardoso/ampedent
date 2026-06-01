import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'

import TheHeader from './components/layout/TheHeader'
import TheFooter from './components/layout/TheFooter'

import Loader from './components/Loader'
import AppProvider from './components/AppProvider'
import { Suspense } from 'react'
import Spinner from './components/Spinner'

export const metadata: Metadata = {
  title: {
    default: 'DentalSys | Sua parceira em cuidados odontológicos',
    template: `%s | DentalSys`,
  },
  description:
    'A DentalSys oferece serviços odontológicos completos. Temos o compromisso de proporcionar um sorriso saudável a você.',
  metadataBase: new URL('https://ampedent.vercel.app/'),

  openGraph: {
    type: 'website',
    url: 'https://ampedent.vercel.app/',
    title: 'DentalSys | Sua parceira em cuidados odontológicos',
    description:
      'A DentalSys oferece serviços odontológicos completos. Temos o compromisso de proporcionar um sorriso saudável a você.',
    images: [
      {
        url: 'https://res.cloudinary.com/dkofkuquf/image/upload/v1707573685/nuxtshop/rlviwuatbxvwxex336eh.webp',
        alt: 'DentalSys Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: 'https://ampedent.vercel.app/',
    title: 'DentalSys | Sua parceira em cuidados odontológicos',
    description:
      'A DentalSys oferece serviços odontológicos completos. Temos o compromisso de proporcionar um sorriso saudável a você.',
    images: [
      'https://res.cloudinary.com/dkofkuquf/image/upload/v1707573685/nuxtshop/rlviwuatbxvwxex336eh.webp',
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='pt-BR'>
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
