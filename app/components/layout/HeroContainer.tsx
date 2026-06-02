import Image from 'next/image'

function HeroContainer({
  backgroundImage,
  children,
}: {
  backgroundImage: string
  children: React.ReactNode
}) {
  return (
    <section className='hero-container'>
      <Image
        priority
        className='object-cover'
        src={backgroundImage}
        alt='Odonto Prime Studio – Clínica Odontológica'
        loading='eager'
        fill
      />
      {/* children includes hero-gradient div + content */}
      {children}
    </section>
  )
}

export default HeroContainer
