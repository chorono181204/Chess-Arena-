import React from 'react'
import { cn } from '@/lib/utils'
import { Trophy, Calendar, Users, Award, Target, Zap } from 'lucide-react'

type TournamentInfo = {
  name: string
  type: 'Swiss' | 'Round Robin' | 'Knockout' | 'Blitz' | 'Rapid' | 'Classical'
  status: 'Upcoming' | 'Ongoing' | 'Finished'
  rounds: number
  currentRound: number
  players: number
  timeControl: string
  prize: string
  rating: string
  startDate: string
  endDate: string
}

type Props = {
  tournament?: TournamentInfo
}

export const ChessTournamentInfo: React.FC<Props> = ({ tournament }) => {
  // Mock tournament data
  const mockTournament: TournamentInfo = {
    name: 'Chess Arena Championship 2024',
    type: 'Swiss',
    status: 'Ongoing',
    rounds: 9,
    currentRound: 3,
    players: 128,
    timeControl: '15+10',
    prize: '$10,000',
    rating: 'FIDE Rated',
    startDate: '2024-01-15',
    endDate: '2024-01-23'
  }

  const tournamentData = tournament || mockTournament

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'Ongoing': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Finished': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Swiss': return <Users className="w-4 h-4" />
      case 'Round Robin': return <Target className="w-4 h-4" />
      case 'Knockout': return <Zap className="w-4 h-4" />
      default: return <Trophy className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold text-white mb-3">Tournament</h3>
      
      {/* Tournament Name */}
      <div className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-semibold text-sm">
            {tournamentData.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {getTypeIcon(tournamentData.type)}
          <span className="text-gray-300 text-xs">
            {tournamentData.type} Tournament
          </span>
        </div>
      </div>

      {/* Tournament Status */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Status:</span>
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium border',
          getStatusColor(tournamentData.status)
        )}>
          {tournamentData.status}
        </span>
      </div>

      {/* Current Round */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Round:</span>
        <span className="text-white font-semibold">
          {tournamentData.currentRound} / {tournamentData.rounds}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round((tournamentData.currentRound / tournamentData.rounds) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(tournamentData.currentRound / tournamentData.rounds) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Players Count */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Players:</span>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-white">{tournamentData.players}</span>
        </div>
      </div>

      {/* Time Control */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Time Control:</span>
        <span className="text-white">{tournamentData.timeControl}</span>
      </div>

      {/* Prize Pool */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Prize:</span>
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4 text-yellow-400" />
          <span className="text-white font-semibold">{tournamentData.prize}</span>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Rating:</span>
        <span className="text-white text-sm">{tournamentData.rating}</span>
      </div>

      {/* Dates */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Start:</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm">
              {formatDate(tournamentData.startDate)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">End:</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-red-400" />
            <span className="text-white text-sm">
              {formatDate(tournamentData.endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Tournament Rules */}
      <div className="p-3 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-2">Tournament Rules</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Swiss system pairing</li>
          <li>• FIDE rules apply</li>
          <li>• No draw offers before move 30</li>
          <li>• Tie-breaks: Buchholz, Sonneborn-Berger</li>
        </ul>
      </div>
    </div>
  )
}







