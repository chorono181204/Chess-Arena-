import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/components/layout/app-layout'
import { socketUrl } from '@/lib/env'
import { MotiaStreamProvider } from '@motiadev/stream-client-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router'
import { AiGamePage } from './pages/ai-game-page'
import { CreateGamePage } from './pages/create-game-page'
import { ChessGamePage } from './pages/game-page'
import { HomePage } from './pages/home-page'
import { LandingPage } from './pages/landing-page'
import { LeaderboardPage } from './pages/leaderboard-page'
import { LiveMatchesPage } from './pages/live-matches-page'
import { GameHistoryPage } from './pages/game-history-page'
import { LobbyPage } from './pages/lobby-page'
import { AboutPage } from './pages/about-page'
import { LoginPage } from './pages/login-page'
import { ProfilePage } from './pages/profile-page'
import { AuthProvider } from './components/auth/auth-provider'
import { PrivacyPage } from './pages/privacy-page'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotiaStreamProvider address={socketUrl}>
        <BrowserRouter>
          <AuthProvider>
            <AppLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<AppLayout showHeader={false}><LoginPage /></AppLayout>} />
                <Route path="/lobby" element={<LobbyPage />} />
                <Route path="/live-matches" element={<LiveMatchesPage />} />
                <Route path="/game-history" element={<GameHistoryPage />} />
                <Route path="/new" element={<CreateGamePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/game/:gameId" element={<ChessGamePage />} />
                <Route path="/ai-game/:id" element={<AiGamePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy-policy" element={<PrivacyPage />} />
              </Routes>
            </AppLayout>
          </AuthProvider>
        </BrowserRouter>
        <Toaster />
      </MotiaStreamProvider>
    </QueryClientProvider>
  )
}

export default App
