import { sql } from '@/lib/neon'
import { unstable_noStore as noStore } from 'next/cache'

export async function GET() {
  noStore()

  try {
    const professionals = await sql`
      select id, full_name
        from professionals
       where is_active = true
       order by full_name asc
    `

    return Response.json({ professionals })
  } catch {
    console.error('professionals.list')

    return Response.json(
      {
        message: 'Não foi possível carregar os profissionais cadastrados.',
        professionals: [],
      },
      { status: 500 },
    )
  }
}
