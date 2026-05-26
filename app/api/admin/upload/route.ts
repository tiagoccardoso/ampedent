import { getCurrentAdminProfile } from '@/lib/auth'
import { put } from '@vercel/blob'
import { NextRequest } from 'next/server'

const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
])
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
}

export async function POST(req: NextRequest) {
  // Auth — admin only
  const admin = await getCurrentAdminProfile()
  if (!admin) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Storage configured?
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: 'Armazenamento de imagens não configurado (BLOB_READ_WRITE_TOKEN ausente). Use uma URL diretamente.' },
      { status: 503 },
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return Response.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }

  // Validate type
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: 'Tipo não permitido. Use PNG, JPG, WEBP, GIF ou SVG.' },
      { status: 400 },
    )
  }

  // Validate size
  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'Arquivo muito grande. Máximo 5 MB.' }, { status: 400 })
  }

  try {
    const safeName = sanitizeFilename(file.name)
    const blob = await put(`site/${Date.now()}-${safeName}`, file, { access: 'public' })
    return Response.json({ url: blob.url })
  } catch (e) {
    console.error('[upload]', e instanceof Error ? e.message : e)
    return Response.json({ error: 'Falha ao armazenar imagem. Tente novamente.' }, { status: 500 })
  }
}
