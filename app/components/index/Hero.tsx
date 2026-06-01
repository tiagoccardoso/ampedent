import Link from 'next/link'
import hero from '@/public/hero.webp'
import HeroContainer from '../layout/HeroContainer'
import { getSiteContent } from '@/lib/siteContent'

async function Hero() {
  const content = await getSiteContent()
  const home = content.home
  return (
    <HeroContainer backgroundImage={home.image_url || hero.src}>
      <div className='mx-auto  w-full max-w-3xl text-center mt-32 p-4'>
        <span className='sm:text-lg mb-2'>Deixe-nos ajudar você</span>
        <h1 className='mb-4 text-4xl font-bold md:text-7xl text-center'>{home.title}</h1>
        <h2 className='mx-auto max-w-lg text-slate-800 text-md sm:text-xl mb-4'>{home.subtitle}</h2>
        <h2 className='mx-auto mb-5 max-w-lg text-slate-800 text-md sm:text-xl'>{home.body}</h2>
        <div className='flex flex-col sm:flex-row gap-3 items-stretch justify-center mt-8 '>
          <Link href='/booking' className='mx-auto inline-block rounded-md bg-blue-800 hover:bg-blue-600 px-8 py-4 text-center font-semibold text-white'>AGENDAR ONLINE</Link>
          <Link href='/admin' className='mx-auto inline-block rounded-md border border-blue-700 text-blue-700 hover:bg-blue-50 px-8 py-4 text-center font-semibold'>ENTRAR</Link>
        </div>
      </div>
    </HeroContainer>
  )
}
export default Hero
