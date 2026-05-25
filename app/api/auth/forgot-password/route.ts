import crypto from 'node:crypto'
import { sql } from '@/lib/neon'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return Response.json({ message: 'E-mail obrigatório' }, { status: 400 })

    // Ensure reset token columns exist (idempotent)
    await sql`
      ALTER TABLE "user"
        ADD COLUMN IF NOT EXISTS reset_token TEXT,
        ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ
    `

    const rows = await sql`SELECT id FROM "user" WHERE email = ${email.toLowerCase().trim()} LIMIT 1`
    const user = (rows as { id: string }[])[0]

    // Always respond the same way to avoid email enumeration
    if (!user) {
      return Response.json({ message: 'Se este e-mail estiver cadastrado, um link de redefinição foi gerado.' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours

    await sql`
      UPDATE "user"
      SET reset_token = ${token}, reset_token_expires_at = ${expiresAt.toISOString()}
      WHERE id = ${user.id}
    `

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
    const resetUrl = `${baseUrl}/admin/reset-password?token=${token}`

    return Response.json({ message: 'Link de redefinição gerado com sucesso.', resetUrl })
  } catch {
    return Response.json({ message: 'Não foi possível processar a solicitação. Tente novamente.' }, { status: 500 })
  }
}
