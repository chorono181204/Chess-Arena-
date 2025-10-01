import type { GameMessage } from '@/types/game-message'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { ChessMessage } from './chess-message'

type Props = { gameId: string }

export const ChessMessages: React.FC<Props> = ({ gameId }) => {
  // Mock gameMessages for testing UI
  const gameMessages: any[] = [
    {
      id: 'msg-1',
      gameId: gameId,
      userId: 'test-user-1',
      content: 'Hello! Ready to play?',
      message: 'Hello! Ready to play?',
      type: 'CHAT',
      createdAt: new Date().toISOString(),
      sender: 'White Player',
      role: 'white',
      user: {
        id: 'test-user-1',
        name: 'White Player',
        avatar: null
      }
    },
    {
      id: 'msg-2',
      gameId: gameId,
      userId: 'system',
      content: 'Game started!',
      message: 'Game started!',
      type: 'SYSTEM',
      createdAt: new Date().toISOString(),
      sender: 'System',
      role: 'system',
      user: {
        id: 'system',
        name: 'System',
        avatar: null
      }
    }
  ]

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full">
      <div className="flex flex-1 flex-col gap-2 w-full">
        {gameMessages.map((message, index) => (
          <ChessMessage key={message.id || index} message={message} isLast={index === gameMessages.length - 1} />
        ))}
      </div>
    </div>
  )
}
