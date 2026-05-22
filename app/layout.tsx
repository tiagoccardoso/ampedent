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
    default: 'AmpeDent | Sua parceira em cuidados odontológicos',
    template: `%s | AmpeDent`,
  },
  description:
    "A AmpeDent oferece serviços odontológicos completos. Temos o compromisso de proporcionar um sorriso saudável a você.",
  metadataBase: new URL('https://ampedent.vercel.app/'),

  openGraph: {
    type: 'website',
    url: 'https://ampedent.vercel.app/',
    title: 'AmpeDent | Sua parceira em cuidados odontológicos',
    description:
      "A AmpeDent oferece serviços odontológicos completos. Temos o compromisso de proporcionar um sorriso saudável a você.",
    images: [
      {
        url: 'https://res.cloudinary.com/dkofkuquf/image/upload/v1707573685/nuxtshop/rlviwuatbxvwxex336eh.webp',
        alt: 'AmpeDent Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: 'https://ampedent.vercel.app/',
    title: 'AmpeDent | Sua parceira em cuidados odontológicos',
    description:
      "A AmpeDent oferece serviços odontológicos completos. Temos o compromisso de proporcionar um sorriso saudável a você.",
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
      <AppProvider>
        <body>
          <div className='flex flex-col min-h-screen'>
            <TheHeader />
            <Suspense fallback={<Spinner />}>
              <Loader />
            </Suspense>
            {children}
            <Analytics />
          </div>
          <TheFooter />
        </body>
      </AppProvider>
    </html>
  )
}
