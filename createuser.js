// Script para criar o primeiro usuário superadmin no Neon.
// Uso: node createuser.js
// Requer: DATABASE_URL no ambiente (ou em .env.local)

require('dotenv').config({ path: '.env.local' })

const { neon } = require('@neondatabase/serverless')
const { scrypt, randomBytes } = require('crypto')
const { promisify } = require('util')

const scryptAsync = promisify(scrypt)

// ── Configuração ──────────────────────────────────────────────
const NAME = 'admin'
const EMAIL = 'admin@example.com'
const PASSWORD = '123456'
const ROLE = 'superadmin'
// ─────────────────────────────────────────────────────────────

async function hashPassword(password) {
  const salt = Buffer.from(randomBytes(16)).toString('hex')
  const key = await scryptAsync(password.normalize('NFKC'), salt, 64, {
    N: 16384, r: 16, p: 1,
  })
  return `${salt}:${key.toString('hex')}`
}

async function createSuperUser() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL ausente. Configure .env.local ou exporte a variável.')

  const sql = neon(url)
  const passwordHash = await hashPassword(PASSWORD)
  const userId = crypto.randomUUID()

  const userRows = await sql`
    INSERT INTO users (id, email, name, role, email_verified)
    VALUES (${userId}, ${EMAIL.toLowerCase()}, ${NAME.toLowerCase()}, ${ROLE}, true)
    ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name,
          role = EXCLUDED.role,
          updated_at = NOW()
    RETURNING id, email, name, role
  `

  const user = userRows[0]
  const actualId = user.id

  await sql`
    INSERT INTO account (id, account_id, provider_id, user_id, password)
    VALUES (
      ${crypto.randomUUID()},
      ${actualId},
      'credential',
      ${actualId},
      ${passwordHash}
    )
    ON CONFLICT (account_id, provider_id) DO UPDATE
      SET password = EXCLUDED.password,
          updated_at = NOW()
  `

  console.log('Usuário criado/atualizado com sucesso:')
  console.log(`  id:    ${actualId}`)
  console.log(`  email: ${user.email}`)
  console.log(`  name:  ${user.name}`)
  console.log(`  role:  ${user.role}`)
}

createSuperUser().catch(err => {
  console.error('Erro:', err.message)
  process.exit(1)
})
