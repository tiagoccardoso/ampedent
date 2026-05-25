import { neon, NeonQueryFunction } from '@neondatabase/serverless'

let _sql: NeonQueryFunction<false, false> | null = null

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('Variável de ambiente DATABASE_URL ausente')
    _sql = neon(url)
  }
  return _sql
}

export const sql: NeonQueryFunction<false, false> = new Proxy(
  {} as NeonQueryFunction<false, false>,
  {
    apply(_target, _thisArg, args) {
      return (getSql() as unknown as Function)(...args)
    },
    get(_target, prop) {
      return (getSql() as unknown as Record<string | symbol, unknown>)[prop]
    },
  },
) as NeonQueryFunction<false, false>

export type NeonAuthUserPayload = {
  id: string
  email?: string | null
  name?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type NeonAuthWebhookPayload = {
  type?: string
  event?: string
  user?: NeonAuthUserPayload
  data?: {
    user?: NeonAuthUserPayload
  }
}
