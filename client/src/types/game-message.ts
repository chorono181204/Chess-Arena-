export interface GameMessage {
  id: string
  gameId: string
  userId: string
  content: string
  type: 'move' | 'chat' | 'system'
  createdAt: string
  user?: {
    id: string
    name: string
    avatar?: string
  }
}

