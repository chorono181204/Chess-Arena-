import type { User } from '@/types/user'

export type AuthError = {
  error: string
  error_code: string
  error_description: string
}

export interface SupabaseError {
  message: string
  code?: string
  status?: number
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: AuthError | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}
