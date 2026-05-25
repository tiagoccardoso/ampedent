import Link from 'next/link'
import Science from '../Icons/Science'
import RoundGraphic from '../Icons/RoundGraphic'
import Checkmark from '../Icons/Checkmark'
import Comfort from '../Icons/Comfort'
import Confidence from '../Icons/Confidence'

const benefits = [
  {
    icon: <Checkmark />,
    title: 'QUALIDADE',
    desc: 'Especialistas guiados pela ciência',
  },
  {
    icon: <Comfort />,
    title: 'CONFORTO',
    desc: 'Atendimento relaxante em ambiente tranquilo',
  },
  {
    icon: <Science />,
    title: 'TECNOLOGIA',
    desc: 'As ferramentas mais recentes para uma experiência moderna',
  },
  {
    icon: <Confidence />,
    title: 'CONFIANÇA',
    desc: 'Sorria com mais brilho do que nunca',
  },
]

function HeroBenefits() {
  return (
    <section className='bg-[#0e7490] w-full'>
      <div className='mx-auto max-w-5xl px-5 py-20 md:py-28'>
        <h3 className='text-white text-3xl md:text-5xl font-bold text-center mb-12 md:mb-16'>
          Sinta-se incrível <br className='hidden md:block' /> com a sua saúde bucal
        </h3>

        <div className='relative grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div className='absolute -left-[30%] top-1/2 -translate-y-1/2 hidden lg:block opacity-10'>
            <RoundGraphic />
          </div>
          {benefits.map(b => (
            <div key={b.title} className='flex gap-4 items-start bg-white/10 rounded-xl p-5 backdrop-blur-sm'>
              <div className='flex-shrink-0'>{b.icon}</div>
              <div>
                <h4 className='text-white text-lg font-bold tracking-wide mb-1'>{b.title}</h4>
                <p className='text-white/80 text-sm leading-relaxed'>{b.desc}</p>
              </div>
            </div>
          ))}
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
