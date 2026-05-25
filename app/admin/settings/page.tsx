import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Page() {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  return (
    <section className='space-y-6'>
      <div className='page-header'>
        <div>
          <h1 className='page-title'>Configurações</h1>
          <p className='page-subtitle'>Preferências e configurações da clínica</p>
        </div>
      </div>
      <div className='card p-6 max-w-lg'>
        <p className='text-slate-500 text-sm'>
          Módulo de configurações em desenvolvimento. Aqui serão gerenciadas as
          preferências operacionais da clínica odontológica.
        </p>
      </div>
    </section>
  )
}
