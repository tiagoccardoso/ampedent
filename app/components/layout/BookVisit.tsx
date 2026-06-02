import Link from 'next/link'

export default function BookVisit() {
  return (
    <section className='w-full py-24 px-5 relative overflow-hidden'>
      {/* Background */}
      <div
        className='absolute inset-0'
        style={{
          background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 55%, #30628a 100%)',
        }}
      />
      {/* Decorative orbs */}
      <div
        className='absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-15 pointer-events-none'
        style={{ background: 'radial-gradient(circle, #cca730 0%, transparent 70%)' }}
      />
      <div
        className='absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10 pointer-events-none'
        style={{ background: 'radial-gradient(circle, #9acee1 0%, transparent 70%)' }}
      />

      <div className='relative z-10 mx-auto max-w-[1280px] flex flex-col lg:flex-row items-center justify-between gap-12'>
        {/* Text */}
        <div className='text-center lg:text-left max-w-2xl'>
          <div
            className='inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.12em] uppercase'
            style={{
              background: 'rgba(204,167,48,0.2)',
              border: '1px solid rgba(204,167,48,0.4)',
              color: '#e9c349',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
            ✦ Consulta online disponível
          </div>
          <h2
            className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5'
            style={{ fontFamily: 'Manrope, sans-serif' }}>
            Agende sua consulta <br />
            <span style={{ color: '#9acee1' }}>com facilidade</span>
          </h2>
          <p className='text-white/70 text-lg leading-relaxed mb-2'>
            Veja os horários disponíveis e aproveite a odontologia bem feita.
          </p>
          <p className='text-[#cca730] font-semibold text-sm'>
            ✓ Clareamento dental cortesia na primeira consulta
          </p>
        </div>

        {/* Card */}
        <div
          className='rounded-2xl p-8 max-w-sm w-full'
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
          <p
            className='text-xs font-bold tracking-[0.1em] uppercase text-[#9acee1] mb-4'
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Agendamento rápido
          </p>
          <ul className='space-y-3 mb-8'>
            {[
              'Escolha o procedimento',
              'Selecione data e horário',
              'Confirme sua consulta',
            ].map((step, i) => (
              <li key={step} className='flex items-center gap-3 text-white/80 text-sm' style={{ listStyle: 'none' }}>
                <span
                  className='w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0'
                  style={{ background: '#cca730', color: '#003441' }}>
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
          <Link
            href='/agenda'
            className='block text-center w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-1'
            style={{
              background: 'linear-gradient(135deg, #cca730 0%, #e9c349 100%)',
              color: '#003441',
              fontFamily: 'Manrope, sans-serif',
              boxShadow: '0 8px 24px rgba(204,167,48,0.3)',
              letterSpacing: '0.04em',
            }}>
            ✦ AGENDAR AGORA
          </Link>
        </div>
      </div>
    </section>
  )
}
