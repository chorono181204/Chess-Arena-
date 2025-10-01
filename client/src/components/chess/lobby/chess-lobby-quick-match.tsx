import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/lib/auth/use-auth'
import { useQuickMatch } from '@/lib/use-quick-match'
import { useSound } from '@/lib/use-sound'
import { Clock, Zap, Users, Trophy, X, CheckCircle, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { TimeControlSelector } from './time-control-selector'
import { RatingRangeSelector } from './rating-range-selector'

interface QuickMatchSettings {
  timeControl: string
  ratingRange: string
  isRated: boolean
}

export const ChessLobbyQuickMatch: React.FC = () => {
  const { user } = useAuth()
  const quickMatch = useQuickMatch()
  const sound = useSound()
  const [isSearching, setIsSearching] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [foundMatch, setFoundMatch] = useState<any>(null)
  const [showMatchDialog, setShowMatchDialog] = useState(false)
  const [declineTimer, setDeclineTimer] = useState(30)
  const [settings, setSettings] = useState<QuickMatchSettings>({
    timeControl: '10+0',
    ratingRange: 'any',
    isRated: true,
  })



  // Timer effect for search countdown
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isSearching])

  // Auto-decline timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (showMatchDialog && declineTimer > 0) {
      interval = setInterval(() => {
        setDeclineTimer(prev => {
          if (prev <= 1) {
            handleDeclineMatch()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [showMatchDialog, declineTimer])

  const handleQuickMatch = async () => {
    if (!user) {
      sound.playError()
      toast.error('You must be logged in to start a quick match')
      return
    }

    sound.playClick()
    sound.playSearchStart()
    setIsSearching(true)
    setSearchTime(0)
    
    try {
      const game = await quickMatch.mutateAsync({
        timeControl: settings.timeControl,
        ratingRange: settings.ratingRange,
        isRated: settings.isRated,
      })

      if (game) {
        sound.playMatchFound()
        setFoundMatch(game)
        setShowMatchDialog(true)
        setDeclineTimer(30)
        setIsSearching(false)
      } else {
        // Continue searching - don't stop
        sound.playCountdown()
        toast.info('Still searching for opponent...')
        // Continue the search by calling again after a short delay
        setTimeout(() => {
          if (isSearching) {
            handleQuickMatch()
          }
        }, 2000)
      }
    } catch (error) {
      sound.playError()
      toast.error('Failed to find match')
      console.error('Quick match error:', error)
      setIsSearching(false)
    }
  }

  const handleCancelSearch = () => {
    sound.playClick()
    sound.playSearchEnd()
    setIsSearching(false)
    setSearchTime(0)
    toast.info('Search cancelled')
  }

  const handleAcceptMatch = () => {
    if (foundMatch) {
      sound.playMatchAccepted()
      sound.playSuccess()
      toast.success('Match accepted! Starting game...')
      setShowMatchDialog(false)
      // TODO: Navigate to game
      console.log('Accepted match:', foundMatch)
    }
  }

  const handleDeclineMatch = () => {
    sound.playMatchDeclined()
    toast.info('Match declined')
    setShowMatchDialog(false)
    setFoundMatch(null)
    // Continue searching
    setIsSearching(true)
  }

  const formatSearchTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Quick Match</h3>
              <p className="text-muted-foreground">
                Find an opponent quickly based on your preferences
              </p>
            </div>

            {!isSearching ? (
              <>
                {/* Time Control */}
                <div className="space-y-2">
                  <Label htmlFor="timeControl">Time Control</Label>
                  <TimeControlSelector
                    value={settings.timeControl}
                    onValueChange={(value) => setSettings({ ...settings, timeControl: value })}
                    placeholder="Select time control"
                  />
                </div>

                {/* Rating Range */}
                <div className="space-y-2">
                  <Label htmlFor="ratingRange">Rating Range</Label>
                  <RatingRangeSelector
                    value={settings.ratingRange}
                    onChange={(value) => setSettings({ ...settings, ratingRange: value })}
                  />
                </div>

                {/* Rated Game */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4" />
                    <Label htmlFor="isRated">Rated Game</Label>
                  </div>
                  <Switch
                    id="isRated"
                    checked={settings.isRated}
                    onCheckedChange={(checked: boolean) => setSettings({ ...settings, isRated: checked })}
                  />
                </div>

                {/* Start Search Button */}
                <Button
                  onClick={handleQuickMatch}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Zap className="size-4 mr-2" />
                  Find Match
                </Button>
              </>
            ) : (
              /* Searching State */
              <div className="text-center space-y-6">
                {/* Animated Search Icon */}
                <div className="relative">
                  <div className="w-20 h-20 mx-auto relative">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-2 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  {/* Search Time Counter */}
                  <div className="mt-4">
                    <div className="text-3xl font-mono font-bold text-blue-500">
                      {formatSearchTime(searchTime)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Searching for opponent...
                    </div>
                  </div>
                </div>

                {/* Search Details */}
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-white">Finding Your Match</h4>
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{settings.timeControl}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      <span>{settings.ratingRange}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{settings.isRated ? 'Rated' : 'Casual'}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((searchTime / 30) * 100, 100)}%` }}
                  ></div>
                </div>

                {/* Cancel Button */}
                <Button
                  onClick={handleCancelSearch}
                  variant="outline"
                  className="w-full bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Search
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Matchmaking Stats */}
        <Card className="p-4 mt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">1,234</div>
              <div className="text-sm text-muted-foreground">Online Players</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">89</div>
              <div className="text-sm text-muted-foreground">Active Games</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-sm text-muted-foreground">Waiting for Match</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Match Found Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-white">
              Match Found!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Match Details */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Opponent Found
                </h3>
                <p className="text-muted-foreground">
                  A suitable opponent has been found for your game.
                </p>
              </div>
            </div>

            {/* Opponent Info */}
            {foundMatch && (
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time Control:</span>
                  <span className="font-semibold text-white">{foundMatch.game.timeControl}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Game Type:</span>
                  <span className="font-semibold text-white">
                    {settings.isRated ? 'Rated' : 'Casual'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Opponent:</span>
                  <span className="font-semibold text-white">
                    {foundMatch.game.whitePlayer.name} ({foundMatch.game.whitePlayer.rating})
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleDeclineMatch}
                variant="outline"
                className="flex-1 bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline
              </Button>
              <Button
                onClick={handleAcceptMatch}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept
              </Button>
            </div>

            {/* Auto-decline timer */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                This match will auto-decline in <span className="font-semibold text-yellow-500">{declineTimer}</span> seconds
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
