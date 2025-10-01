import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Zap, Clock, Users, Trophy } from 'lucide-react'
import { useState } from 'react'

export const QuickMatchDemo: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false)
  const [searchTime, setSearchTime] = useState(0)

  const handleStartDemo = () => {
    setIsSearching(true)
    setSearchTime(0)
    
    // Simulate search
    const interval = setInterval(() => {
      setSearchTime(prev => {
        if (prev >= 10) {
          clearInterval(interval)
          setIsSearching(false)
          return 0
        }
        return prev + 1
      })
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-white">Quick Match Demo</h3>
        
        {!isSearching ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Click to start a demo of the Quick Match feature
            </p>
            <Button onClick={handleStartDemo} className="bg-blue-600 hover:bg-blue-700">
              <Zap className="w-4 h-4 mr-2" />
              Start Demo
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
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
                  {formatTime(searchTime)}
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
                  <span>10+0</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>1500-2000</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Rated</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(searchTime / 10) * 100}%` }}
              ></div>
            </div>

            <p className="text-sm text-muted-foreground">
              This is how the Quick Match feature will look when searching for opponents
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
