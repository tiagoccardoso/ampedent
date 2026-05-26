import { getSectionSettings, DEFAULT_SERVICES_PAGE } from '@/lib/site-content'

async function ServicesAbout() {
  const s = await getSectionSettings('services_page')
  const sp = { ...DEFAULT_SERVICES_PAGE, ...s }

  return (
    <section className='my-16'>
      <div className='mx-auto w-full max-w-[1400px] px-5 py-16 md:px-10 md:py-12 lg:py-16'>
        <div className='grid gap-10 lg:grid-cols-2 lg:gap-12'>
          <div className='flex flex-col gap-5 rounded-2xl p-4'>
            <h2 className='text-3xl font-bold md:text-5xl'>{sp.heading}</h2>
            <p className='text-sm text-slate-600 sm:text-base text-balance whitespace-pre-line'>{sp.text}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sp.image_url}
            alt='imagem de paciente sorrindo'
            className='object-contain rounded'
            loading='lazy'
          />
        </div>
      </div>
    </section>
  )
}
export default ServicesAbout
