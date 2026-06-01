import Hero from './components/index/Hero'
import HeroBenefits from './components/index/HeroBenefits'
import Services from './components/index/Services'
import BookVisit from './components/layout/BookVisit'

export default function Home() {
  return (
    <>
      <main className='flex flex-col items-center justify-between '>
        <Hero />
        <HeroBenefits />
        <Services />
        <BookVisit />
      </main>
    </>
  )
}
