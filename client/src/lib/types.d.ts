import type { Player } from '@/types/game'

export type Players = {
  white: Player
  black: Player
}

export type GameRole = 'white' | 'black' | 'spectator' | 'root'

export type GameWithRole = Game & { role: GameRole }
