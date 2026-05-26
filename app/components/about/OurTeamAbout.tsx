import { getSectionSettings, getSectionBlocks, DEFAULT_TEAM_HEADING, DEFAULT_TEAM_SUBHEADING } from '@/lib/site-content'

async function OurTeamAbout() {
  const [settings, blocks] = await Promise.all([
    getSectionSettings('team'),
    getSectionBlocks('team'),
  ])

  if (blocks.length === 0) return null

  const heading = settings.heading || DEFAULT_TEAM_HEADING
  const subheading = settings.subheading || DEFAULT_TEAM_SUBHEADING

  return (
    <section className='mx-auto w-full max-w-[1400px] px-5 py-16 md:px-10 md:py-24 lg:py-32'>
      <h2 className='text-center text-3xl font-bold md:text-5xl'>{heading}</h2>
      <p className='mx-auto mb-8 mt-4 max-w-lg text-center text-slate-500 md:mb-16'>{subheading}</p>

      <div className='grid md:grid-cols-2 gap-6'>
        {blocks.map((member, i) => {
          const anchorId = member.extra?.link?.replace('/about/#', '') || undefined
          const isFlipped = i % 2 !== 0
          return (
            <div key={i} className='p-2 border border-solid border-black rounded md:grid grid-cols-2 gap-6' id={anchorId}>
              {!isFlipped ? (
                <>
                  {member.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.image_url} alt={member.image_alt || member.title || ''} className='object-cover w-full rounded' loading='lazy' />
                  )}
                  <div className='mt-4 md:mt-0 p-2'>
                    <h3 className='font-bold text-lg'>{member.title}</h3>
                    {member.subtitle && <p className='text-sm text-slate-500'>({member.subtitle})</p>}
                    {member.description && <p className='text-sm text-slate-600 mt-4'>{member.description}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div className='order-2 sm:order-1 mt-4 md:mt-0 p-2'>
                    <h3 className='font-bold text-lg'>{member.title}</h3>
                    {member.subtitle && <p className='text-sm text-slate-500'>({member.subtitle})</p>}
                    {member.description && <p className='text-sm text-slate-600 mt-4'>{member.description}</p>}
                  </div>
                  {member.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.image_url} alt={member.image_alt || member.title || ''} className='order-1 sm:order-2 object-cover w-full rounded' loading='lazy' />
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
export default OurTeamAbout
