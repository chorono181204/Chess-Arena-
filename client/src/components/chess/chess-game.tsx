import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Panel } from '@/components/ui/panel'
import { useAuth } from '@/lib/auth/use-auth'
import { useDeviceWidth } from '@/lib/use-device-width'
import { useGetGame } from '@/lib/use-get-game'
import { cn } from '@/lib/utils'
import type { Game } from '@/types/game'
import { useStreamItem } from '@motiadev/stream-client-react'
import { ChevronRight, Loader2, MessageCircle, MessagesSquare, Workflow } from 'lucide-react'
import { useState } from 'react'
import { Tab } from '../ui/tab'
import { ChessAccessRequest } from './access/chess-access-request'
import { ChessRequestAccess } from './access/chess-request-access'
import { ChessBoard } from './chess-board'
import { ChessChatInput } from './chess-chat-input'
import { ChessLastGameMove } from './chess-last-game-move'
import { ChessSidechat } from './chess-sidechat'
import Scoreboard from './scoreboard/game-scoreboard'
import { ChessMoveHistory } from './chess-move-history'
import { ChessGameStatus } from './chess-game-status'
import { ChessTimer } from './chess-timer'
import { ChessGameInfo } from './chess-game-info'

type Props = {
  gameId: string
  onClose: () => void
}

export const ChessGame: React.FC<Props> = ({ gameId, onClose }) => {
  const isMobile = useDeviceWidth() < 768
  const [isSidechatOpen, setIsSidechatOpen] = useState(!isMobile)
  const { user } = useAuth()
  // Mock useStreamItem for testing UI
  const game: Game = {
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
    }
  }
  
  const event = null // Mock event
  const { game: gameWithRole, accessRequest, onCancel } = useGetGame(gameId, event)

  if (!game) {
    return (
      <div className="w-screen h-dvh flex items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    )
  }

  const role = gameWithRole?.role ?? 'spectator'
  const isSpectator = role === 'spectator'

  const isBlackAssigned = !!game.players.black.userId || !!game.players.black.ai
  const isUserOwner = game.players.white.userId === user?.id

  const messagesComponent = (
    <>
      {/* Chess Timer - Đưa lên đầu */}
      <ChessTimer game={game} />
      
      {/* Game Status */}
      <ChessGameStatus game={game} />
      
      {/* Game Information */}
      <ChessGameInfo game={game} />
      
      {/* Move History */}
      <ChessMoveHistory game={game} />
      
      {/* Scoreboard for completed games */}
      {['completed', 'draw'].includes(game.status) && <Scoreboard game={game} />}
      
      {/* Access Requests */}
      {!isBlackAssigned && !isUserOwner && <ChessRequestAccess gameId={gameId} />}
      {isUserOwner &&
        accessRequest.map((accessRequest, index) => (
          <ChessAccessRequest
            key={index}
            user={accessRequest.user}
            gameId={gameId}
            onCancel={() => onCancel(accessRequest.user.id)}
          />
        ))}
    </>
  )

  return (
    <div className="flex flex-col items-center mx-auto w-screen h-dvh justify-between">
      <div className="flex md:flex-row max-md:flex-col items-center justify-between w-full h-dvh max-h-dvh">

        {!isMobile && (
          <Panel
            className="
            flex flex-col flex-1 gap-4 items-center justify-between w-screen
            h-dvh min-w-[400px] max-w-[400px] border-l-2 border-white/5
          "
          >

            {game.status === 'pending' && (
              <div className="px-4 w-full border-b-2 border-white/5 pb-4 max-md:pt-4">
                <ChessLastGameMove game={game} />
              </div>
            )}

            <div className={cn('px-4 flex flex-col flex-1 w-full overflow-y-auto custom-scrollbar', isSpectator && 'pb-4')}>
              {messagesComponent}
            </div>
            {!isSpectator && gameWithRole && (
              <div className="pb-4 px-4 w-full">
                <ChessChatInput game={gameWithRole} />
              </div>
            )}
          </Panel>
        )}

        <div className="flex-1 w-full h-full flex items-start justify-center md:p-4 pt-8">
          <div
            className={cn('w-full h-full flex items-start justify-center pt-1', isSidechatOpen && 'md:w-[calc(100%-20px)]')}
          >
            <ChessBoard game={game} role={role} />
          </div>
        </div>

        {isMobile ? (
          <>
            <Panel className="p-0">
              <div className="flex flex-col gap-2 px-2 w-full border-b-2 border-white/5 max-md:pt-2">
                {game.status === 'pending' && <ChessLastGameMove game={game} />}
                <div className="flex flex-row gap-2 items-center justify-center">
                  <Tab isSelected={!isSidechatOpen} onClick={() => setIsSidechatOpen(false)}>
                    <Workflow className="size-4" />
                    Gameplay
                  </Tab>
                  <Tab isSelected={isSidechatOpen} onClick={() => setIsSidechatOpen(true)}>
                    <MessageCircle className="size-4" />
                    Sidechat
                  </Tab>
                </div>
              </div>
            </Panel>
            <Panel
              className="
              flex flex-col flex-1 gap-4 items-center justify-between w-screen
              overflow-y-auto p-4 custom-scrollbar
            "
            >
              {isSidechatOpen ? <ChessSidechat gameId={gameId} /> : messagesComponent}
            </Panel>
            {(isSidechatOpen || !isSpectator) && gameWithRole && (
              <Panel className="p-2 w-full">
                <ChessChatInput game={gameWithRole} />
              </Panel>
            )}
          </>
        ) : isSidechatOpen ? (
          <Panel
            className="
              flex flex-col flex-1 gap-4 items-center justify-between w-screen h-dvh
              h-dvh min-w-[300px] max-w-[400px] border-l-2 border-white/5
            "
          >
            <header className="border-b-2 border-white/5 w-full p-4">
              <Button
                variant="default"
                className="h-12 w-12 absolute top-[16px] left-[16px]"
                onClick={() => setIsSidechatOpen(false)}
              >
                <ChevronRight className="size-6" />
              </Button>

              <div className="flex flex-col gap-0 items-center justify-center text-lg font-bold">
                <div className="text-lg font-bold">Sidechat</div>
                <div className="text-sm text-muted-foreground">Chat with other spectators</div>
              </div>
            </header>
            <div className="px-4 flex flex-col flex-1 w-full overflow-y-auto">
              <ChessSidechat gameId={gameId} />
            </div>
            {isSpectator && gameWithRole && (
              <div className="pb-4 px-4 w-full">
                <ChessChatInput game={gameWithRole} />
              </div>
            )}
          </Panel>
        ) : (
          <Card
            className="flex flex-row gap-2 items-center z-50 cursor-pointer bg-black/40 hover:bg-white/10 transition-colors text-white fixed top-6 right-6 backdrop-blur-lg"
            onClick={() => setIsSidechatOpen(!isSidechatOpen)}
          >
            <MessagesSquare />
          </Card>
        )}
      </div>
    </div>
  )
}
