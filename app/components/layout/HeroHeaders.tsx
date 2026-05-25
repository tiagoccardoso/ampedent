import Link from 'next/link'

function HeroHeaders() {
  return (
    <div className='mx-auto w-full max-w-4xl text-center mt-32 px-4'>
      <h1 className='mb-6 text-3xl font-bold md:text-6xl text-center text-[#0f172a] leading-tight'>
        Construindo relacionamentos duradouros por meio de experiências positivas
      </h1>
      <div className='flex items-center justify-center mt-8'>
        <Link
          href='/booking'
          className='inline-block rounded-lg bg-[#0e7490] hover:bg-[#005a71] px-8 py-3.5 text-center text-sm font-bold text-white transition-colors'>
          AGENDAR ONLINE
        </Link>
      </div>
    </div>
  )
}
export default HeroHeaders
