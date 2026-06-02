import Link from 'next/link'

const services = [
  {
    icon: '🛡️',
    title: 'Cuidados preventivos',
    desc: 'Exames regulares, limpezas, radiografias e orientações de cuidados em casa para manter sua saúde bucal em dia.',
    tag: 'Prevenção',
  },
  {
    icon: '🦷',
    title: 'Implantes dentários',
    desc: 'Implantes de titânio com tecnologia digital para devolver função e estética ao seu sorriso com segurança e durabilidade.',
    tag: 'Restauração',
  },
  {
    icon: '✨',
    title: 'Estética dental',
    desc: 'Facetas de porcelana, clareamento avançado e bonding dental para um sorriso que impressiona.',
    tag: 'Estética',
  },
  {
    icon: '⚙️',
    title: 'Ortodontia',
    desc: 'Aparelhos convencionais e alinhadores invisíveis (Invisalign) para pacientes de todas as idades.',
    tag: 'Alinhamento',
  },
  {
    icon: '🌿',
    title: 'Cuidados periodontais',
    desc: 'Diagnóstico e tratamento de gengivite e periodontite para preservar o tecido que sustenta seus dentes.',
    tag: 'Periodontal',
  },
  {
    icon: '🚨',
    title: 'Urgência odontológica',
    desc: 'Atendimento rápido para dores, fraturas e emergências. Estamos preparados para cuidar de você quando mais precisa.',
    tag: 'Urgência',
  },
]

export default function Services() {
  return (
    <section className='w-full py-24 px-5 bg-[#f8fafb]'>
      <div className='mx-auto max-w-[1280px]'>
        {/* Header */}
        <div className='text-center mb-16'>
          <div className='section-chip mb-5 mx-auto'>Especialidades</div>
          <h2
            className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#003441] tracking-tight leading-tight'
            style={{ fontFamily: 'Manrope, sans-serif' }}>
            Torne cada etapa <br />
            <span
              className='relative inline-block px-3'
              style={{
                background: 'linear-gradient(135deg, #003441, #30628a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              centrada no paciente
            </span>
          </h2>
          <p className='mt-5 text-[#40484b] max-w-xl mx-auto leading-relaxed'>
            Oferecemos tratamentos completos com tecnologia de última geração e equipe especializada para cuidar do seu sorriso em todas as fases da vida.
          </p>
        </div>

        {/* Cards grid */}
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {services.map(({ icon, title, desc, tag }) => (
            <div
              key={title}
              className='group relative rounded-2xl p-7 bg-white transition-all duration-300 hover:-translate-y-2'
              style={{ boxShadow: '0 4px 20px rgba(15,76,92,0.07)', border: '1px solid #e6e8e9' }}>

              {/* Tag badge */}
              <span
                className='inline-block mb-5 text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1 rounded-full'
                style={{
                  background: 'rgba(154,206,225,0.15)',
                  color: '#003441',
                  border: '1px solid rgba(0,52,65,0.12)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                {tag}
              </span>

              {/* Icon */}
              <div className='text-3xl mb-4'>{icon}</div>

              {/* Content */}
              <h3 className='text-[#003441] font-bold text-lg mb-3' style={{ fontFamily: 'Manrope, sans-serif' }}>
                {title}
              </h3>
              <p className='text-[#40484b] text-sm leading-relaxed'>{desc}</p>

              {/* Hover accent line */}
              <div
                className='absolute bottom-0 left-0 h-1 rounded-b-2xl transition-all duration-300 w-0 group-hover:w-full'
                style={{ background: 'linear-gradient(90deg, #003441, #cca730)' }}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className='text-center mt-14'>
          <Link
            href='/services'
            className='btn-primary inline-flex'>
            Ver todos os serviços →
          </Link>
        </div>
      </div>
    </section>
  )
}
