import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useSound } from '@/lib/use-sound'
import { Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'

export const SoundTest: React.FC = () => {
  const sound = useSound()
  const [isMuted, setIsMuted] = useState(false)

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // In a real implementation, you would control the global volume here
  }

  const soundTests = [
    { name: 'Click', action: sound.playClick, color: 'bg-blue-500' },
    { name: 'Success', action: sound.playSuccess, color: 'bg-green-500' },
    { name: 'Error', action: sound.playError, color: 'bg-red-500' },
    { name: 'Search Start', action: sound.playSearchStart, color: 'bg-purple-500' },
    { name: 'Search End', action: sound.playSearchEnd, color: 'bg-orange-500' },
    { name: 'Countdown', action: sound.playCountdown, color: 'bg-yellow-500' },
    { name: 'Match Found', action: sound.playMatchFound, color: 'bg-pink-500' },
    { name: 'Match Accepted', action: sound.playMatchAccepted, color: 'bg-emerald-500' },
    { name: 'Match Declined', action: sound.playMatchDeclined, color: 'bg-rose-500' },
    { name: 'Chess Move', action: sound.playMove, color: 'bg-indigo-500' },
    { name: 'Check', action: sound.playCheck, color: 'bg-amber-500' },
    { name: 'Checkmate', action: sound.playCheckmate, color: 'bg-violet-500' },
  ]

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Sound Test</h3>
          <Button
            onClick={toggleMute}
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {soundTests.map((test) => (
            <Button
              key={test.name}
              onClick={test.action}
              className={`${test.color} hover:opacity-80 text-white`}
              size="sm"
            >
              {test.name}
            </Button>
          ))}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Click buttons to test sounds. Make sure your volume is up!</p>
          <p className="mt-1">
            <strong>Note:</strong> Sound files need to be placed in <code>/public/sounds/</code> directory.
          </p>
        </div>
      </div>
    </Card>
  )
}


