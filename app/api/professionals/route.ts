import { dataApiRequest } from '@/lib/dataApi'
import { sql } from '@/lib/neon'
import { unstable_noStore as noStore } from 'next/cache'

type Professional = { id: string; full_name: string }

function hasDataApiConfig() {
  return Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_SERVICE_ROLE_KEY)
}

async function listProfessionalsFromDataApi() {
  const { data } = await dataApiRequest<Professional[]>('professionals', {
    searchParams: {
      select: 'id,full_name',
      is_active: 'eq.true',
      order: 'full_name.asc',
    },
  })

  return data
}

async function listProfessionalsFromDatabase() {
  const professionals = await sql`
    select id, full_name
      from professionals
     where is_active = true
     order by full_name asc
  `

  return professionals as Professional[]
}

export async function GET() {
  noStore()

  try {
    if (process.env.DATABASE_URL) {
      try {
        const professionals = await listProfessionalsFromDatabase()
        return Response.json({ professionals })
      } catch (error) {
        if (!hasDataApiConfig()) throw error
        console.error('professionals.list.database')
      }
    }

    if (hasDataApiConfig()) {
      const professionals = await listProfessionalsFromDataApi()
      return Response.json({ professionals })
    }

    throw new Error('Nenhuma configuração de banco disponível para listar profissionais')
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
