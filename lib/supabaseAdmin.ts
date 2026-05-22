type SupabaseRequestOptions = {
  method?: string
  searchParams?: Record<string, string | number | boolean | undefined>
  body?: unknown
  headers?: HeadersInit
}

export class SupabaseRequestError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details: unknown) {
    super(message)
    this.name = 'SupabaseRequestError'
    this.status = status
    this.details = details
  }
}

function getDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('Variável de ambiente DATABASE_URL ausente')
  }

  let parsed: URL
  try {
    parsed = new URL(databaseUrl)
  } catch {
    throw new Error('DATABASE_URL inválida')
  }

  // Mantém compatibilidade com a camada atual baseada em PostgREST.
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('DATABASE_URL deve apontar para o endpoint HTTP(S) da API de dados neste projeto')
  }

  const serviceRoleKey = process.env.NEON_AUTH_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('Variável de ambiente de service role ausente')
  }

  return {
    baseUrl: parsed.toString().replace(/\/$/, ''),
    serviceRoleKey,
  }
}

export async function supabaseRequest<T>(
  resource: string,
  options: SupabaseRequestOptions = {},
) {
  const { baseUrl, serviceRoleKey } = getDatabaseConfig()
  const endpoint = new URL(`${baseUrl}/rest/v1/${resource}`)

  Object.entries(options.searchParams ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      endpoint.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(endpoint, {
    method: options.method ?? 'GET',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const rawBody = await response.text()
  const data = rawBody ? JSON.parse(rawBody) : null

  if (!response.ok) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : `Requisição à API de dados falhou com status ${response.status}`

    throw new SupabaseRequestError(message, response.status, data)
  }

  const contentRange = response.headers.get('content-range')
  const count = contentRange ? Number(contentRange.split('/')[1]) : undefined

  return { data: data as T, count, response }
}
