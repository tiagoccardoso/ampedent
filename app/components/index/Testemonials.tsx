import { getSectionSettings, getSectionBlocks, DEFAULT_TESTIMONIALS_HEADING, DEFAULT_TESTIMONIALS_SUBHEADING } from '@/lib/site-content'

const Stars = () => (
  <div className='flex gap-0.5' aria-label='5 estrelas'>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className='w-4 h-4 text-[#f59e0b]' fill='currentColor' viewBox='0 0 20 20'>
        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
      </svg>
    ))}
  </div>
)

async function Testemonials() {
  const [settings, blocks] = await Promise.all([
    getSectionSettings('testimonials'),
    getSectionBlocks('testimonials'),
  ])

  if (blocks.length === 0) return null

  const heading = settings.heading || DEFAULT_TESTIMONIALS_HEADING
  const subheading = settings.subheading || DEFAULT_TESTIMONIALS_SUBHEADING

  return (
    <section className='bg-[#f8f9ff]'>
      <div className='mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-24'>
        <div className='text-center mb-12'>
          <h2 className='text-2xl font-bold md:text-4xl text-[#0f172a]'>{heading}</h2>
          <p className='mt-3 text-[#64748b] text-sm md:text-base'>{subheading}</p>
        </div>

        <ul className='grid gap-5 sm:grid-cols-2 md:grid-cols-3'>
          {blocks.map((t, i) => (
            <li
              key={i}
              className='bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-card flex flex-col gap-4'>
              <Stars />
              <p className='text-[#64748b] text-sm leading-relaxed flex-grow'>{t.description}</p>
              <div className='flex items-center gap-3'>
                {t.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.image_url}
                    alt={t.image_alt || t.title || ''}
                    className='rounded-full object-cover flex-shrink-0 h-11 w-11'
                    loading='lazy'
                  />
                )}
                <div>
                  <p className='font-semibold text-[#0f172a] text-sm'>{t.title}</p>
                  <p className='text-xs text-[#64748b]'>Paciente verificado</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
export default Testemonials
