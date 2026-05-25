import Link from 'next/link'
import hero from '@/public/hero.webp'
import HeroContainer from '../layout/HeroContainer'

function Hero() {
  return (
    <HeroContainer backgroundImage={hero.src}>
      <div className='mx-auto w-full max-w-3xl text-center mt-32 p-4'>
        <span className='inline-block text-sm font-semibold tracking-widest text-[#0e7490] uppercase mb-4 bg-white/80 rounded-full px-4 py-1'>
          Deixe-nos ajudar você
        </span>
        <h1 className='mb-4 text-4xl font-bold md:text-6xl text-center text-[#0f172a] leading-tight'>
          Reconecte-se com o seu sorriso
        </h1>
        <p className='mx-auto max-w-lg text-[#0f172a]/80 text-base sm:text-lg mb-2'>
          DentalSys — Uma nova abordagem para o conforto odontológico
        </p>
        <p className='mx-auto mb-6 max-w-lg text-[#0f172a]/70 text-sm sm:text-base'>
          Torne seu sorriso perfeito ainda melhor
        </p>
        <div className='flex flex-col sm:flex-row gap-3 items-center justify-center mt-8'>
          <Link
            href='/booking'
            className='w-full sm:w-auto inline-block rounded-lg bg-[#0e7490] hover:bg-[#005a71] px-8 py-3.5 text-center text-sm font-bold text-white transition-colors'>
            AGENDAR ONLINE
          </Link>
          <Link
            href='/admin'
            className='w-full sm:w-auto inline-block rounded-lg border border-[#0e7490] text-[#0e7490] bg-white/80 hover:bg-white px-8 py-3.5 text-center text-sm font-semibold transition-colors'>
            ENTRAR
          </Link>
        </div>
      </div>
    </HeroContainer>
  )
}
export default Hero
