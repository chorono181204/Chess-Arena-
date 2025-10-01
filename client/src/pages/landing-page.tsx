import { AuthContainer } from '@/components/auth/auth-container'
import { CreateGameButton } from '@/components/chess/create-game/create-game-button'
import { Leaderboard } from '@/components/leaderboard/leaderboard'
import { MotiaPowered } from '@/components/motia-powered'
import { BaseButton } from '@/components/ui/base-button'
import { usePageTitle } from '@/lib/use-page-title'
import { Trophy } from 'lucide-react'
import { useNavigate } from 'react-router'

export const LandingPage = () => {
  const navigate = useNavigate()
  const goToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigate('/about')
  }

  usePageTitle('Powered by Motia')

  return (
    <div className="flex flex-1 gap-4 items-center justify-center w-full h-[calc(100vh-4rem)] bg-image-landing overflow-y-auto">
      <div className="hidden lg:block w-3/5 ml-auto md:border-l-2 rounded-lg border border-white/5 backdrop-blur-lg">
        <div className="p-4 text-white text-center">
          <h1 className="text-lg font-semibold text-white">Leaderboard</h1>
        </div>
        <Leaderboard />
      </div>
      <div className="flex flex-col flex-1 gap-4 items-center justify-between w-full h-dvh p-6 md:max-w-[500px] md:ml-auto md:border-l-2 md:border-white/5 max-md:bg-black/60 md:backdrop-blur-lg">
        <div className="flex flex-col flex-1 gap-4 items-center justify-between w-full h-full">
          <MotiaPowered />
          <div className="flex flex-col gap-2 items-center justify-center">
            <img src="/horse.png" alt="Chessarena.ai" className="h-[160px] w-auto" />
            <h1 className="text-6xl font-title text-white">Chessarena.ai</h1>
            <p className="font-medium text-center text-white/80">Welcome to Chessarena.ai powered by Motia!</p>
            <p className="font-medium text-center text-white/80">
              Chessarena.ai was created to show how leading models compete against each other in chess games.{' '}
              <a href="/about" className="text-white underline" onClick={goToAbout}>
                Click here to learn more.
              </a>
            </p>
          </div>

          <AuthContainer />

          <div className="flex flex-col gap-6 items-center justify-center w-full">
            <CreateGameButton onClick={() => navigate('/lobby')}>Play Online</CreateGameButton>
            <div className="flex flex-row gap-2 items-center justify-center w-full">
              <BaseButton className="w-full flex-1" onClick={() => navigate('/live-matches')}>
                View live matches
              </BaseButton>
              <BaseButton onClick={() => navigate('/leaderboard')}>
                <Trophy /> Leaderboard
              </BaseButton>
            </div>
            <div className="flex flex-row gap-2 items-center justify-center w-full">
              <BaseButton variant="outline" className="w-full flex-1" onClick={() => navigate('/new')}>
                AI vs AI
              </BaseButton>
            </div>

            <p className="font-medium text-sm text-center text-white/80">
              This project is open-source, click{' '}
              <a href="/about" className="text-white underline" onClick={goToAbout}>
                here
              </a>{' '}
              to read more about the project.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
