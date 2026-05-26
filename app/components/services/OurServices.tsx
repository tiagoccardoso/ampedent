import { getSectionSettings, getSectionBlocks, DEFAULT_SERVICES_PAGE, DEFAULT_SERVICES_PAGE_ITEMS } from '@/lib/site-content'

async function OurServices() {
  const [s, blocks] = await Promise.all([
    getSectionSettings('services_page'),
    getSectionBlocks('services_page_items'),
  ])
  const pageHeading = s.page_heading || DEFAULT_SERVICES_PAGE.page_heading
  const items = blocks.length > 0 ? blocks : DEFAULT_SERVICES_PAGE_ITEMS

  return (
    <section
      className='mx-auto w-full max-w-[1400px] md:py-20 lg:py-26 mt-8 px-4 md:px-0'
      id='services'>
      <h2 className='text-center text-3xl font-bold md:text-5xl mt-8'>{pageHeading}</h2>

      <div className='grid md:grid-cols-2 grid-cols-1 md:gap-8 gap-6 max-w-[1400px] w-full mx-auto md:justify-stretch my-32 text-balance'>
        {items.map((item, i) => (
          <div
            key={i}
            className={`bg-sky-50 p-8 border border-solid border-black rounded${item.extra?.is_full_width === 'true' ? ' md:col-span-2' : ''}`}>
            <h2 className='text-3xl font-bold'>{item.title}</h2>
            <hr className='w-40 my-8 border-2 border-black' />
            {item.description && (
              <p className='mt-4 whitespace-pre-line'>{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
export default OurServices
