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
    const count = 5
    const half = Math.floor(count / 2)
    let start = Math.max(1, page - half)
    let end = Math.min(pages, start + count - 1)
    if (end - start < count - 1) start = Math.max(1, end - count + 1)
    setVisiblePages(Array.from({ length: end - start + 1 }, (_, i) => i + start))
  }, [page, pages])

  return (
    <div className='flex items-center justify-between px-1 py-3'>
      {/* Mobile */}
      <div className='flex flex-1 justify-between sm:hidden'>
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className='btn text-sm disabled:opacity-40'>
          Anterior
        </button>
        <button
          disabled={page === pages}
          onClick={() => setPage(p => p + 1)}
          className='btn text-sm disabled:opacity-40'>
          Próxima
        </button>
      </div>

      {/* Desktop */}
      <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
        <p className='text-sm text-slate-500'>
          Página <span className='font-medium text-slate-700'>{page}</span> de{' '}
          <span className='font-medium text-slate-700'>{pages}</span>
        </p>
        <nav className='flex items-center gap-1' aria-label='Paginação'>
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className='btn w-9 h-9 p-0 disabled:opacity-40'>
            <AlignLeft aria-hidden />
          </button>
          {visiblePages.map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              aria-current={page === n ? 'page' : undefined}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === n
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}>
              {n}
            </button>
          ))}
          <button
            disabled={page === pages}
            onClick={() => setPage(p => p + 1)}
            className='btn w-9 h-9 p-0 disabled:opacity-40'>
            <AlignRight aria-hidden />
          </button>
        </nav>
      </div>
    </div>
  )
}
export default Pagination
