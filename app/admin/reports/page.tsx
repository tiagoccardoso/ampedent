import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Page() {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  return (
    <section className='space-y-8'>
      <div>
        <p
          className='text-xs font-bold tracking-[0.1em] uppercase mb-1 text-[#30628a]'
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Análise
        </p>
        <h1 className='text-2xl font-extrabold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
          Relatórios
        </h1>
        <p className='text-sm text-[#70787c] mt-1'>Visão consolidada das operações da clínica.</p>
      </div>

      <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm p-12 flex flex-col items-center justify-center text-center'>
        <div className='text-5xl mb-4'>📈</div>
        <h2 className='text-lg font-bold text-[#003441] mb-2' style={{ fontFamily: 'Manrope, sans-serif' }}>
          Módulo em desenvolvimento
        </h2>
        <p className='text-sm text-[#70787c] max-w-md'>
          Os relatórios gerenciais da clínica estarão disponíveis em breve. Você poderá visualizar métricas de agendamentos, receita, produtividade e muito mais.
        </p>
      </div>
    </section>
  )
}
