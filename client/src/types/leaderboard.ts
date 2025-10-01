export interface LeaderboardItem {
  id: string
  name: string
  avatar?: string
  wins: number
  losses: number
  draws: number
  totalGames: number
  winRate: number
  illegalMoves: number
}

export interface Leaderboard {
  items: LeaderboardItem[]
  totalPlayers: number
  lastUpdated: string
}

