import React, { useState, useEffect } from 'react'
import type { Game } from '@/types/game'
import { cn } from '@/lib/utils'

type Props = {
  game: Game
}

export const ChessTimer: React.FC<Props> = ({ game }) => {
  const [whiteTime, setWhiteTime] = useState(300) // 5 minutes in seconds
  const [blackTime, setBlackTime] = useState(300)
  const [isActive, setIsActive] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white')

  // Parse time control (e.g., "5+0", "10+5", "15+10")
  const parseTimeControl = (timeControl: string) => {
    const [base, increment] = timeControl.split('+').map(Number)
    return { base: base * 60, increment: increment || 0 } // Convert to seconds
  }

  useEffect(() => {
    const { base } = parseTimeControl(game.timeControl)
    setWhiteTime(base)
    setBlackTime(base)
  }, [game.timeControl])

  useEffect(() => {
    setCurrentPlayer(game.turn)
  }, [game.turn])

  useEffect(() => {
    if (game.status === 'ACTIVE' && !game.checkmate && !game.stalemate && !game.draw) {
      setIsActive(true)
    } else {
      setIsActive(false)
    }
  }, [game.status, game.checkmate, game.stalemate, game.draw])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        if (currentPlayer === 'white') {
          setWhiteTime((time) => {
            if (time <= 1) {
              // Time's up for white
              setIsActive(false)
              return 0
            }
            return time - 1
          })
        } else {
          setBlackTime((time) => {
            if (time <= 1) {
              // Time's up for black
              setIsActive(false)
              return 0
            }
            return time - 1
          })
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, currentPlayer])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = (time: number, isCurrentPlayer: boolean) => {
    if (time <= 10) return 'text-red-500'
    if (time <= 30) return 'text-orange-500'
    if (isCurrentPlayer) return 'text-blue-400'
    return 'text-gray-300'
  }

  const isWhiteCurrent = currentPlayer === 'white'
  const isBlackCurrent = currentPlayer === 'black'

  return (
    <div className="w-full space-y-3">
      <h3 className="text-lg font-semibold text-white mb-3">Chess Clock</h3>
      
      {/* White Timer */}
      <div className={cn(
        'p-3 rounded-lg border-2 transition-all duration-200',
        isWhiteCurrent 
          ? 'border-blue-500 bg-blue-500/10' 
          : 'border-gray-600 bg-gray-800/50'
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <span className="text-white font-medium">White</span>
            {isWhiteCurrent && (
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            )}
          </div>
          <span className={cn(
            'text-2xl font-mono font-bold',
            getTimeColor(whiteTime, isWhiteCurrent)
          )}>
            {formatTime(whiteTime)}
          </span>
        </div>
        {whiteTime <= 10 && whiteTime > 0 && (
          <div className="text-xs text-red-400 animate-pulse">
            Time running low!
          </div>
        )}
        {whiteTime === 0 && (
          <div className="text-xs text-red-500 font-semibold">
            Time's up! Black wins
          </div>
        )}
      </div>

      {/* Black Timer */}
      <div className={cn(
        'p-3 rounded-lg border-2 transition-all duration-200',
        isBlackCurrent 
          ? 'border-blue-500 bg-blue-500/10' 
          : 'border-gray-600 bg-gray-800/50'
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-black border border-gray-400"></div>
            <span className="text-white font-medium">Black</span>
            {isBlackCurrent && (
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            )}
          </div>
          <span className={cn(
            'text-2xl font-mono font-bold',
            getTimeColor(blackTime, isBlackCurrent)
          )}>
            {formatTime(blackTime)}
          </span>
        </div>
        {blackTime <= 10 && blackTime > 0 && (
          <div className="text-xs text-red-400 animate-pulse">
            Time running low!
          </div>
        )}
        {blackTime === 0 && (
          <div className="text-xs text-red-500 font-semibold">
            Time's up! White wins
          </div>
        )}
      </div>

      {/* Game Status */}
      <div className="text-center text-sm text-gray-400">
        {game.timeControl} • {isActive ? 'Active' : 'Paused'}
      </div>
    </div>
  )
}







