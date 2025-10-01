import React from 'react'
import type { Game } from '@/types/game'
import { cn } from '@/lib/utils'
import { Clock, Users, Trophy, Star, Shield, Eye } from 'lucide-react'

type Props = {
  game: Game
}

export const ChessGameInfo: React.FC<Props> = ({ game }) => {
  const getStatusBadge = () => {
    if (game.checkmate) {
      return { text: 'Checkmate', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
    }
    if (game.stalemate) {
      return { text: 'Stalemate', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
    }
    if (game.draw) {
      return { text: 'Draw', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
    }
    if (game.check) {
      return { text: 'Check', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
    }
    if (game.status === 'PENDING') {
      return { text: 'Waiting', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    }
    return { text: 'Active', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
  }

  const status = getStatusBadge()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getGameType = () => {
    if (game.isRated) return 'Rated'
    if (game.isPublic) return 'Public'
    return 'Private'
  }

  const getTimeControlDisplay = () => {
    const [base, increment] = game.timeControl.split('+')
    return `${base} min${increment ? ` + ${increment}s` : ''}`
  }

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold text-white mb-3">Game Information</h3>
      
      {/* Game Status */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Status:</span>
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium border',
          status.color
        )}>
          {status.text}
        </span>
      </div>

      {/* Game Type */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Type:</span>
        <div className="flex items-center gap-1">
          {game.isRated ? (
            <Trophy className="w-4 h-4 text-yellow-400" />
          ) : (
            <Shield className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-white">{getGameType()}</span>
        </div>
      </div>

      {/* Time Control */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Time Control:</span>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-white">{getTimeControlDisplay()}</span>
        </div>
      </div>

      {/* Players */}
      <div className="space-y-2">
        <span className="text-gray-400">Players:</span>
        <div className="space-y-2">
          {/* White Player */}
          <div className="flex items-center justify-between p-2 bg-white/5 rounded">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <span className="text-white font-medium">
                {game.whitePlayer?.name || 'White Player'}
              </span>
              {game.players.white.ai && (
                <Star className="w-3 h-3 text-purple-400" />
              )}
            </div>
            <span className="text-xs text-gray-400">
              {game.players.white.ai ? 'AI' : 'Human'}
            </span>
          </div>

          {/* Black Player */}
          <div className="flex items-center justify-between p-2 bg-black/20 rounded">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-black border border-gray-400"></div>
              <span className="text-white font-medium">
                {game.blackPlayer?.name || 'Black Player'}
              </span>
              {game.players.black.ai && (
                <Star className="w-3 h-3 text-purple-400" />
              )}
            </div>
            <span className="text-xs text-gray-400">
              {game.players.black.ai ? 'AI' : 'Human'}
            </span>
          </div>
        </div>
      </div>

      {/* Spectators */}
      {game.allowSpectators && (
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Spectators:</span>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4 text-green-400" />
            <span className="text-white">Allowed</span>
          </div>
        </div>
      )}

      {/* Game Duration */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Started:</span>
        <span className="text-white text-sm">
          {formatDate(game.createdAt)}
        </span>
      </div>

      {/* Move Count */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Moves:</span>
        <span className="text-white font-mono">
          {game.moves?.length || 0}
        </span>
      </div>

      {/* Game ID */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Game ID:</span>
        <span className="text-white text-xs font-mono bg-gray-800 px-2 py-1 rounded">
          {game.id.slice(0, 8)}...
        </span>
      </div>
    </div>
  )
}







