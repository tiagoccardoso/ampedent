import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import AlignLeft from '../Icons/AlignLeft'
import AlignRight from '../Icons/AlignRight'

function Pagination({
  page,
  setPage,
  pages,
}: {
  page: number
  setPage: Dispatch<SetStateAction<number>>
  pages: number
}) {
  const [visiblePages, setVisiblePages] = useState<number[]>([])

  useEffect(() => {
    const visiblePageCount = 5
    const halfVisibleCount = Math.floor(visiblePageCount / 2)
    let startPage = page - halfVisibleCount
    let endPage = page + halfVisibleCount

    if (startPage <= 0) { startPage = 1; endPage = Math.min(pages, visiblePageCount) }
    if (endPage > pages) { endPage = pages; startPage = Math.max(1, pages - visiblePageCount + 1) }

    setVisiblePages(Array.from({ length: endPage - startPage + 1 }, (_, i) => i + startPage))
  }, [page, pages])

  return (
    <div className='flex items-center justify-between bg-white px-4 py-3 border-t border-[#e5e7eb] rounded-b-xl'>
      <div className='flex sm:hidden justify-between flex-1 gap-2'>
        <button
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          className='flex-1 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#64748b] hover:bg-[#f8f9ff] disabled:cursor-not-allowed disabled:opacity-50'>
          Anterior
        </button>
        <button
          disabled={page === pages}
          onClick={() => setPage(p => Math.min(p + 1, pages))}
          className='flex-1 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium text-[#64748b] hover:bg-[#f8f9ff] disabled:cursor-not-allowed disabled:opacity-50'>
          Próxima
        </button>
      </div>

      <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
        <p className='text-sm text-[#64748b]'>
          Página <span className='font-medium text-[#0f172a]'>{page}</span> de{' '}
          <span className='font-medium text-[#0f172a]'>{pages}</span>
        </p>
        <nav className='inline-flex gap-1' aria-label='Paginação'>
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            className='inline-flex items-center rounded-lg border border-[#e5e7eb] px-2 py-2 text-[#64748b] hover:bg-[#f8f9ff] disabled:cursor-not-allowed disabled:opacity-50'>
            <span className='sr-only'>Anterior</span>
            <AlignLeft aria-hidden='true' />
          </button>
          {visiblePages.map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              aria-current={page === n ? 'page' : undefined}
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                page === n
                  ? 'bg-[#0e7490] text-white'
                  : 'border border-[#e5e7eb] text-[#64748b] hover:bg-[#f8f9ff]'
              }`}>
              {n}
            </button>
          ))}
          <button
            disabled={page === pages}
            onClick={() => setPage(p => Math.min(p + 1, pages))}
            className='inline-flex items-center rounded-lg border border-[#e5e7eb] px-2 py-2 text-[#64748b] hover:bg-[#f8f9ff] disabled:cursor-not-allowed disabled:opacity-50'>
            <span className='sr-only'>Próxima</span>
            <AlignRight aria-hidden='true' />
          </button>
        </nav>
      </div>
    </div>
  )
}

export default Pagination
