import { formatNumber } from '@/lib/utils'
import type React from 'react'

type LeaderboardItem = {
  id: string
  provider: string
  model: string
  matches: number
  wins: number
  checkmates: number
  draws: number
  winRate: number
  avgScore: number
  avgIllegalMoves: number
  avgSwing: number
}

type Props = {
  leaderboard: LeaderboardItem
}

const LeaderboardRow = ({ value }: { value: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-1 items-center w-[120px] max-w-[120px] min-w-[120px] text-center">
      <div className="font-bold text-white">{value}</div>
    </div>
  )
}

export const LeaderboardItem: React.FC<Props> = ({ leaderboard }) => {
  return (
    <div className="flex flex-col gap-2 w-full text-sm h-[52px]">
      <div className="flex flex-row gap-2 items-center justify-between py-4">
        <LeaderboardRow value={formatNumber(leaderboard.matches)} />
        <LeaderboardRow value={formatNumber(leaderboard.wins)} />
        <LeaderboardRow value={formatNumber(leaderboard.checkmates)} />
        <LeaderboardRow value={formatNumber(leaderboard.draws)} />
        <LeaderboardRow value={`${leaderboard.winRate.toFixed(1)}%`} />
        <LeaderboardRow value={leaderboard.avgScore.toFixed(1)} />
        <LeaderboardRow value={leaderboard.avgIllegalMoves.toFixed(1)} />
        <LeaderboardRow value={leaderboard.avgSwing.toFixed(1)} />
      </div>
    </div>
  )
}
