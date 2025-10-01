import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/use-auth'
import { cn } from '@/lib/utils'
import { 
  Flag, 
  RotateCcw, 
  Square, 
  MessageCircle, 
  Share2, 
  Settings,
  Crown,
  Handshake
} from 'lucide-react'
import { useState } from 'react'

interface ChessGameControlsProps {
  gameId: string
  gameStatus: 'pending' | 'active' | 'completed' | 'draw'
  isPlayerTurn?: boolean
  canResign?: boolean
  canDraw?: boolean
  onResign?: () => void
  onDraw?: () => void
  onRematch?: () => void
  onShare?: () => void
  onSettings?: () => void
  className?: string
}

export const ChessGameControls: React.FC<ChessGameControlsProps> = ({
  gameId,
  gameStatus,
  isPlayerTurn = false,
  canResign = false,
  canDraw = false,
  onResign,
  onDraw,
  onRematch,
  onShare,
  onSettings,
  className,
}) => {
  const { user } = useAuth()
  const [showDrawConfirm, setShowDrawConfirm] = useState(false)

  const handleDraw = () => {
    if (showDrawConfirm) {
      onDraw?.()
      setShowDrawConfirm(false)
    } else {
      setShowDrawConfirm(true)
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowDrawConfirm(false), 3000)
    }
  }

  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'pending':
        return 'Waiting for opponent...'
      case 'active':
        return isPlayerTurn ? 'Your turn' : 'Opponent\'s turn'
      case 'completed':
        return 'Game completed'
      case 'draw':
        return 'Game ended in draw'
      default:
        return 'Unknown status'
    }
  }

  const getStatusColor = () => {
    switch (gameStatus) {
      case 'pending':
        return 'text-yellow-500'
      case 'active':
        return isPlayerTurn ? 'text-blue-500' : 'text-muted-foreground'
      case 'completed':
        return 'text-green-500'
      case 'draw':
        return 'text-gray-500'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card className={cn('p-4', className)}>
      {/* Game Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', {
            'bg-yellow-500': gameStatus === 'pending',
            'bg-blue-500': gameStatus === 'active' && isPlayerTurn,
            'bg-gray-500': gameStatus === 'active' && !isPlayerTurn,
            'bg-green-500': gameStatus === 'completed',
            'bg-gray-400': gameStatus === 'draw',
          })} />
          <span className={cn('font-medium', getStatusColor())}>
            {getStatusMessage()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="text-muted-foreground hover:text-white"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="text-muted-foreground hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Game Controls */}
      {gameStatus === 'active' && (
        <div className="flex gap-2">
          {canResign && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onResign}
              className="flex-1"
            >
              <Flag className="w-4 h-4 mr-2" />
              Resign
            </Button>
          )}
          
          {canDraw && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDraw}
              className={cn(
                'flex-1',
                showDrawConfirm && 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
              )}
            >
              <Handshake className="w-4 h-4 mr-2" />
              {showDrawConfirm ? 'Confirm Draw' : 'Offer Draw'}
            </Button>
          )}
        </div>
      )}

      {/* Game End Controls */}
      {['completed', 'draw'].includes(gameStatus) && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRematch}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Rematch
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => window.location.href = '/lobby'}
            className="flex-1"
          >
            <Crown className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>
      )}

      {/* Waiting for Opponent */}
      {gameStatus === 'pending' && (
        <div className="text-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">
            Waiting for an opponent to join...
          </p>
        </div>
      )}
    </Card>
  )
}


