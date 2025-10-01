import { ChessLobby } from '@/components/chess/lobby/chess-lobby'
import { usePageTitle } from '@/lib/use-page-title'
import { AuthGuard } from '../components/auth/auth-guard'

export const LobbyPage = () => {
  usePageTitle('Chess Lobby')

  return (
    <AuthGuard>
      <div className="w-full h-[calc(100vh-4rem)]">
        <ChessLobby />
      </div>
    </AuthGuard>
  )
}
