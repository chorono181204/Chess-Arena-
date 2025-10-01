export interface Player {
  userId?: string
  ai?: AiModelProvider
  name: string
  avatar?: string
}

export interface Game {
  id: string
  status: 'pending' | 'active' | 'completed' | 'draw'
  players: {
    white: Player
    black: Player
  }
  moves: string[]
  currentFen: string
  createdAt: string
  updatedAt: string
}

export type AiModelProvider = 'openai' | 'claude' | 'gemini' | 'llama' | 'grok'

