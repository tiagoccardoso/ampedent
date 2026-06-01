import Link from 'next/link'

const benefits = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 4C10 4 6 7 6 11C6 14 8 16.5 8 19C8 23 10.5 25 13 25C14 25 14.5 22 14 22C13.5 22 14 25 15 25C17.5 25 20 23 20 19C20 16.5 22 14 22 11C22 7 18 4 14 4Z" fill="currentColor"/>
      </svg>
    ),
    title: 'Qualidade',
    subtitle: 'Especialistas guiados pela ciência',
    desc: 'Nossa equipe é formada por especialistas certificados, atualizados com as mais recentes pesquisas e tecnologias odontológicas.',
    color: '#9acee1',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 3L17.5 10.5L26 11.5L20 17L21.5 25L14 21L6.5 25L8 17L2 11.5L10.5 10.5L14 3Z" fill="currentColor"/>
      </svg>
    ),
    title: 'Conforto',
    subtitle: 'Ambiente relaxante e acolhedor',
    desc: 'Espaço projetado para proporcionar tranquilidade e conforto, transformando sua experiência odontológica em algo agradável.',
    color: '#cca730',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M9 14L12.5 17.5L19 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Tecnologia',
    subtitle: 'Ferramentas de última geração',
    desc: 'Equipamentos digitais de última geração para diagnósticos precisos, tratamentos mais rápidos e resultados superiores.',
    color: '#9acee1',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 4C8.5 4 4 8.5 4 14C4 19.5 8.5 24 14 24C19.5 24 24 19.5 24 14C24 8.5 19.5 4 14 4Z" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M14 8V14L18 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Confiança',
    subtitle: 'Sorria com mais brilho do que nunca',
    desc: 'Mais de 15 anos de experiência com milhares de sorrisos transformados. Sua satisfação é nossa maior conquista.',
    color: '#cca730',
  },
]

export default function HeroBenefits() {
  return (
    <section className='w-full bg-[#003441] py-24 px-5 relative overflow-hidden'>
      {/* Background texture */}
      <div
        className='absolute inset-0 pointer-events-none opacity-5'
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #9acee1 0%, transparent 50%),
                            radial-gradient(circle at 80% 50%, #cca730 0%, transparent 50%)`,
        }}
      />

      <div className='relative z-10 mx-auto max-w-[1280px]'>
        {/* Header */}
        <div className='text-center mb-16'>
          <div className='section-chip mb-5 mx-auto' style={{ background: 'rgba(154,206,225,0.15)', borderColor: 'rgba(154,206,225,0.3)', color: '#9acee1' }}>
            Por que nos escolher
          </div>
          <h2
            className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight'
            style={{ fontFamily: 'Manrope, sans-serif' }}>
            Sinta-se incrível <br />
            <span style={{ color: '#9acee1' }}>com a sua saúde bucal</span>
          </h2>
        </div>

        {/* Benefits grid */}
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {benefits.map(({ icon, title, subtitle, desc, color }) => (
            <div
              key={title}
              className='group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1'
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
              }}>
              <div
                className='w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110'
                style={{ background: `${color}20`, color }}>
                {icon}
              </div>
              <h3 className='text-white font-bold text-lg mb-1' style={{ fontFamily: 'Manrope, sans-serif' }}>
                {title}
              </h3>
              <p
                className='mb-3 text-xs font-bold tracking-[0.08em] uppercase'
                style={{ color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {subtitle}
              </p>
              <p className='text-white/60 text-sm leading-relaxed'>{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className='text-center mt-14'>
          <Link
            href='/about#mission'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-sm transition-all duration-200 hover:-translate-y-1'
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              backdropFilter: 'blur(8px)',
              fontFamily: 'Manrope, sans-serif',
            }}>
            Conheça nossa missão →
          </Link>
        </div>
      </div>
    </section>
  )
}
