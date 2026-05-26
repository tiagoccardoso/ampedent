import Link from 'next/link'
import HeroContainer from '../layout/HeroContainer'
import { getSectionSettings, DEFAULT_HERO } from '@/lib/site-content'

async function Hero() {
  const db = await getSectionSettings('hero')
  const d = { ...DEFAULT_HERO, ...db }

  return (
    <HeroContainer backgroundImage={d.bg_image_url || DEFAULT_HERO.bg_image_url}>
      <div className='mx-auto w-full max-w-3xl text-center mt-32 p-4'>
        <span className='inline-block text-sm font-semibold tracking-widest text-[#0e7490] uppercase mb-4 bg-white/80 rounded-full px-4 py-1'>
          {d.badge}
        </span>
        <h1 className='mb-4 text-4xl font-bold md:text-6xl text-center text-[#0f172a] leading-tight'>
          {d.title}
        </h1>
        <p className='mx-auto max-w-lg text-[#0f172a]/80 text-base sm:text-lg mb-2'>
          {d.subtitle}
        </p>
        <p className='mx-auto mb-6 max-w-lg text-[#0f172a]/70 text-sm sm:text-base'>
          {d.description}
        </p>
        <div className='flex flex-col sm:flex-row gap-3 items-center justify-center mt-8'>
          <Link
            href='/booking'
            className='w-full sm:w-auto inline-block rounded-lg bg-[#0e7490] hover:bg-[#005a71] px-8 py-3.5 text-center text-sm font-bold text-white transition-colors'>
            {d.cta_label}
          </Link>
        </div>
      </div>
    </HeroContainer>
  )
}
export default Hero
