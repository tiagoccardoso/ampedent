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

function getSupabaseConfig() {
  const url = process.env.NEON_AUTH_BASE_URL ?? process.env.SUPABASE_URL
  const serviceRoleKey =
    process.env.NEON_AUTH_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEON_AUTH_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error('Variável de ambiente NEON_AUTH_BASE_URL/SUPABASE_URL ausente')
  }


  return {
    url: url.replace(/\/$/, ''),
    serviceRoleKey,
  }
}

export async function supabaseRequest<T>(
  resource: string,
  options: SupabaseRequestOptions = {},
) {
  const { url, serviceRoleKey } = getSupabaseConfig()
  const endpoint = new URL(`${url}/rest/v1/${resource}`)

  Object.entries(options.searchParams ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      endpoint.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(endpoint, {
    method: options.method ?? 'GET',
    headers: {
      ...(serviceRoleKey ? { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } : {}),
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
        : `Requisição ao Supabase falhou com status ${response.status}`

    throw new SupabaseRequestError(message, response.status, data)
  }

  const contentRange = response.headers.get('content-range')
  const count = contentRange ? Number(contentRange.split('/')[1]) : undefined

  return { data: data as T, count, response }
}
