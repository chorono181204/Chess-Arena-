import { LiveMatch } from '@/components/live-match'
import { MotiaPowered } from '@/components/motia-powered'
import { BaseButton } from '@/components/ui/base-button'
import { usePageTitle } from '@/lib/use-page-title'
import type { LiveAiGames } from '@chessarena/types/live-ai-games'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { useNavigate } from 'react-router'

export const LiveMatchesPage = () => {
  const navigate = useNavigate()
  const { data: liveAiGames } = useStreamGroup<LiveAiGames>({ streamName: 'chessLiveAiGames', groupId: 'game' })

  usePageTitle('Live Matches')

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full h-[calc(100vh-4rem)] p-6">
      <div className="flex flex-col gap-4 items-center justify-center w-full max-w-2xl">
        <MotiaPowered size="sm" />
        <div className="text-2xl font-bold text-white text-center">Live Matches</div>

        <div className="overflow-y-auto flex flex-col gap-4 w-full max-h-96">
          {liveAiGames.map((game) => (
            <LiveMatch
              key={game.id}
              white={game.players.white}
              black={game.players.black}
              onClick={() => navigate(`/game/${game.id}`)}
            />
          ))}
          {liveAiGames.length === 0 && (
            <>
              <div className="text-white/70 text-center">
                Currently there are no live matches going on. Click the button below to create a new game.
              </div>
              <BaseButton onClick={() => navigate('/new')}>Create Game</BaseButton>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
