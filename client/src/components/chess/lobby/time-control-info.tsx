import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Info, Clock, Zap, Trophy } from 'lucide-react'

export const TimeControlInfo: React.FC = () => {
  const timeControls = [
    {
      category: 'Bullet',
      icon: <Zap className="w-4 h-4 text-red-500" />,
      description: 'Very fast games, perfect for quick matches',
      controls: [
        { value: '1+0', label: 'Bullet 1+0', description: '1 minute per player, no increment' },
        { value: '2+1', label: 'Bullet 2+1', description: '2 minutes + 1 second per move' },
      ]
    },
    {
      category: 'Blitz',
      icon: <Clock className="w-4 h-4 text-orange-500" />,
      description: 'Fast-paced games with quick thinking',
      controls: [
        { value: '3+0', label: 'Blitz 3+0', description: '3 minutes per player, no increment' },
        { value: '5+0', label: 'Blitz 5+0', description: '5 minutes per player, no increment' },
        { value: '5+3', label: 'Blitz 5+3', description: '5 minutes + 3 seconds per move' },
      ]
    },
    {
      category: 'Rapid',
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      description: 'Balanced games with time to think',
      controls: [
        { value: '10+0', label: 'Rapid 10+0', description: '10 minutes per player, no increment' },
        { value: '15+10', label: 'Rapid 15+10', description: '15 minutes + 10 seconds per move' },
        { value: '25+10', label: 'Rapid 25+10', description: '25 minutes + 10 seconds per move' },
      ]
    },
    {
      category: 'Classical',
      icon: <Trophy className="w-4 h-4 text-green-500" />,
      description: 'Long games for deep strategic thinking',
      controls: [
        { value: '30+0', label: 'Classical 30+0', description: '30 minutes per player, no increment' },
        { value: '60+0', label: 'Classical 60+0', description: '1 hour per player, no increment' },
        { value: '90+30', label: 'Classical 90+30', description: '90 minutes + 30 seconds per move' },
      ]
    }
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
          <Info className="w-4 h-4 mr-1" />
          What are time controls?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Chess Time Controls Explained</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-muted-foreground">
            <p className="mb-4">
              Time controls determine how much time each player has to make their moves. 
              The format is typically <strong>X+Y</strong> where:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>X</strong> = Initial time (minutes) each player starts with</li>
              <li><strong>Y</strong> = Increment (seconds) added after each move</li>
            </ul>
          </div>

          <div className="grid gap-4">
            {timeControls.map((category) => (
              <Card key={category.category} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {category.icon}
                  <h3 className="text-lg font-semibold text-white">{category.category}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                
                <div className="grid gap-2">
                  {category.controls.map((control) => (
                    <div key={control.value} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <div>
                        <div className="font-semibold text-white">{control.label}</div>
                        <div className="text-sm text-muted-foreground">{control.description}</div>
                      </div>
                      <div className="text-sm font-mono text-blue-400">{control.value}</div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">💡 Tips for choosing time controls:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Beginners:</strong> Start with Rapid (10+0 or 15+10) to have time to think</li>
              <li>• <strong>Experienced players:</strong> Try Blitz (3+0 or 5+0) for faster games</li>
              <li>• <strong>Tournament practice:</strong> Use Classical (30+0 or 60+0) for serious games</li>
              <li>• <strong>Quick matches:</strong> Bullet (1+0 or 2+1) for very fast games</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
