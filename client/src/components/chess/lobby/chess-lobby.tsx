import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Panel } from '@/components/ui/panel'
import { useAuth } from '@/lib/auth/use-auth'
import { useDeviceWidth } from '@/lib/use-device-width'
import { cn } from '@/lib/utils'
import { Clock, Users, Zap, Trophy, Search, Plus } from 'lucide-react'
import { useState } from 'react'
import { ChessLobbyGameList } from './chess-lobby-game-list'
import { ChessLobbyCreateGame } from './chess-lobby-create-game'
import { ChessLobbyQuickMatch } from './chess-lobby-quick-match'
import { useSound } from '@/lib/use-sound'

type LobbyTab = 'browse' | 'create' | 'quick'

export const ChessLobby: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LobbyTab>('browse')
  const isMobile = useDeviceWidth() < 768
  const { user } = useAuth()
  const { playClick } = useSound()

  const tabs = [
    { id: 'browse' as const, label: 'Browse Games', icon: Search },
    { id: 'create' as const, label: 'Create Room', icon: Plus },
    { id: 'quick' as const, label: 'Quick Match', icon: Zap },
  ]

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 p-4 border-b-2 border-white/5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Chess Lobby</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            <span>Online: 1,234 players</span>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  playClick()
                  setActiveTab(tab.id)
                }}
                className="flex items-center gap-2"
              >
                <Icon className="size-4" />
                {tab.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'browse' && <ChessLobbyGameList />}
        {activeTab === 'create' && <ChessLobbyCreateGame />}
        {activeTab === 'quick' && <ChessLobbyQuickMatch />}
      </div>
    </div>
  )
}
