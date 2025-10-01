import type { Game } from '@/types/game'
import type { GameRole } from '@/lib/types'
import { useChessInstance } from '@/lib/use-chess-instance'
import { useMove } from '@/lib/use-move'
import { Chess, SQUARES, type Square } from 'chess.js'
import type { Config } from 'chessground/config'
import type { Key, Role } from 'chessground/types'
import { useEffect, useState } from 'react'
import { Chessground } from './chessground'
import { ChessPromote } from './promote/chess-promote'
import { ChessSound } from './chess-sound'

export function toDests(chess: Chess): Map<Key, Key[]> {
  const dests = new Map()

  SQUARES.forEach((s) => {
    const ms = chess.moves({ square: s, verbose: true })
    if (ms.length)
      dests.set(
        s,
        ms.map((m) => m.to),
      )
  })

  return dests
}

type Props = {
  role: GameRole
  game: Game
}

type Promote = { from: Key; to: Key; color: 'white' | 'black' }

export const ChessBoard: React.FC<Props> = ({ role, game }) => {
  const { getInstance } = useChessInstance()

  const move = useMove({ gameId: game.id })
  const [moves, setMoves] = useState<Map<Key, Key[]>>(new Map())
  const [promote, setPromote] = useState<Promote>()

  useEffect(() => {
    if (game?.currentFen) {
      const chess = getInstance()
      chess.load(game.currentFen)
      const dests = toDests(chess)
      setMoves(dests)
    }
  }, [game?.currentFen])

  if (!game) {
    return <Chessground />
  }

  const onPromote = (piece: Role) => {
    if (!promote) return

    move(promote.from, promote.to, piece)
    setPromote(undefined)
  }

  // define based on the role
  const color = role === 'white' ? 'white' : role === 'black' ? 'black' : role === 'root' ? game.turn : undefined

  const config: Config = {
    fen: game.currentFen,
    orientation: role === 'black' ? 'black' : 'white',
    turnColor: game.turn,
    coordinates: true,
    lastMove: game.lastMove as Key[] | undefined,
    check: game.check ? game.turn : undefined,
    movable: { 
      color, 
      free: false, 
      showDests: true, 
      dests: moves,
      events: {
        after: (orig, dest, metadata) => {
          // Validate move trước khi gửi
          const chess = getInstance()
          const moveObj = chess.move({ from: orig, to: dest })
          
          if (moveObj) {
            // Move hợp lệ, gửi lên server
            move(orig, dest)
          } else {
            // Move không hợp lệ, revert
            console.log('Invalid move:', orig, dest)
            return false
          }
        }
      }
    },
    events: {
      move: (from, to) => {
        const chess = getInstance()
        const piece = chess.get(from as Square)
        const color = piece?.color === 'w' ? 'white' : 'black'
        const line = to[1]
        const isPawn = piece && piece.type === 'p'

        // Check for promotion
        if ((isPawn && color === 'white' && line === '8') || (isPawn && color === 'black' && line === '1')) {
          setPromote({ from, to, color })
        } else {
          // Regular move
          move(from, to)
        }
      },
    },
  }

  return (
    <>
      <Chessground config={config} />
      <ChessSound game={game} />
      <ChessPromote color={game.turn} isOpen={!!promote} onPromote={onPromote} />
    </>
  )
}
