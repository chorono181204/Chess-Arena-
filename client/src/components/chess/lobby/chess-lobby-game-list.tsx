import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/use-auth'
import { useGetPublicGames } from '@/lib/use-get-public-games'
import { Users, User } from 'lucide-react'
import { useState, useMemo } from 'react'
import { GameFilters } from './game-filters'
import { useSound } from '@/lib/use-sound'

interface GameRoom {
  id: string
  whitePlayer: {
    id: string
    name: string
    avatar?: string
    rating?: number
  }
  timeControl?: string
  isPublic: boolean
  createdAt: string
}

interface GameFilters {
  timeControl: string[]
  ratingRange: string[]
}

export const ChessLobbyGameList: React.FC = () => {
  const { user } = useAuth()
  const { data: games, isLoading, refetch } = useGetPublicGames()
  const [selectedGame, setSelectedGame] = useState<GameRoom | null>(null)
  const [filters, setFilters] = useState<GameFilters>({
    timeControl: [],
    ratingRange: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const { playClick } = useSound()

  const handleJoinGame = (gameId: string) => {
    // TODO: Implement join game logic
    console.log('Joining game:', gameId)
  }

  const handleSpectateGame = (gameId: string) => {
    // TODO: Implement spectate game logic
    console.log('Spectating game:', gameId)
  }

  // Filter games based on search query and filters
  const filteredGames = useMemo(() => {
    if (!games) return []

    return games.filter(game => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const playerName = game.whitePlayer.name.toLowerCase()
        if (!playerName.includes(query)) {
          return false
        }
      }

      // Time control filter
      if (filters.timeControl.length > 0 && game.timeControl) {
        if (!filters.timeControl.includes(game.timeControl)) {
          return false
        }
      }

      // Rating range filter
      if (filters.ratingRange.length > 0 && game.whitePlayer.rating) {
        const rating = game.whitePlayer.rating
        const matchesRatingRange = filters.ratingRange.some(range => {
          const [min, max] = range.split('-').map(Number)
          if (range.endsWith('+')) {
            return rating >= min
          }
          return rating >= min && rating <= max
        })
        if (!matchesRatingRange) {
          return false
        }
      }

      return true
    })
  }, [games, searchQuery, filters])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/80">Loading available games...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter and Search */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <GameFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>

      {/* Games List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-4">
          {filteredGames?.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-white/80 mb-4">
                <Users className="size-12 mx-auto mb-2" />
                <p>{games?.length === 0 ? 'No games available' : 'No games match your filters'}</p>
                <p className="text-sm">
                  {games?.length === 0 ? 'Be the first to create a game!' : 'Try adjusting your search or filters'}
                </p>
              </div>
            </Card>
          ) : (
            filteredGames?.map((game) => (
              <Card key={game.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                        <User className="size-5" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{game.whitePlayer.name}</div>
                        <div className="text-sm text-white/80">
                          Rating: {game.whitePlayer.rating || 'Unrated'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-white/80">vs</div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                        <Users className="size-5" />
                      </div>
                      <div>
                        <div className="font-medium text-white/80">Waiting for opponent</div>
                        <div className="text-sm text-white/80">
                          {game.timeControl || 'No time limit'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {game.whitePlayer.id !== user?.id ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          playClick()
                          handleJoinGame(game.id)
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Join Game
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        Your Game
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        playClick()
                        handleSpectateGame(game.id)
                      }}
                    >
                      Spectate
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
