'use client'

function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 text-center'>
      <p className='text-8xl font-bold text-slate-200 select-none mb-4'>500</p>
      <h1 className='text-2xl font-bold text-slate-700 mb-2'>Algo deu errado</h1>
      <p className='text-slate-500 mb-8 max-w-sm'>
        Ocorreu um erro inesperado. Por favor, tente novamente ou entre em contato com o suporte.
      </p>
      <button
        onClick={reset}
        className='btn btn-primary'>
        Tentar novamente
      </button>
    </div>
  )
}
export default GlobalError
