import Link from 'next/link'
import { getSectionSettings, getSectionBlocks, DEFAULT_SERVICES, DEFAULT_SERVICES_HEADING, DEFAULT_SERVICES_SUBHEADING } from '@/lib/site-content'

async function Services() {
  const [settings, blocks] = await Promise.all([
    getSectionSettings('services'),
    getSectionBlocks('services'),
  ])

  const heading = settings.heading || DEFAULT_SERVICES_HEADING
  const subheading = settings.subheading || DEFAULT_SERVICES_SUBHEADING
  const services = blocks.length > 0 ? blocks : DEFAULT_SERVICES

  return (
    <section className='bg-[#f8f9ff]'>
      <div className='mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24'>
        <div className='mx-auto w-full max-w-3xl text-center mb-12 md:mb-16'>
          <h2 className='text-2xl font-bold md:text-4xl text-[#0f172a] mb-4'>
            {heading}
          </h2>
          <p className='text-[#64748b] text-sm md:text-base max-w-xl mx-auto'>
            {subheading}
          </p>
        </div>

        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3'>
          {services.map((s, i) => {
            const iconUrl = s.extra?.icon_url || null
            return (
              <div
                key={i}
                className='bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-card hover:shadow-card-hover transition-shadow'>
                {iconUrl && (
                  <div className='w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center mb-4'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={iconUrl} alt={s.title || ''} height={22} width={22} loading='lazy' />
                  </div>
                )}
                <h3 className='text-base font-semibold text-[#0f172a] mb-2'>{s.title}</h3>
                <p className='text-sm text-[#64748b] leading-relaxed'>{s.description}</p>
              </div>
            )
          })}
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
