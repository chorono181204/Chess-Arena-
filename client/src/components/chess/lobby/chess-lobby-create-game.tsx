import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/lib/auth/use-auth'
import { useCreateGame } from '@/lib/use-create-game'
import { useSound } from '@/lib/use-sound'
import { Users, Zap } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { TimeControlSelector } from './time-control-selector'

interface CreateGameForm {
  timeControl: string
  isPublic: boolean
  isRated: boolean
  allowSpectators: boolean
  roomName?: string
  password?: string
}

export const ChessLobbyCreateGame: React.FC = () => {
  const { user } = useAuth()
  const createGame = useCreateGame()
  const sound = useSound()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState<CreateGameForm>({
    timeControl: '10+0',
    isPublic: true,
    isRated: true,
    allowSpectators: true,
    roomName: '',
    password: '',
  })


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      sound.playError()
      toast.error('You must be logged in to create a game')
      return
    }

    sound.playClick()
    setIsLoading(true)
    
    try {
      const game = await createGame.createPvPGame({
        whitePlayerId: user.id,
        timeControl: form.timeControl,
        isPublic: form.isPublic,
        isRated: form.isRated,
        allowSpectators: form.allowSpectators,
        roomName: form.roomName || undefined,
        password: form.password || undefined,
      })

      sound.playSuccess()
      toast.success('Game created successfully!')
      // TODO: Navigate to game
      console.log('Game created:', game)
    } catch (error) {
      sound.playError()
      toast.error('Failed to create game')
      console.error('Create game error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Create New Game</h3>
            </div>

            {/* Room Name */}
            <div className="space-y-2">
              <Label htmlFor="roomName">Room Name (Optional)</Label>
              <Input
                id="roomName"
                value={form.roomName}
                onChange={(e) => setForm({ ...form, roomName: e.target.value })}
                placeholder="Enter room name..."
                className="bg-white/5 border-white/10"
              />
            </div>

            {/* Time Control */}
            <div className="space-y-2">
              <Label htmlFor="timeControl">Time Control</Label>
              <TimeControlSelector
                value={form.timeControl}
                onValueChange={(value) => setForm({ ...form, timeControl: value })}
                placeholder="Select time control"
              />
            </div>

            {/* Game Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <Label htmlFor="isPublic">Public Game</Label>
                </div>
                <Switch
                  id="isPublic"
                  checked={form.isPublic}
                  onCheckedChange={(checked) => setForm({ ...form, isPublic: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="size-4" />
                  <Label htmlFor="isRated">Rated Game</Label>
                </div>
                <Switch
                  id="isRated"
                  checked={form.isRated}
                  onCheckedChange={(checked) => setForm({ ...form, isRated: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <Label htmlFor="allowSpectators">Allow Spectators</Label>
                </div>
                <Switch
                  id="allowSpectators"
                  checked={form.allowSpectators}
                  onCheckedChange={(checked) => setForm({ ...form, allowSpectators: checked })}
                />
              </div>
            </div>

            {/* Password (if private) */}
            {!form.isPublic && (
              <div className="space-y-2">
                <Label htmlFor="password">Room Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter room password..."
                  className="bg-white/5 border-white/10"
                />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Creating Game...' : 'Create Game'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
