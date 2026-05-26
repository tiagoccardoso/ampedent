import Link from 'next/link'
import Science from '../Icons/Science'
import RoundGraphic from '../Icons/RoundGraphic'
import Checkmark from '../Icons/Checkmark'
import Comfort from '../Icons/Comfort'
import Confidence from '../Icons/Confidence'
import { getSectionSettings, getSectionBlocks, DEFAULT_BENEFITS, DEFAULT_BENEFITS_HEADING, type BenefitIconKey } from '@/lib/site-content'

const ICON_MAP: Record<BenefitIconKey, React.ReactNode> = {
  checkmark: <Checkmark />,
  comfort: <Comfort />,
  science: <Science />,
  confidence: <Confidence />,
}

async function HeroBenefits() {
  const [settings, blocks] = await Promise.all([
    getSectionSettings('benefits'),
    getSectionBlocks('benefits'),
  ])

  const heading = settings.heading || DEFAULT_BENEFITS_HEADING
  const items = blocks.length > 0 ? blocks : DEFAULT_BENEFITS

  return (
    <section className='bg-[#0e7490] w-full'>
      <div className='mx-auto max-w-5xl px-5 py-20 md:py-28'>
        <h3 className='text-white text-3xl md:text-5xl font-bold text-center mb-12 md:mb-16'>
          {heading}
        </h3>

        <div className='relative grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div className='absolute -left-[30%] top-1/2 -translate-y-1/2 hidden lg:block opacity-10'>
            <RoundGraphic />
          </div>
          {items.map((b, i) => {
            const iconKey = (b.extra?.icon_key as BenefitIconKey) || 'checkmark'
            return (
              <div key={i} className='flex gap-4 items-start bg-white/10 rounded-xl p-5 backdrop-blur-sm'>
                <div className='flex-shrink-0'>{ICON_MAP[iconKey] ?? <Checkmark />}</div>
                <div>
                  <h4 className='text-white text-lg font-bold tracking-wide mb-1'>{b.title}</h4>
                  <p className='text-white/80 text-sm leading-relaxed'>{b.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className='text-center mt-12'>
          <Link
            href='/about#mission'
            aria-label='Saiba mais sobre nossa missão e valores'
            className='inline-block rounded-lg bg-white text-[#0e7490] px-8 py-3 text-sm font-semibold hover:bg-[#f0f9ff] transition-colors'>
            Saiba mais
          </Link>
        </div>
      </div>
    </section>
  )
}
export default HeroBenefits
