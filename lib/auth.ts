import { cookies } from 'next/headers'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import bcrypt from 'bcryptjs'
import { getDb } from './db'
import { AdminRole } from './types'

const ACCESS_COOKIE = 'auth-token'
const REFRESH_COOKIE = 'auth-refresh'
const ACCESS_TTL = 3600
const REFRESH_TTL = 60 * 60 * 24 * 7

export type AuthUser = {
  id: string
  email: string
  name: string
  role: AdminRole
}

function getJwtSecret(): Uint8Array {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('Variável de ambiente JWT_SECRET ausente')
  return new TextEncoder().encode(s)
}

async function signAccessToken(user: AuthUser): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(getJwtSecret())
}

async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload
  } catch {
    return null
  }
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies()
  const secure = process.env.NODE_ENV === 'production'
  jar.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: ACCESS_TTL,
  })
  jar.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: REFRESH_TTL,
  })
}

export async function clearAuthCookies() {
  const jar = await cookies()
  jar.delete(ACCESS_COOKIE)
  jar.delete(REFRESH_COOKIE)
}

export async function signInWithPassword(email: string, password: string): Promise<AuthUser> {
  const sql = getDb()
  const rows = await sql`
    SELECT id, email, name, role, password_hash
    FROM users
    WHERE email = ${email.toLowerCase()}
    LIMIT 1
  `
  const user = rows[0] as (AuthUser & { password_hash: string }) | undefined
  if (!user) throw new Error('Email ou senha incorretos')

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) throw new Error('Email ou senha incorretos')

  const accessToken = await signAccessToken({ id: user.id, email: user.email, name: user.name, role: user.role })
  const refreshToken = await signRefreshToken(user.id)
  await setAuthCookies(accessToken, refreshToken)
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies()
  const accessToken = jar.get(ACCESS_COOKIE)?.value
  const refreshToken = jar.get(REFRESH_COOKIE)?.value

  if (accessToken) {
    const payload = await verifyToken(accessToken)
    if (payload?.sub) {
      return {
        id: payload.sub,
        email: payload['email'] as string,
        name: payload['name'] as string,
        role: payload['role'] as AdminRole,
      }
    }
  }

  if (!refreshToken) return null

  const payload = await verifyToken(refreshToken)
  if (!payload?.sub || payload['type'] !== 'refresh') {
    await clearAuthCookies()
    return null
  }

  const sql = getDb()
  const rows = await sql`
    SELECT id, email, name, role FROM users WHERE id = ${payload.sub} LIMIT 1
  `
  const user = rows[0] as AuthUser | undefined
  if (!user) { await clearAuthCookies(); return null }

  const newAccess = await signAccessToken(user)
  const newRefresh = await signRefreshToken(user.id)
  await setAuthCookies(newAccess, newRefresh)
  return user
}

export async function createUser({
  email,
  password,
  name,
  role = 'paciente',
}: {
  email: string
  password: string
  name: string
  role?: AdminRole
}): Promise<AuthUser> {
  const hash = await bcrypt.hash(password, 12)
  const sql = getDb()
  const rows = await sql`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (${email.toLowerCase()}, ${hash}, ${name}, ${role})
    RETURNING id, email, name, role
  `
  return rows[0] as AuthUser
}

export async function updateUser(
  id: string,
  updates: { email?: string; password?: string; name?: string; role?: AdminRole },
): Promise<AuthUser | undefined> {
  const sql = getDb()
  const fields: string[] = []
  const params: unknown[] = []

  if (updates.name !== undefined) {
    params.push(updates.name)
    fields.push(`name = $${params.length}`)
  }
  if (updates.email !== undefined) {
    params.push(updates.email.toLowerCase())
    fields.push(`email = $${params.length}`)
  }
  if (updates.password) {
    params.push(await bcrypt.hash(updates.password, 12))
    fields.push(`password_hash = $${params.length}`)
  }
  if (updates.role !== undefined) {
    params.push(updates.role)
    fields.push(`role = $${params.length}`)
  }

  if (fields.length === 0) return undefined

  params.push(id)
  const rows = await sql.query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING id, email, name, role`,
    params as string[],
  )
  return rows[0] as AuthUser | undefined
}

export async function deleteUser(id: string) {
  const sql = getDb()
  await sql`DELETE FROM users WHERE id = ${id}`
}
