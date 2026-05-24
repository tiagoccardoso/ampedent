import { DataApiRequestError } from '@/lib/dataApi'

type PublicError = {
  status: number
  message: string
}

function isDuplicateEmailError(error: DataApiRequestError) {
  const details = error.details as { code?: string; message?: string; details?: string } | null
  const text = `${details?.message ?? ''} ${details?.details ?? ''}`.toLowerCase()
  return details?.code === '23505' || text.includes('duplicate') || text.includes('email')
}

export function toSafeAuthError(error: unknown): PublicError {
  if (error instanceof DataApiRequestError) {
    if (isDuplicateEmailError(error)) {
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

  return { status: 400, message: 'Não foi possível cadastrar o usuário. Revise os dados e tente novamente.' }
}
