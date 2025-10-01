import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Clock, Zap, Trophy } from 'lucide-react'
import { useState } from 'react'

interface TimeControlSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export const TimeControlSelector: React.FC<TimeControlSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Select time control"
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const timeControls = [
    {
      category: 'Bullet',
      icon: <Zap className="w-4 h-4 text-red-500" />,
      controls: [
        { value: '1+0', label: 'Bullet 1+0', description: '1 minute per player' },
        { value: '2+1', label: 'Bullet 2+1', description: '2 minutes + 1 second per move' },
      ]
    },
    {
      category: 'Blitz',
      icon: <Clock className="w-4 h-4 text-orange-500" />,
      controls: [
        { value: '3+0', label: 'Blitz 3+0', description: '3 minutes per player' },
        { value: '5+0', label: 'Blitz 5+0', description: '5 minutes per player' },
        { value: '5+3', label: 'Blitz 5+3', description: '5 minutes + 3 seconds per move' },
      ]
    },
    {
      category: 'Rapid',
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      controls: [
        { value: '10+0', label: 'Rapid 10+0', description: '10 minutes per player' },
        { value: '15+10', label: 'Rapid 15+10', description: '15 minutes + 10 seconds per move' },
        { value: '25+10', label: 'Rapid 25+10', description: '25 minutes + 10 seconds per move' },
      ]
    },
    {
      category: 'Classical',
      icon: <Trophy className="w-4 h-4 text-green-500" />,
      controls: [
        { value: '30+0', label: 'Classical 30+0', description: '30 minutes per player' },
        { value: '60+0', label: 'Classical 60+0', description: '1 hour per player' },
        { value: '90+30', label: 'Classical 90+30', description: '90 minutes + 30 seconds per move' },
      ]
    }
  ]

  const selectedControl = timeControls
    .flatMap(category => category.controls)
    .find(control => control.value === value)

  const handleSelect = (controlValue: string) => {
    onValueChange(controlValue)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <span className="flex items-center gap-2">
            {selectedControl && (
              <>
                {timeControls
                  .find(cat => cat.controls.some(c => c.value === selectedControl.value))
                  ?.icon}
                <span>{selectedControl.label}</span>
              </>
            )}
            {!selectedControl && placeholder}
          </span>
          <Clock className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Choose Time Control</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {timeControls.map((category) => (
            <div key={category.category} className="space-y-3">
              <div className="flex items-center gap-3">
                {category.icon}
                <h3 className="text-lg font-semibold text-white">{category.category}</h3>
              </div>
              
              <div className="grid gap-2">
                {category.controls.map((control) => (
                  <Button
                    key={control.value}
                    variant={value === control.value ? "default" : "outline"}
                    className={`w-full justify-start p-4 h-auto ${
                      value === control.value 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                    onClick={() => handleSelect(control.value)}
                  >
                    <div className="flex flex-col items-start">
                      <div className="font-semibold">{control.label}</div>
                      <div className="text-sm opacity-70">{control.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">💡 Quick Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Beginners:</strong> Start with Rapid (10+0 or 15+10)</li>
              <li>• <strong>Experienced:</strong> Try Blitz (3+0 or 5+0) for faster games</li>
              <li>• <strong>Tournament:</strong> Use Classical (30+0 or 60+0) for serious games</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


