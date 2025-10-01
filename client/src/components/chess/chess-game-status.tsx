import React from 'react'
import type { Game } from '@/types/game'
import { cn } from '@/lib/utils'

type Props = {
  game: Game
}

export const ChessGameStatus: React.FC<Props> = ({ game }) => {
  const getStatusMessage = () => {
    if (game.checkmate) {
      return {
        message: `${game.turn === 'white' ? 'Black' : 'White'} wins by checkmate!`,
        type: 'checkmate',
        color: 'text-red-400'
      }
    }
    
    if (game.stalemate) {
      return {
        message: 'Draw by stalemate',
        type: 'stalemate',
        color: 'text-yellow-400'
      }
    }
    
    if (game.draw) {
      return {
        message: 'Game ended in a draw',
        type: 'draw',
        color: 'text-gray-400'
      }
    }
    
    if (game.check) {
      return {
        message: `${game.turn === 'white' ? 'White' : 'Black'} is in check!`,
        type: 'check',
        color: 'text-orange-400'
      }
    }
    
    if (game.status === 'PENDING') {
      return {
        message: 'Waiting for players...',
        type: 'pending',
        color: 'text-blue-400'
      }
    }
    
    if (game.status === 'ACTIVE') {
      return {
        message: `${game.turn === 'white' ? 'White' : 'Black'} to move`,
        type: 'active',
        color: 'text-green-400'
      }
    }
    
    return {
      message: 'Game in progress',
      type: 'active',
      color: 'text-green-400'
    }
  }

  const status = getStatusMessage()

  return (
    <div className="w-full">
      <div className={cn(
        'px-4 py-2 rounded-lg text-center font-semibold',
        status.type === 'checkmate' && 'bg-red-500/20 border border-red-500/30',
        status.type === 'stalemate' && 'bg-yellow-500/20 border border-yellow-500/30',
        status.type === 'draw' && 'bg-gray-500/20 border border-gray-500/30',
        status.type === 'check' && 'bg-orange-500/20 border border-orange-500/30',
        status.type === 'pending' && 'bg-blue-500/20 border border-blue-500/30',
        status.type === 'active' && 'bg-green-500/20 border border-green-500/30'
      )}>
        <span className={status.color}>
          {status.message}
        </span>
      </div>
    </div>
  )
}







