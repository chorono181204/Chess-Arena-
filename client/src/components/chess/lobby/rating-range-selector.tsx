import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trophy, Target, Star, Crown } from 'lucide-react'
import { useState } from 'react'

interface RatingRangeSelectorProps {
  value: string
  onChange: (value: string) => void
}

interface RatingOption {
  value: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const ratingOptions: RatingOption[] = [
  {
    value: 'any',
    label: 'Any Rating',
    description: 'Match with players of any skill level',
    icon: Target,
    color: 'text-gray-400'
  },
  {
    value: '0-1000',
    label: 'Beginner (0-1000)',
    description: 'New to chess, learning the basics',
    icon: Star,
    color: 'text-green-400'
  },
  {
    value: '1000-1500',
    label: 'Club Player (1000-1500)',
    description: 'Knows the rules, developing strategy',
    icon: Trophy,
    color: 'text-blue-400'
  },
  {
    value: '1500-2000',
    label: 'Expert (1500-2000)',
    description: 'Strong tactical and positional understanding',
    icon: Crown,
    color: 'text-purple-400'
  },
  {
    value: '2000+',
    label: 'Master (2000+)',
    description: 'Advanced players with deep chess knowledge',
    icon: Crown,
    color: 'text-yellow-400'
  }
]

export const RatingRangeSelector: React.FC<RatingRangeSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = ratingOptions.find(option => option.value === value) || ratingOptions[0]

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full justify-between bg-white/10 border-white/20 text-white hover:bg-white/15"
      >
        <div className="flex items-center gap-2">
          <selectedOption.icon className={`w-4 h-4 ${selectedOption.color}`} />
          <span>{selectedOption.label}</span>
        </div>
        <Trophy className="w-4 h-4 text-white/80" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Select Rating Range
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {ratingOptions.map((option) => {
              const Icon = option.icon
              const isSelected = value === option.value
              
              return (
                <Button
                  key={option.value}
                  variant="ghost"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full justify-start p-4 h-auto ${
                    isSelected 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : option.color}`} />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{option.label}</div>
                      <div className={`text-sm ${isSelected ? 'text-white/90' : 'text-white/80'}`}>
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
