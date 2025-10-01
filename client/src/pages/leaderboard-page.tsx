import { usePageTitle } from '@/lib/use-page-title'
import { Leaderboard } from '../components/leaderboard/leaderboard'

export const LeaderboardPage = () => {
  usePageTitle('Leaderboard')

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full h-[calc(100vh-4rem)] p-6">
      <div className="flex flex-col gap-4 items-center justify-center w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <Leaderboard />
      </div>
    </div>
  )
}
