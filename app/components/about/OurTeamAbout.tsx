import Image from 'next/image'
import type { TeamMember } from '@/lib/siteContent'

export default function OurTeamAbout({ members }: { members: TeamMember[] }) {
  if (members.length === 0) return null

  return (
    <section className='mx-auto w-full max-w-[1280px] px-5 py-16 md:px-10 md:py-24'>
      <h2
        className='text-center text-3xl font-extrabold md:text-4xl text-[#003441]'
        style={{ fontFamily: 'Manrope, sans-serif' }}>
        Nossa equipe
      </h2>
      <p className='mx-auto mb-10 mt-4 max-w-lg text-center text-[#70787c] text-sm md:mb-16'>
        Conheça os profissionais dedicados ao seu sorriso saudável
      </p>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {members.map(member => (
          <div
            key={member.id}
            className='bg-white rounded-2xl border border-[#e6e8e9] overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
            {member.image_url ? (
              <div className='relative h-56 w-full'>
                <Image
                  src={member.image_url}
                  alt={`Foto de ${member.name}`}
                  fill
                  className='object-cover'
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                />
              </div>
            ) : (
              <div className='h-56 w-full bg-[#f2f4f5] flex items-center justify-center'>
                <svg width='48' height='48' viewBox='0 0 28 28' fill='none' className='text-[#c0c8cb]'>
                  <path
                    d='M14 3C10 3 6 6 6 10C6 13 8 15 8 17.5C8 21 10 25 12.5 25C13.8 25 14.5 22 14 22C13.5 22 14.2 25 15.5 25C18 25 20 21 20 17.5C20 15 22 13 22 10C22 6 18 3 14 3Z'
                    fill='currentColor'
                  />
                </svg>
              </div>
            )}
            <div className='p-5'>
              <h3 className='font-bold text-[#003441] text-base' style={{ fontFamily: 'Manrope, sans-serif' }}>
                {member.name}
              </h3>
              {member.role && (
                <p
                  className='text-xs font-bold tracking-[0.08em] uppercase mt-0.5 mb-3'
                  style={{ color: '#cca730', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {member.role}
                </p>
              )}
              {member.description && (
                <p className='text-sm text-[#40484b] leading-relaxed'>{member.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
