import Image from 'next/image'
import doc1 from '@/public/doc1.webp'
import doc2 from '@/public/doc2.webp'
import doc3 from '@/public/doc3.webp'
import doc4 from '@/public/doc4.webp'
import Link from 'next/link'

const members = [
  { src: doc1, name: 'Dr. Daniel Lee', role: 'Dentista', spec: 'Mestre dos sorrisos', href: '/about/#daniel' },
  { src: doc2, name: 'Dra. Sarah Green', role: 'Odontopediatra', spec: 'Toque gentil', href: '/about/#sarah' },
  { src: doc4, name: 'Dra. Emily Rose', role: 'Dentista estética', spec: 'Artista da precisão', href: '/about/#emily' },
  { src: doc3, name: 'Dr. Michael White', role: 'Endodontista', spec: 'Especialista em restauração', href: '/about/#michael' },
]

function Team() {
  return (
    <section className='bg-white'>
      <div className='mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-24'>
        <div className='text-center mb-12'>
          <h2 className='text-2xl font-bold md:text-4xl text-[#0f172a]'>Nossa equipe</h2>
          <p className='mx-auto mt-3 max-w-lg text-[#64748b] text-sm md:text-base'>
            Conheça as mãos habilidosas e os corações gentis por trás do seu sorriso saudável
          </p>
        </div>

        <div className='grid gap-5 sm:grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto'>
          {members.map(m => (
            <Link
              key={m.name}
              href={m.href}
              aria-label={`Sobre ${m.name}`}
              className='group bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-card hover:shadow-card-hover transition-shadow text-center'>
              <div className='overflow-hidden'>
                <Image
                  height={208}
                  width={208}
                  src={m.src}
                  alt={`Foto de ${m.name}`}
                  className='h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300'
                />
              </div>
              <div className='p-4'>
                <p className='font-semibold text-[#0f172a] text-sm'>{m.name}</p>
                <p className='text-xs text-[#0e7490] font-medium mt-0.5'>{m.role}</p>
                <p className='text-xs text-[#64748b] mt-1'>{m.spec}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
export default Team
