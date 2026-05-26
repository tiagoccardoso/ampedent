import { getSectionSettings, DEFAULT_ABOUT } from '@/lib/site-content'

async function OurMission() {
  const s = await getSectionSettings('about')
  const about = { ...DEFAULT_ABOUT, ...s }

  return (
    <section className='my-16' id='mission'>
      <div className='mx-auto w-full max-w-[1400px] px-5 py-16 md:px-10 md:py-12 lg:py-16'>
        <h2 className='mb-8 text-3xl font-bold md:text-5xl lg:mb-14'>{about.heading}</h2>
        <p className='mb-8 text-sm text-slate-800 sm:text-base lg:mb-24 whitespace-pre-line'>{about.intro_text}</p>
        <div className='grid gap-10 lg:grid-cols-2 lg:gap-12'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={about.image_url}
            alt='imagem de paciente sorrindo'
            className='object-contain rounded'
            loading='lazy'
          />
          <div className='flex flex-col gap-5 rounded-2xl border border-solid border-black p-10 sm:p-20'>
            <h2 className='text-3xl font-bold md:text-5xl'>{about.mission_heading}</h2>
            <p className='text-sm text-slate-800 sm:text-base whitespace-pre-line'>{about.mission_text}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
export default OurMission
