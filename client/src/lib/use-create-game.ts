import type { Game } from '@/types/game'
import type { Players } from './types'

interface CreatePvPGameRequest {
  whitePlayerId: string
  timeControl?: string
  isPublic?: boolean
  isRated?: boolean
  allowSpectators?: boolean
  roomName?: string
  password?: string
}

export const useCreateGame = () => {
  // Legacy AI game creation
  const createAiGame = async (players: Players): Promise<Game> => {
    // Mock response for AI game
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      id: 'ai-game-' + Date.now(),
      status: 'pending',
      players: {
        white: players.white,
        black: players.black,
      },
      currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Game
  }

  // New PvP game creation
  const createPvPGame = async (request: CreatePvPGameRequest): Promise<Game> => {
    // Mock response for PvP game
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      id: 'pvp-game-' + Date.now(),
      status: 'pending',
      players: {
        white: { userId: request.whitePlayerId, name: 'You' },
        black: {},
      },
      currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Game
  }

  return {
    createAiGame,
    createPvPGame,
    // Backward compatibility
    createGame: createAiGame
  }
}
