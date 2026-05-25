import crypto from 'node:crypto'
import { sql } from '@/lib/neon'
import { updateUserPassword } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { token, password, confirmPassword } = await req.json()
    if (!token || !password) return Response.json({ message: 'Token e nova senha são obrigatórios' }, { status: 400 })
    if (password !== confirmPassword) return Response.json({ message: 'A confirmação de senha não confere' }, { status: 400 })
    if (password.length < 6) return Response.json({ message: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 })

    const rows = await sql`
      SELECT id, reset_token_expires_at
      FROM "user"
      WHERE reset_token = ${token}
      LIMIT 1
    `
    const user = (rows as { id: string; reset_token_expires_at: string | null }[])[0]

    if (!user) return Response.json({ message: 'Link inválido ou já utilizado' }, { status: 400 })
    if (!user.reset_token_expires_at || new Date(user.reset_token_expires_at) < new Date()) {
      return Response.json({ message: 'Este link expirou. Solicite um novo link de redefinição.' }, { status: 400 })
    }

    await updateUserPassword(user.id, password)
    await sql`UPDATE "user" SET reset_token = NULL, reset_token_expires_at = NULL WHERE id = ${user.id}`

    return Response.json({ message: 'Senha redefinida com sucesso. Você já pode entrar com a nova senha.' })
  } catch {
    return Response.json({ message: 'Não foi possível redefinir a senha. Tente novamente.' }, { status: 500 })
  }
}
