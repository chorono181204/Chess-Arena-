import { ChessPlayerInfo } from './chess-player-info'
import { ChessGameControls } from './chess-game-controls'
import { ChessMoveHistory } from './chess-move-history'
import { ChessMessages } from './chess-messages'
import { Panel } from '@/components/ui/panel'
import { Tab } from '@/components/ui/tab'
import { MessageCircle, History, Users } from 'lucide-react'
import { useState } from 'react'

interface Player {
  id: string
  name: string
  avatar?: string
  rating?: number
  isOnline?: boolean
}

interface Move {
  move: string
  san: string
  color: 'white' | 'black'
  timestamp: number
}

interface ChessPvPSidebarProps {
  gameId: string
  whitePlayer: Player
  blackPlayer: Player | null
  gameStatus: 'pending' | 'active' | 'completed' | 'draw'
  currentTurn: 'white' | 'black'
  moves: Move[]
  currentMoveIndex?: number
  timeLeft?: {
    white: number
    black: number
  }
  isPlayerTurn?: boolean
  canResign?: boolean
  canDraw?: boolean
  onMoveSelect?: (index: number) => void
  onResign?: () => void
  onDraw?: () => void
  onRematch?: () => void
  onShare?: () => void
  onSettings?: () => void
}

export const ChessPvPSidebar: React.FC<ChessPvPSidebarProps> = ({
  gameId,
  whitePlayer,
  blackPlayer,
  gameStatus,
  currentTurn,
  moves,
  currentMoveIndex = -1,
  timeLeft,
  isPlayerTurn = false,
  canResign = false,
  canDraw = false,
  onMoveSelect,
  onResign,
  onDraw,
  onRematch,
  onShare,
  onSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'game' | 'chat' | 'history'>('game')

  const isWhiteTurn = currentTurn === 'white'
  const isBlackTurn = currentTurn === 'black'

  return (
    <Panel className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Tab
            isSelected={activeTab === 'game'}
            onClick={() => setActiveTab('game')}
          >
            <Users className="w-4 h-4" />
            Game
          </Tab>
          <Tab
            isSelected={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </Tab>
          <Tab
            isSelected={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          >
            <History className="w-4 h-4" />
            History
          </Tab>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'game' && (
          <div className="p-4 space-y-4 h-full overflow-y-auto">
            {/* White Player */}
            <ChessPlayerInfo
              player={whitePlayer}
              color="white"
              isCurrentTurn={isWhiteTurn}
              timeLeft={timeLeft?.white}
              isWinner={gameStatus === 'completed' && currentTurn === 'black'}
            />

            {/* Black Player */}
            {blackPlayer ? (
              <ChessPlayerInfo
                player={blackPlayer}
                color="black"
                isCurrentTurn={isBlackTurn}
                timeLeft={timeLeft?.black}
                isWinner={gameStatus === 'completed' && currentTurn === 'white'}
              />
            ) : (
              <div className="p-3 border-2 border-dashed border-white/20 rounded-lg text-center">
                <div className="text-muted-foreground mb-2">Waiting for opponent...</div>
                <div className="text-sm text-muted-foreground">
                  Share this game to invite a friend
                </div>
              </div>
            )}

            {/* Game Controls */}
            <ChessGameControls
              gameId={gameId}
              gameStatus={gameStatus}
              isPlayerTurn={isPlayerTurn}
              canResign={canResign}
              canDraw={canDraw}
              onResign={onResign}
              onDraw={onDraw}
              onRematch={onRematch}
              onShare={onShare}
              onSettings={onSettings}
            />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <ChessMessages gameId={gameId} />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="h-full overflow-y-auto p-4">
            <ChessMoveHistory
              moves={moves}
              currentMoveIndex={currentMoveIndex}
              onMoveSelect={onMoveSelect}
            />
          </div>
        )}
      </div>
    </Panel>
  )
}


