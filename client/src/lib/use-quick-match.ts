import { useMutation } from '@tanstack/react-query'

interface QuickMatchRequest {
  timeControl: string
  ratingRange: string
  isRated: boolean
}

interface QuickMatchResponse {
  gameId: string
  status: 'found' | 'created'
  game: any
}

export const useQuickMatch = () => {
  return useMutation({
    mutationFn: async (request: QuickMatchRequest): Promise<QuickMatchResponse | null> => {
      // Simulate realistic search time (3-15 seconds)
      const searchTime = Math.random() * 12000 + 3000 // 3-15 seconds
      await new Promise(resolve => setTimeout(resolve, searchTime))
      
      // Mock response - higher chance of finding match over time
      const searchDuration = searchTime / 1000
      const findChance = Math.min(0.3 + (searchDuration / 15) * 0.7, 0.9) // 30% to 90% chance
      const isFound = Math.random() < findChance
      
      if (isFound) {
        return {
          gameId: 'found-game-' + Date.now(),
          status: 'found',
          game: {
            id: 'found-game-' + Date.now(),
            whitePlayer: { 
              name: 'ChessMaster' + Math.floor(Math.random() * 1000), 
              rating: 1500 + Math.floor(Math.random() * 1000) 
            },
            blackPlayer: { name: 'You', rating: 1750 },
            timeControl: request.timeControl,
          }
        }
      } else {
        return null // Continue searching
      }
    },
  })
}
