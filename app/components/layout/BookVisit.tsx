import Link from 'next/link'
import { getSectionSettings, DEFAULT_CTA } from '@/lib/site-content'

async function BookVisit() {
  const db = await getSectionSettings('cta')
  const d = { ...DEFAULT_CTA, ...db }

  return (
    <section className='bg-[#0e7490] w-full'>
      <div className='mx-auto max-w-3xl px-5 py-20 md:py-28 text-center'>
        <h4 className='font-bold text-3xl md:text-4xl text-white mb-4'>
          {d.title}
        </h4>
        <p className='text-white/80 text-base md:text-lg mt-4 max-w-lg mx-auto'>
          {d.subtitle}
          {d.promo && (
            <><br /><span className='font-semibold text-white'>{d.promo}</span></>
          )}
        </p>
        <Link
          href='/booking'
          className='mt-10 inline-block rounded-lg bg-white text-[#0e7490] px-8 py-3 text-sm font-bold hover:bg-[#f0f9ff] transition-colors'>
          {d.button_label}
        </Link>
      </div>
    </section>
  )
}
export default BookVisit
