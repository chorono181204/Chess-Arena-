import { Toaster } from '@/components/ui/sonner'
import { AppLayout } from '@/components/layout/app-layout'
import { socketUrl } from '@/lib/env'
import { MotiaStreamProvider } from '@motiadev/stream-client-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
            <Routes>
              <Route path="/login" element={<AppLayout showHeader={false}><LoginPage /></AppLayout>} />
              <Route
                path="/"
                element={
                  <AppLayout>
                    <HomePage />
                  </AppLayout>
                }
              />
              <Route path="/landing" element={<AppLayout><LandingPage /></AppLayout>} />
              <Route path="/lobby" element={<AppLayout><LobbyPage /></AppLayout>} />
              <Route path="/live-matches" element={<AppLayout><LiveMatchesPage /></AppLayout>} />
              <Route path="/game-history" element={<AppLayout><GameHistoryPage /></AppLayout>} />
              <Route path="/new" element={<AppLayout><CreateGamePage /></AppLayout>} />
              <Route path="/leaderboard" element={<AppLayout><LeaderboardPage /></AppLayout>} />
              <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
              <Route path="/game/:gameId" element={<AppLayout><ChessGamePage /></AppLayout>} />
              <Route path="/ai-game/:id" element={<AppLayout><AiGamePage /></AppLayout>} />
              <Route path="/about" element={<AppLayout><AboutPage /></AppLayout>} />
              <Route path="/privacy-policy" element={<AppLayout><PrivacyPage /></AppLayout>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        <Toaster />
      </MotiaStreamProvider>
    </QueryClientProvider>
  )
}

export default App
