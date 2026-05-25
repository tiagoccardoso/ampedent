export type RegisterInput = {
  name?: unknown
  email?: unknown
  password?: unknown
  confirmPassword?: unknown
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/


export function validateRegisterInput(input: RegisterInput) {
  const name = String(input.name ?? '').trim()
  const email = String(input.email ?? '').toLowerCase().trim()
  const password = String(input.password ?? '')
  const confirmPassword = String(input.confirmPassword ?? '')

  if (!name || !email || !password) {
    return { ok: false as const, status: 400, message: 'Nome, e-mail e senha são obrigatórios.' }
  }

  if (!EMAIL_REGEX.test(email)) {
    return { ok: false as const, status: 400, message: 'Informe um e-mail válido.' }
  }

  if (password.length < 8) {
    return { ok: false as const, status: 400, message: 'A senha deve ter pelo menos 8 caracteres.' }
  }

  if (confirmPassword && confirmPassword !== password) {
    return { ok: false as const, status: 400, message: 'A confirmação de senha não confere.' }
  }

  return { ok: true as const, data: { name, email, password } }
}
