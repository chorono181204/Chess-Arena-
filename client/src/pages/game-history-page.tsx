import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/use-auth'
import { usePageTitle } from '@/lib/use-page-title'
import { 
  Clock, 
  Trophy, 
  Users, 
  Eye, 
  Download,
  Filter,
  Calendar,
  User,
  Timer
} from 'lucide-react'
import { useState } from 'react'

interface GameHistory {
  id: string
  opponent: {
    name: string
    rating: number
    avatar?: string
  }
  result: 'win' | 'loss' | 'draw'
  timeControl: string
  playedAt: string
  duration: string
  moves: number
}

export const GameHistoryPage = () => {
  const { user } = useAuth()
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'draw'>('all')
  const [timeFilter, setTimeFilter] = useState<string>('all')
  
  usePageTitle('Lịch sử đấu')

  // Mock data - trong thực tế sẽ fetch từ API
  const gameHistory: GameHistory[] = [
    {
      id: '1',
      opponent: { name: 'ChessMaster123', rating: 1850 },
      result: 'win',
      timeControl: '10+0',
      playedAt: '2024-01-15T10:30:00Z',
      duration: '8m 32s',
      moves: 45
    },
    {
      id: '2',
      opponent: { name: 'RapidPlayer', rating: 1750 },
      result: 'loss',
      timeControl: '5+3',
      playedAt: '2024-01-14T15:45:00Z',
      duration: '6m 12s',
      moves: 32
    },
    {
      id: '3',
      opponent: { name: 'BlitzKing', rating: 1900 },
      result: 'draw',
      timeControl: '3+0',
      playedAt: '2024-01-13T20:15:00Z',
      duration: '5m 45s',
      moves: 28
    },
    {
      id: '4',
      opponent: { name: 'GrandmasterPro', rating: 2200 },
      result: 'loss',
      timeControl: '15+10',
      playedAt: '2024-01-12T14:20:00Z',
      duration: '25m 18s',
      moves: 67
    },
    {
      id: '5',
      opponent: { name: 'ClassicalPlayer', rating: 1650 },
      result: 'win',
      timeControl: '30+0',
      playedAt: '2024-01-11T09:30:00Z',
      duration: '18m 45s',
      moves: 52
    },
  ]

  const filteredGames = gameHistory.filter(game => {
    if (filter !== 'all' && game.result !== filter) return false
    if (timeFilter !== 'all' && !game.timeControl.includes(timeFilter)) return false
    return true
  })

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-green-400'
      case 'loss': return 'text-red-400'
      case 'draw': return 'text-yellow-400'
      default: return 'text-white'
    }
  }

  const getResultText = (result: string) => {
    switch (result) {
      case 'win': return 'Thắng'
      case 'loss': return 'Thua'
      case 'draw': return 'Hòa'
      default: return result
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const stats = {
    total: gameHistory.length,
    wins: gameHistory.filter(g => g.result === 'win').length,
    losses: gameHistory.filter(g => g.result === 'loss').length,
    draws: gameHistory.filter(g => g.result === 'draw').length,
  }

  const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0

  return (
    <div className="flex flex-col gap-6 items-center justify-center w-full h-[calc(100vh-4rem)] p-6">
      <div className="flex flex-col gap-6 items-center justify-center w-full max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Game History</h1>
          <p className="text-xl text-white/70">
            Review your games and statistics
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <Card className="p-4 text-center bg-white/10">
            <div className="flex flex-col items-center gap-2">
              <Trophy className="w-6 h-6 text-blue-400" />
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-white/80">Total Games</div>
            </div>
          </Card>
          <Card className="p-4 text-center bg-white/10">
            <div className="flex flex-col items-center gap-2">
              <Trophy className="w-6 h-6 text-green-400" />
              <div className="text-2xl font-bold text-white">{stats.wins}</div>
              <div className="text-sm text-white/80">Wins</div>
            </div>
          </Card>
          <Card className="p-4 text-center bg-white/10">
            <div className="flex flex-col items-center gap-2">
              <Trophy className="w-6 h-6 text-red-400" />
              <div className="text-2xl font-bold text-white">{stats.losses}</div>
              <div className="text-sm text-white/80">Losses</div>
            </div>
          </Card>
          <Card className="p-4 text-center bg-white/10">
            <div className="flex flex-col items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <div className="text-2xl font-bold text-white">{winRate}%</div>
              <div className="text-sm text-white/80">Win Rate</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 w-full">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/80" />
            <span className="text-white/80">Filter:</span>
          </div>
          
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'win', label: 'Wins' },
              { value: 'loss', label: 'Losses' },
              { value: 'draw', label: 'Draws' }
            ].map(option => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option.value as any)}
                className={filter === option.value ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/10 border-white/20'}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Game List */}
        <div className="w-full space-y-4 max-h-96 overflow-y-auto">
          {filteredGames.length === 0 ? (
            <Card className="p-8 text-center bg-white/10">
              <div className="text-white/80">
                <Trophy className="w-12 h-12 mx-auto mb-2" />
                <p>No games found</p>
                <p className="text-sm">Start playing to see your game history!</p>
              </div>
            </Card>
          ) : (
            filteredGames.map((game) => (
              <Card key={game.id} className="p-4 hover:bg-white/10 transition-colors bg-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Opponent Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{game.opponent.name}</div>
                        <div className="text-sm text-white/80">Rating: {game.opponent.rating}</div>
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="flex items-center gap-4 text-sm text-white/80">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{game.timeControl}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        <span>{game.duration}</span>
                      </div>
                      <div>
                        <span>{game.moves} nước</span>
                      </div>
                    </div>
                  </div>

                  {/* Result and Actions */}
                  <div className="flex items-center gap-4">
                    <div className={`text-right ${getResultColor(game.result)}`}>
                      <div className="font-semibold">{getResultText(game.result)}</div>
                      <div className="text-xs text-white/80">{formatDate(game.playedAt)}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-white/10 border-white/20">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
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
