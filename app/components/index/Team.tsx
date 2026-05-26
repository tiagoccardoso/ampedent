import Link from 'next/link'
import { getSectionSettings, getSectionBlocks, DEFAULT_TEAM, DEFAULT_TEAM_HEADING, DEFAULT_TEAM_SUBHEADING } from '@/lib/site-content'

async function Team() {
  const [settings, blocks] = await Promise.all([
    getSectionSettings('team'),
    getSectionBlocks('team'),
  ])

  const heading = settings.heading || DEFAULT_TEAM_HEADING
  const subheading = settings.subheading || DEFAULT_TEAM_SUBHEADING
  const members = blocks.length > 0 ? blocks : DEFAULT_TEAM

  return (
    <section className='bg-white'>
      <div className='mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-24'>
        <div className='text-center mb-12'>
          <h2 className='text-2xl font-bold md:text-4xl text-[#0f172a]'>{heading}</h2>
          <p className='mx-auto mt-3 max-w-lg text-[#64748b] text-sm md:text-base'>
            {subheading}
          </p>
        </div>

        <div className='grid gap-5 sm:grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto'>
          {members.map((m, i) => {
            const href = m.extra?.link || '/about'
            return (
              <Link
                key={i}
                href={href}
                aria-label={`Sobre ${m.title}`}
                className='group bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-card hover:shadow-card-hover transition-shadow text-center'>
                <div className='overflow-hidden'>
                  {m.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.image_url}
                      alt={m.image_alt || `Foto de ${m.title}`}
                      className='h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300'
                      loading='lazy'
                    />
                  )}
                </div>
                <div className='p-4'>
                  <p className='font-semibold text-[#0f172a] text-sm'>{m.title}</p>
                  <p className='text-xs text-[#0e7490] font-medium mt-0.5'>{m.subtitle}</p>
                  <p className='text-xs text-[#64748b] mt-1'>{m.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
export default Team
