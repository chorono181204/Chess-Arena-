import React from 'react'
import type { Game } from '@/types/game'

type Props = {
  game: Game
}

export const ChessMoveHistory: React.FC<Props> = ({ game }) => {
  const moves = game.moves || []
  
  // Group moves into pairs (white, black)
  const movePairs = []
  for (let i = 0; i < moves.length; i += 2) {
    const whiteMove = moves[i]
    const blackMove = moves[i + 1]
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: whiteMove,
      black: blackMove
    })
  }

  return (
    <div className="w-full max-h-64 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-2 text-white">Move History</h3>
      <div className="space-y-1">
        {movePairs.map((pair, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className="w-8 text-gray-400">{pair.moveNumber}.</span>
            <div className="flex-1 flex gap-2">
              <span className="w-16 px-2 py-1 bg-white/10 rounded text-white">
                {pair.white}
              </span>
              {pair.black && (
                <span className="w-16 px-2 py-1 bg-black/20 rounded text-white">
                  {pair.black}
                </span>
              )}
            </div>
          </div>
        ))}
        {moves.length === 0 && (
          <p className="text-gray-400 text-sm">No moves yet</p>
        )}
      </div>
    </div>
  )
}