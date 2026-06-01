import { dataApiRequest } from '@/lib/dataApi'
import { unstable_noStore as noStore } from 'next/cache'

type ProfessionalRow = {
  id: string
  full_name: string
}

export async function GET() {
  noStore()

  try {
    const { data: professionals } = await dataApiRequest<ProfessionalRow[]>('professionals', {
      searchParams: {
        select: 'id,full_name',
        is_active: 'eq.true',
        order: 'full_name.asc',
      },
    })

    return Response.json({ professionals })
  } catch (error) {
    console.error('professionals.list', error)

    return Response.json(
      {
        message: 'Não foi possível carregar os profissionais cadastrados.',
        professionals: [],
      },
      { status: 500 },
    )
  }
}
