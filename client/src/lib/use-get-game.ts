import { useCallback, useEffect, useState } from 'react'
import { apiClient } from './auth/api-client'
import { useAuth } from './auth/use-auth'
import type { GameWithRole } from './types'
import { useStreamEventHandler } from '@motiadev/stream-client-react'
import type { StreamSubscription } from '@motiadev/stream-client-browser'
import type { PublicUser } from '@/types/user'

type AccessRequest = {
  user: PublicUser
}

export const useGetGame = (gameId: string, event: StreamSubscription<unknown, unknown> | null) => {
  const { user } = useAuth()
  const [game, setGame] = useState<GameWithRole | undefined>()

  const getGame = useCallback(async (gameId: string) => {
    const data = await apiClient.get<GameWithRole>(`/chess/game/${gameId}`)
    setGame(data)
  }, [])

  // Mock gameWithRole for testing UI
  const mockGameWithRole: GameWithRole = {
    id: gameId,
    status: 'ACTIVE',
    currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [],
    lastMove: null,
    turn: 'white',
    winner: null,
    check: false,
    checkmate: false,
    stalemate: false,
    draw: false,
    timeControl: '5+0',
    isPublic: true,
    isRated: false,
    allowSpectators: true,
    whitePlayerId: 'test-user-1',
    blackPlayerId: 'test-user-2',
    winnerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    whitePlayer: {
      id: 'test-user-1',
      name: 'White Player',
      avatar: null
    },
    blackPlayer: {
      id: 'test-user-2',
      name: 'Black Player',
      avatar: null
    },
    messages: [],
    players: {
      white: {
        userId: 'test-user-1',
        name: 'White Player',
        avatar: null,
        ai: null
      },
      black: {
        userId: 'test-user-2',
        name: 'Black Player',
        avatar: null,
        ai: null
      }
    },
    role: 'white' as any
  }

  const [accessRequest, setAccessRequest] = useState<AccessRequest[]>([])
  const onCancel = (userId: string) => {
    setAccessRequest((prev) => prev.filter((request) => request.user.id !== userId))
  }

  const refetch = useCallback(() => {
    getGame(gameId).catch(() => void 0)
  }, [gameId, getGame])

  useEffect(refetch, [refetch])

  // capture on-access-requested event
  useStreamEventHandler(
    {
      event,
      type: 'on-access-requested',
      listener: (event) => setAccessRequest((prev) => [...prev, event]),
    },
    [],
  )

  // capture on-access-accepted event
  // if the user is the owner, refetch the game to update the game role
  useStreamEventHandler(
    {
      event,
      type: 'on-access-accepted',
      listener: (event) => {
        if (event.userId === user?.id) refetch()
      },
    },
    [refetch, user?.id],
  )

  return { game: mockGameWithRole, accessRequest, onCancel }
}
