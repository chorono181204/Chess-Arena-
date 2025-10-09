import { MotiaPowered } from '@/components/motia-powered'
import { BaseButton } from '@/components/ui/base-button'
import { Input } from '@/components/ui/input'
import { usePageTitle } from '@/lib/use-page-title'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth/use-auth'
import { useQueryParam } from '../lib/use-query-param'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [redirect] = useQueryParam('redirect')

  const { login, isLoading, authError } = useAuth()

  const onSubmit = async () => {
    await login(email, password)
    const redirectTo = redirect || '/'
    window.location.href = redirectTo
  }

  useEffect(() => {
    localStorage.setItem('chessarena-redirect', redirect ?? '')
  }, [redirect])

  const navigate = useNavigate()
  const onBack = () => navigate('/')

  usePageTitle('Login')

  // Redirect away from /login only if authenticated
  useEffect(() => {
    const storedUser = localStorage.getItem('motia-user')
    const hasToken = Boolean(localStorage.getItem('auth_token'))
    if (storedUser && hasToken) {
      navigate('/')
    }
  }, [navigate])

  return (
    <div className="flex flex-col min-h-screen items-center justify-center w-full bg-image-landing p-6">
      <div className="flex flex-col gap-6 items-center justify-center w-full max-w-md">
        <div className="relative flex flex-row items-center justify-center w-full">
          <ArrowLeft className="absolute left-0 top-0 size-6 cursor-pointer" onClick={onBack} />
          <MotiaPowered size="sm" />
        </div>
        
        <img src="/horse.png" alt="Chessarena.ai" className="h-[120px] w-auto" />
        <h1 className="text-5xl font-title text-white text-center">ChessArena.ai</h1>
        
        <div className="flex flex-col gap-4 w-full">
          {authError && <p className="text-red-500 text-center font-semibold">{authError.error}</p>}
          <Input
            type="email"
            placeholder="Enter your email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Enter your password"
            className="w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <BaseButton className="w-full" onClick={onSubmit} isLoading={isLoading}>
            Sign in
          </BaseButton>
          <p className="text-muted-foreground text-center text-sm">
            If no accounts are found under this email, we'll create an account for you. By creating an account you
            agree with the{' '}
            <a href="/privacy-policy" target="_blank" className="font-semibold underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
