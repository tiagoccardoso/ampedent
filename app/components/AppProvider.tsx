'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { authClient } from '@/lib/auth-client'

type AdminSession = {
  user: string
  email?: string
  role: string
}

type AuthContextValue = {
  session: AdminSession | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  refreshSession: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function AppProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending } = authClient.useSession()

  const status: AuthContextValue['status'] = isPending
    ? 'loading'
    : data
      ? 'authenticated'
      : 'unauthenticated'

  const sessionUser = data?.user as any
  const session: AdminSession | null = sessionUser
    ? { user: sessionUser.name, email: sessionUser.email, role: sessionUser.role ?? '' }
    : null

  const refreshSession = useCallback(async () => {
    // better-auth handles session refresh automatically
  }, [])

  const logout = useCallback(async () => {
    await authClient.signOut()
  }, [])

  const value = useMemo(
    () => ({ session, status, refreshSession, logout }),
    [logout, refreshSession, session, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth deve ser usado dentro de AppProvider')
  }

  return value
}

export default AppProvider
