import { apiClient } from '@/lib/auth/api-client'
import { authApi } from '@/lib/auth/auth-api'
import { handleAuthError } from '@/lib/auth/auth-utils'
import type { AuthError } from '@/lib/auth/types'
import type { User } from '@/types/user'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context'

const useUserState = () => {
  const [user, _setUser] = useState<User | null>(null)

  const setUser = useCallback((user: User | null) => {
    _setUser(user)
    if (user) {
      localStorage.setItem('motia-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('motia-user')
    }
  }, [])

  useEffect(() => {
    const localStorageUser = localStorage.getItem('motia-user')
    if (localStorageUser) {
      try {
        const parsed = JSON.parse(localStorageUser)
        if (parsed) {
          _setUser(parsed)
          return
        }
      } catch {}
      localStorage.removeItem('motia-user')
    }

    // Fallback: build user from JWT if present
    const token = localStorage.getItem('auth_token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || 'e30='))
        const nextUser: User = {
          id: payload.id,
          email: payload.email,
          name: payload.name,
          avatar: payload.avatar || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        _setUser(nextUser)
        localStorage.setItem('motia-user', JSON.stringify(nextUser))
      } catch (e) {
        // ignore decode errors
      }
    }
  }, [])

  return [user, setUser] as const
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useUserState()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [authError, setAuthError] = useState<AuthError | null>(null)
  

  // Disable auth check for testing UI
  // useEffect(() => {
  //   const params = getAuthParamsFromUrl()
  //   const fetchUser = async () => {
  //     setAuthError(null)
  //     setIsLoading(true)

  //     try {
  //       const session = await AuthService.getSession()

  //       if (session) {
  //         const result = await authApi.auth(session.access_token)
  //         const redirect = localStorage.getItem('chessarena-redirect')
  //         setUser(result.user)

  //         if (redirect) {
  //           navigate(redirect)
  //           localStorage.removeItem('chessarena-redirect')
  //         }
  //       }
  //     } catch (error: unknown) {
  //       console.error('Auth state change error:', error)
  //       setAuthError(handleAuthError(error))
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   if (params.error) {
  //     setAuthError({
  //       error: params.error,
  //       error_code: params.error_code || '',
  //       error_description: params.error_description || '',
  //     })
  //     return
  //   }

  //   if (params.access_token || !apiClient.isAuthenticated()) {
  //     fetchUser()
  //   }
  // }, [setUser])

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    setAuthError(null)

    try {
      const { accessToken, refreshToken } = await authApi.signin(email, password)
      apiClient.setAuthToken(accessToken)
      localStorage.setItem('refresh_token', refreshToken)

      // Decode minimal user info from JWT (header.payload.signature)
      const payload = JSON.parse(atob(accessToken.split('.')[1] || 'e30='))
      const nextUser: User = {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        avatar: payload.avatar || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setUser(nextUser)
    } catch (error: unknown) {
      setAuthError(handleAuthError(error))
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [setUser])

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setAuthError(null)

    try {
      // Clear all auth-related data
      apiClient.clearAuthToken()
      localStorage.clear()
      setUser(null)
    } catch (error: unknown) {
      console.error('Logout error:', error)
      setAuthError(handleAuthError(error))
    } finally {
      setIsLoading(false)
    }
  }, [setUser])

  const isAuthenticated = Boolean(user)

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      authError,
      login,
      logout,
    }),
    [authError, isAuthenticated, isLoading, login, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
