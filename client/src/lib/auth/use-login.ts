import { useEffect, useState } from 'react'
import { useAuth } from './use-auth'
import { useNavigate } from 'react-router-dom'

type LoginState = {
  error: string | null
  success: {
    title: string
    description: string
  } | null
}

type LoginProvider = 'google' | 'twitter' | 'email'

type AuthError = {
  error: string
  error_code: string
  error_description: string
}

const INITIAL_STATE: LoginState = {
  error: null,
  success: null,
}

const formatErrorMessage = (error: AuthError): string => {
  if (error.error_code === 'signup_disabled') {
    return 'Sign up is not allowed for this instance. Please contact your administrator.'
  }
  return error.error_description || error.error || 'Authentication failed'
}

export const useLogin = () => {
  const { login, authError, isAuthenticated, isLoading } = useAuth()
  const [state, setState] = useState<LoginState>(INITIAL_STATE)
  const navigate = useNavigate()

  useEffect(() => {
    if (authError) {
      setState((prev) => ({ ...prev, error: formatErrorMessage(authError) }))
    }
  }, [authError])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async (email: string, password: string) => login(email, password)

  return {
    handleLogin,
    verifyOtp: async () => {},
    isAuthenticating: isLoading,
    error: state.error,
    successMessage: state.success,
  }
}
