import type { GameMessage } from '@/types/game-message'
import { useStreamGroup } from '@motiadev/stream-client-react'
import { ChessSidechatMessage } from './chess-sidechat-message'

type Props = { gameId: string }

export const ChessSidechat: React.FC<Props> = ({ gameId }) => {
  // Mock sidechatMessages for testing UI
  const sidechatMessages: any[] = [
    {
      id: 'sidechat-1',
      gameId: gameId,
      userId: 'spectator-1',
      content: 'Nice opening!',
      message: 'Nice opening!',
      type: 'CHAT',
      createdAt: new Date().toISOString(),
      sender: 'Spectator 1',
      role: 'spectator',
      user: {
        id: 'spectator-1',
        name: 'Spectator 1',
        avatar: null
      }
    },
    {
      id: 'sidechat-2',
      gameId: gameId,
      userId: 'spectator-2',
      content: 'Good luck both players!',
      message: 'Good luck both players!',
      type: 'CHAT',
      createdAt: new Date().toISOString(),
      sender: 'Spectator 2',
      role: 'spectator',
      user: {
        id: 'spectator-2',
        name: 'Spectator 2',
        avatar: null
      }
    }
  ]

  return (
    <div className="flex flex-col gap-2 w-full custom-scrollbar overflow-y-auto max-h-full">
      {sidechatMessages.map((message, index) => (
        <ChessSidechatMessage key={message.id} message={message} isLast={index === sidechatMessages.length - 1} />
      ))}
    </div>
  )
}
