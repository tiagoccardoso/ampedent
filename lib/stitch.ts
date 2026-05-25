const STITCH_API_BASE = 'https://stitch.googleapis.com'

function getApiKey(): string {
  const key = process.env.STITCH_GOOGLE_API_KEY
  if (!key) {
    throw new Error(
      '[Stitch] STITCH_GOOGLE_API_KEY não está configurada. ' +
        'Adicione ao .env.local (local) ou às variáveis de ambiente da Vercel (produção).',
    )
  }
  return key
}

export interface StitchDesignTokens {
  colors?: Record<string, string>
  typography?: Record<string, unknown>
  spacing?: Record<string, string>
  borderRadius?: Record<string, string>
  shadows?: Record<string, string>
}

export async function fetchStitchTokens(): Promise<StitchDesignTokens | null> {
  try {
    const key = getApiKey()

    const res = await fetch(`${STITCH_API_BASE}/v1/design-tokens`, {
      headers: {
        'X-Goog-Api-Key': key,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.error(`[Stitch] API retornou status ${res.status}`)
      return null
    }

    return (await res.json()) as StitchDesignTokens
  } catch (err) {
    console.error(
      '[Stitch] Serviço indisponível:',
      err instanceof Error ? err.message : 'Erro desconhecido',
    )
    return null
  }
}

export function isStitchConfigured(): boolean {
  return Boolean(process.env.STITCH_GOOGLE_API_KEY)
}
