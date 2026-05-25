import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  return <section className='space-y-4'><h1 className='text-2xl font-bold'>Dashboard da Clínica</h1><p>Resumo operacional com indicadores principais, atalhos e alertas.</p></section>
}
