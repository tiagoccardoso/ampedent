import Link from 'next/link'

function BookVisit() {
  return (
    <section className='bg-[#0e7490] w-full'>
      <div className='mx-auto max-w-3xl px-5 py-20 md:py-28 text-center'>
        <h4 className='font-bold text-3xl md:text-4xl text-white mb-4'>
          Agende sua consulta online
        </h4>
        <p className='text-white/80 text-base md:text-lg mt-4 max-w-lg mx-auto'>
          Veja os horários disponíveis e aproveite a odontologia bem feita.<br />
          <span className='font-semibold text-white'>+Clareamento dental grátis para sempre.</span>
        </p>
        <Link
          href='/booking'
          className='mt-10 inline-block rounded-lg bg-white text-[#0e7490] px-8 py-3 text-sm font-bold hover:bg-[#f0f9ff] transition-colors'>
          AGENDAR ONLINE
        </Link>
      </div>
    </section>
  )
}
export default BookVisit
