export interface LiveAiPlayer {
  id: string
  name: string
  avatar?: string
  provider: string
  model: string
}

export interface LiveAiGame {
  id: string
  status: 'pending' | 'active' | 'completed' | 'draw'
  players: {
    white: LiveAiPlayer
    black: LiveAiPlayer
  }
  currentFen: string
  moves: string[]
  createdAt: string
  updatedAt: string
}

export interface LiveAiGames {
  games: LiveAiGame[]
  totalGames: number
  activeGames: number
}

