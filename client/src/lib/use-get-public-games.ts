import { useQuery } from '@tanstack/react-query'

interface PublicGame {
  id: string
  whitePlayer: {
    id: string
    name: string
    avatar?: string
    rating?: number
  }
  timeControl?: string
  isPublic: boolean
  createdAt: string
}

// Mock data for testing UI
const mockGames: PublicGame[] = [
  {
    id: '1',
    whitePlayer: {
      id: 'user1',
      name: 'ChessMaster123',
      rating: 1850,
    },
    timeControl: '10+0',
    isPublic: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    whitePlayer: {
      id: 'user2',
      name: 'GrandmasterPro',
      rating: 2200,
    },
    timeControl: '15+10',
    isPublic: true,
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: '3',
    whitePlayer: {
      id: 'user3',
      name: 'RapidPlayer',
      rating: 1650,
    },
    timeControl: '5+0',
    isPublic: true,
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
]

export const useGetPublicGames = () => {
  return useQuery({
    queryKey: ['public-games'],
    queryFn: async (): Promise<PublicGame[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockGames
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  })
}
