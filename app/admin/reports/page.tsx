import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Page() {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Relatórios</h1>
          <p className='page-subtitle'>Análises e relatórios operacionais da clínica</p>
        </div>
      </div>

      <div className='card p-8 text-center'>
        <p className='text-slate-400 text-sm'>
          Módulo de relatórios em desenvolvimento. Em breve disponível.
        </p>
      </div>
    </section>
  )
}
