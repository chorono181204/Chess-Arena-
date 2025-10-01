import { AiIcon } from '@/components/chess/ai-icon'
import type { Leaderboard as LeaderboardType } from '@/types/leaderboard'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { LeaderboardItem } from './leaderboard-item'
import { LeaderboardSkeleton } from './leaderboard-skeleton'

const HeaderRow: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="flex flex-col gap-1 items-center w-[120px] max-w-[120px] min-w-[120px] text-center">
      <div className="font-semibold text-white/80">{label}</div>
    </div>
  )
}

export const Leaderboard: React.FC = () => {
  // Mock leaderboard data for testing UI
  const leaderboard = [
    {
      id: '1',
      provider: 'openai',
      model: 'GPT-4',
      matches: 156,
      wins: 98,
      checkmates: 45,
      draws: 12,
      winRate: 62.8,
      avgScore: 8.7,
      avgIllegalMoves: 0.3,
      avgSwing: 2.1
    },
    {
      id: '2',
      provider: 'claude',
      model: 'Claude-3.5-Sonnet',
      matches: 142,
      wins: 89,
      checkmates: 38,
      draws: 15,
      winRate: 62.7,
      avgScore: 8.5,
      avgIllegalMoves: 0.2,
      avgSwing: 1.9
    },
    {
      id: '3',
      provider: 'gemini',
      model: 'Gemini Pro',
      matches: 134,
      wins: 82,
      checkmates: 35,
      draws: 18,
      winRate: 61.2,
      avgScore: 8.2,
      avgIllegalMoves: 0.4,
      avgSwing: 2.3
    },
    {
      id: '4',
      provider: 'grok',
      model: 'Grok-1',
      matches: 128,
      wins: 76,
      checkmates: 32,
      draws: 16,
      winRate: 59.4,
      avgScore: 7.9,
      avgIllegalMoves: 0.5,
      avgSwing: 2.5
    },
    {
      id: '5',
      provider: 'openai',
      model: 'GPT-3.5-Turbo',
      matches: 145,
      wins: 78,
      checkmates: 28,
      draws: 22,
      winRate: 53.8,
      avgScore: 7.6,
      avgIllegalMoves: 0.6,
      avgSwing: 2.8
    },
    {
      id: '6',
      provider: 'claude',
      model: 'Claude-3-Haiku',
      matches: 138,
      wins: 71,
      checkmates: 25,
      draws: 20,
      winRate: 51.4,
      avgScore: 7.3,
      avgIllegalMoves: 0.7,
      avgSwing: 3.1
    },
    {
      id: '7',
      provider: 'gemini',
      model: 'Gemini Flash',
      matches: 132,
      wins: 68,
      checkmates: 22,
      draws: 24,
      winRate: 51.5,
      avgScore: 7.1,
      avgIllegalMoves: 0.8,
      avgSwing: 3.3
    },
    {
      id: '8',
      provider: 'grok',
      model: 'Grok-0.9',
      matches: 126,
      wins: 64,
      checkmates: 20,
      draws: 26,
      winRate: 50.8,
      avgScore: 6.9,
      avgIllegalMoves: 0.9,
      avgSwing: 3.5
    }
  ]

  // const { data: leaderboard } = useStreamGroup<LeaderboardType>({
  //   groupId: 'global',
  //   streamName: 'chessLeaderboard',
  // })

  return (
    <div className="border-t border-white/10 flex flex-col gap-6 items-center justify-center max-w-screen w-full overflow-x-auto h-full">
      {!leaderboard || leaderboard.length === 0 ? (
        <>
          <LeaderboardSkeleton />
          <LeaderboardSkeleton />
          <LeaderboardSkeleton />
        </>
      ) : (
        <div className="flex flex-row w-full h-full items-center justify-center">
          <div className="border-r border-white/10 flex flex-col gap-6 pt-[80px] h-full pb-4">
            {leaderboard.map((leaderboard, position) => (
              <div
                key={position}
                className="flex flex-row gap-2 items-center flex-1 w-[250px] min-w-[250px] max-w-[250px] max-h-[52px] h-[52px]"
              >
                <div className="font-bold text-white w-[40px] min-w-[40px] max-w-[40px] text-center">
                  {position + 1}
                </div>
                <div className="bg-white rounded-full p-1">
                  <AiIcon ai={leaderboard.provider} color="black" />
                </div>
                <div className="flex flex-col gap-1 items-start">
                  <div className="font-semibold text-white">{leaderboard.provider}</div>
                  <div className="font-semibold text-white/80 ellipsis-1">{leaderboard.model}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col overflow-x-auto h-full">
            <div className="flex flex-row gap-2">
              <div className="flex flex-row gap-2 items-center justify-between py-4">
                <HeaderRow label="Matches" />
                <HeaderRow label="Wins" />
                <HeaderRow label="Checkmates" />
                <HeaderRow label="Draws" />
                <HeaderRow label="Win %" />
                <HeaderRow label="Avg. Score" />
                <HeaderRow label="Avg. Illegal Moves" />
                <HeaderRow label="Avg. Swing" />
              </div>
            </div>
            <div className="flex flex-col gap-6 pb-4">
              {leaderboard.map((item) => (
                <LeaderboardItem key={item.model} leaderboard={item} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
