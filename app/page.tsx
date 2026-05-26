import Testemonials from './components/index/Testemonials'
import Hero from './components/index/Hero'
import Team from './components/index/Team'
import HeroBenefits from './components/index/HeroBenefits'
import Services from './components/index/Services'
import BookVisit from './components/layout/BookVisit'

// Force SSR so CMS changes are reflected without a redeploy
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <>
      <main className='flex flex-col items-center justify-between '>
        <Hero />
        <HeroBenefits />
        <Team />
        <Services />
        <Testemonials />
        <BookVisit />
      </main>
    </>
  )
}
