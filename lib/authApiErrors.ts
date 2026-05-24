import { DataApiRequestError } from '@/lib/dataApi'

type PublicError = {
  status: number
  message: string
}

function isDuplicateEmailError(error: { code?: string; message?: string; details?: string }) {
  const text = `${error.message ?? ''} ${error.details ?? ''}`.toLowerCase()
  return (
    error.code === '23505' ||
    text.includes('duplicate') ||
    text.includes('already exists') ||
    text.includes('admin_users_email_key')
  )
}

function mapGenericSqlError(error: Error): PublicError | null {
  const raw = error.message.toLowerCase()

  if (
    raw.includes('duplicate key value violates unique constraint') ||
    raw.includes('admin_users_email_key')
  ) {
    return { status: 409, message: 'Este e-mail já está cadastrado.' }
  }

  if (raw.includes('null value in column') && raw.includes('password_hash')) {
    return { status: 400, message: 'Senha inválida. Tente novamente.' }
  }

  if (raw.includes('null value in column') && raw.includes('email')) {
    return { status: 400, message: 'E-mail obrigatório.' }
  }

  if (raw.includes('invalid input syntax')) {
    return { status: 400, message: 'Dados inválidos. Revise os campos e tente novamente.' }
  }

  if (raw.includes('violates check constraint') || raw.includes('violates not-null constraint')) {
    return { status: 400, message: 'Dados inválidos. Revise os campos e tente novamente.' }
  }

  return null
}

export function toSafeAuthError(error: unknown): PublicError {
  if (error instanceof DataApiRequestError) {
    const details = error.details as { code?: string; message?: string; details?: string } | null

    if (isDuplicateEmailError({ code: details?.code, message: details?.message, details: details?.details })) {
      return { status: 409, message: 'Este e-mail já está cadastrado.' }
    }

    const isConfigOrPermissionIssue = error.status === 401 || error.status === 403
    if (isConfigOrPermissionIssue) {
      return {
        status: 500,
        message: 'Configuração de autenticação indisponível no momento. Tente novamente em instantes.',
      }
    }

    return {
      status: 503,
      message: 'Serviço de autenticação indisponível no momento. Tente novamente em instantes.',
    }
  }

  if (error instanceof Error && error.message.includes('Variável de ambiente')) {
    return { status: 500, message: 'Não foi possível cadastrar no momento. Tente novamente em instantes.' }
  }

  if (error instanceof Error) {
    const mapped = mapGenericSqlError(error)
    if (mapped) return mapped
  }

  return { status: 400, message: 'Não foi possível cadastrar o usuário. Revise os dados e tente novamente.' }
}
