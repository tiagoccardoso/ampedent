import Link from 'next/link'
import { getSiteContent, getHomeStats } from '@/lib/siteContent'
import HeroContainer from '../layout/HeroContainer'
import heroImg from '@/public/hero.webp'

async function Hero() {
  const content = await getSiteContent()
  const home = content.home
  const stats = getHomeStats(content)

  const title = home.title || 'Seu sorriso merece excelência'
  const subtitle = home.subtitle || 'Tecnologia de ponta, cuidado humanizado'
  const body = home.body || 'Tratamentos odontológicos premium com especialistas dedicados ao seu sorriso e bem-estar.'

  return (
    <HeroContainer backgroundImage={home.image_url || heroImg.src}>
      {/* Full-screen gradient overlay */}
      <div className='hero-gradient' />

      <div className='relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-5 text-center py-24'>
        {/* Badge */}
        <div
          className='inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-white/20 text-white/80'
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
          <span className='w-1.5 h-1.5 rounded-full bg-[#cca730] animate-pulse' />
          <span
            className='text-xs font-bold tracking-[0.12em] uppercase'
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Odontologia de Alto Padrão
          </span>
        </div>

        {/* Headline */}
        <h1
          className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.08] tracking-tight max-w-4xl'
          style={{ fontFamily: 'Manrope, sans-serif', textShadow: '0 2px 24px rgba(0,0,0,0.3)' }}>
          {title}
        </h1>

        {/* Subtitle */}
        <p className='text-lg sm:text-xl font-semibold text-[#9acee1] mb-3 tracking-wide'>
          {subtitle}
        </p>

        {/* Body */}
        <p className='text-base sm:text-lg text-white/75 max-w-xl leading-relaxed mb-12'>
          {body}
        </p>

        {/* CTA buttons */}
        <div className='flex flex-col sm:flex-row gap-4 items-center justify-center'>
          <Link
            href='/agenda'
            className='px-8 py-4 rounded-lg font-bold text-sm text-white transition-all duration-200 hover:-translate-y-1'
            style={{
              background: 'linear-gradient(135deg, #cca730 0%, #e9c349 100%)',
              boxShadow: '0 8px 24px rgba(204,167,48,0.35)',
              color: '#003441',
              fontFamily: 'Manrope, sans-serif',
              letterSpacing: '0.04em',
            }}>
            ✦ Agendar Consulta
          </Link>
          <Link
            href='/services'
            className='px-8 py-4 rounded-lg font-semibold text-sm text-white border border-white/25 hover:bg-white/10 transition-all duration-200'
            style={{ backdropFilter: 'blur(8px)', fontFamily: 'Manrope, sans-serif' }}>
            Nossos Serviços →
          </Link>
        </div>

        {/* Stats strip — only rendered when stats are configured */}
        {stats.length > 0 && (
          <div
            className='mt-20 grid gap-px rounded-2xl overflow-hidden max-w-lg w-full mx-auto'
            style={{
              gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
            {stats.map(({ value, label }) => (
              <div key={label} className='flex flex-col items-center justify-center py-5 px-3'>
                <span className='text-2xl sm:text-3xl font-extrabold text-white mb-1'>{value}</span>
                <span
                  className='text-[10px] text-white/60 font-semibold tracking-[0.08em] uppercase text-center'
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Scroll hint */}
        <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce'>
          <span className='text-white/40 text-xs' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SCROLL</span>
          <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
            <path d='M5 8L10 13L15 8' stroke='rgba(255,255,255,0.4)' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </div>
      </div>
    </HeroContainer>
  )
}

export default Hero
