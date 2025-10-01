import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Crown, Clock, Trophy } from 'lucide-react'

interface Player {
  id: string
  name: string
  avatar?: string
  rating?: number
  isOnline?: boolean
}

interface ChessPlayerInfoProps {
  player: Player
  color: 'white' | 'black'
  isCurrentTurn?: boolean
  timeLeft?: number
  isWinner?: boolean
  className?: string
}

export const ChessPlayerInfo: React.FC<ChessPlayerInfoProps> = ({
  player,
  color,
  isCurrentTurn = false,
  timeLeft,
  isWinner = false,
  className,
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Card
      className={cn(
        'p-3 transition-all duration-200',
        isCurrentTurn && 'ring-2 ring-blue-500 bg-blue-500/10',
        isWinner && 'ring-2 ring-yellow-500 bg-yellow-500/10',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Player Avatar */}
        <div className="relative">
          <Avatar className="w-10 h-10">
            {player.avatar ? (
              <img src={player.avatar} alt={player.name} />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center">
                <span className="text-lg font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </Avatar>
          
          {/* Online indicator */}
          {player.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
          )}
          
          {/* Winner crown */}
          {isWinner && (
            <div className="absolute -top-1 -right-1">
              <Crown className="w-4 h-4 text-yellow-500" />
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{player.name}</h3>
            {isCurrentTurn && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="w-3 h-3" />
            <span>{player.rating || 'Unrated'}</span>
          </div>
        </div>

        {/* Time Display */}
        {timeLeft !== undefined && (
          <div className="flex items-center gap-1 text-lg font-mono">
            <Clock className="w-4 h-4" />
            <span className={cn(
              'font-bold',
              timeLeft < 60 && 'text-red-500',
              timeLeft < 300 && timeLeft >= 60 && 'text-yellow-500'
            )}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}


