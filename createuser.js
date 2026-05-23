// Script para criar o primeiro usuário superadmin no Neon.
// Uso: node createuser.js
// Requer: DATABASE_URL no ambiente (ou em .env.local)

require('dotenv').config({ path: '.env.local' })

const { neon } = require('@neondatabase/serverless')
const bcrypt = require('bcryptjs')

// ── Configuração ──────────────────────────────────────────────
const NAME = 'admin'
const EMAIL = 'admin@example.com'
const PASSWORD = '123456'
const ROLE = 'superadmin'
// ─────────────────────────────────────────────────────────────

async function createSuperUser() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL ausente. Configure .env.local ou exporte a variável.')

  const sql = neon(url)
  const passwordHash = await bcrypt.hash(PASSWORD, 12)

  const rows = await sql`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (${EMAIL.toLowerCase()}, ${passwordHash}, ${NAME.toLowerCase()}, ${ROLE})
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          updated_at = NOW()
    RETURNING id, email, name, role
  `

  const user = rows[0]
  console.log('Usuário criado/atualizado com sucesso:')
  console.log(`  id:    ${user.id}`)
  console.log(`  email: ${user.email}`)
  console.log(`  name:  ${user.name}`)
  console.log(`  role:  ${user.role}`)
}

createSuperUser().catch(err => {
  console.error('Erro:', err.message)
  process.exit(1)
})
