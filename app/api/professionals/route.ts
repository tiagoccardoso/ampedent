import { dataApiRequest } from '@/lib/dataApi'

export async function GET() {
  const { data } = await dataApiRequest<{ id: string; full_name: string }[]>('professionals', {
    searchParams: {
      select: 'id,full_name',
      is_active: 'eq.true',
      order: 'full_name.asc',
    },
  })

  return Response.json({ professionals: data })
}
