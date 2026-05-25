import Link from 'next/link'

const services = [
  {
    icon: 'https://www.svgrepo.com/show/318498/tooth-shield.svg',
    title: 'Cuidados preventivos',
    desc: 'Exames regulares, limpezas, radiografias e orientações para manter sua saúde bucal e evitar doenças.',
  },
  {
    icon: 'https://www.svgrepo.com/show/382221/dental-implant-health-healthcare-medical-medicine-pharmacy.svg',
    title: 'Serviços restauradores',
    desc: 'Restaurações, coroas, pontes, implantes, tratamento de canal e próteses para devolver a saúde à sua boca.',
  },
  {
    icon: 'https://www.svgrepo.com/show/318582/tooth-clean.svg',
    title: 'Procedimentos estéticos',
    desc: 'Clareamento dental, facetas e bonding para melhorar o seu sorriso com segurança e precisão.',
  },
  {
    icon: 'https://www.svgrepo.com/show/100660/braces.svg',
    title: 'Ortodontia',
    desc: 'Tratamento ortodôntico completo para todas as idades, incluindo aparelhos convencionais e Invisalign.',
  },
  {
    icon: 'https://www.svgrepo.com/show/318498/tooth-shield.svg',
    title: 'Cuidados periodontais',
    desc: 'Diagnóstico e tratamento de condições que afetam a gengiva e o osso de suporte dos dentes.',
  },
  {
    icon: 'https://www.svgrepo.com/show/318572/tooth-health.svg',
    title: 'Urgência odontológica',
    desc: 'Atendimento emergencial para a maioria das urgências odontológicas, quando você mais precisa.',
  },
]

function Services() {
  return (
    <section className='bg-[#f8f9ff]'>
      <div className='mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24'>
        <div className='mx-auto w-full max-w-3xl text-center mb-12 md:mb-16'>
          <h2 className='text-2xl font-bold md:text-4xl text-[#0f172a] mb-4'>
            Torne cada etapa{' '}
            <span className='text-[#0e7490]'>centrada no paciente</span>
          </h2>
          <p className='text-[#64748b] text-sm md:text-base max-w-xl mx-auto'>
            Nossa equipe está sempre pronta para ajudar com dúvidas odontológicas, garantindo cuidado e atenção em cada consulta.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3'>
          {services.map(s => (
            <div
              key={s.title}
              className='bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-card hover:shadow-card-hover transition-shadow'>
              <div className='w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center mb-4'>
                <img src={s.icon} alt={s.title} height={22} width={22} loading='lazy' />
              </div>
              <h3 className='text-base font-semibold text-[#0f172a] mb-2'>{s.title}</h3>
              <p className='text-sm text-[#64748b] leading-relaxed'>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className='text-center mt-10'>
          <Link
            href='/services'
            className='inline-block rounded-lg border border-[#0e7490] text-[#0e7490] px-8 py-3 text-sm font-semibold hover:bg-[#f0f9ff] transition-colors'>
            Ver todos os serviços
          </Link>
        </div>
      </div>
    </section>
  )
}
export default Services
