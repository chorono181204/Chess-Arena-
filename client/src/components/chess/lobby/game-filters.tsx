import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Clock, Trophy, Check } from 'lucide-react'
import { useState } from 'react'

interface GameFilters {
  timeControl: string[]
  ratingRange: string[]
}

interface GameFiltersProps {
  filters: GameFilters
  onFiltersChange: (filters: GameFilters) => void
}

export const GameFilters: React.FC<GameFiltersProps> = ({ filters, onFiltersChange }) => {
  const [isTimeControlOpen, setIsTimeControlOpen] = useState(false)
  const [isRatingRangeOpen, setIsRatingRangeOpen] = useState(false)

  const timeControls = [
    { value: '1+0', label: 'Bullet 1+0' },
    { value: '2+1', label: 'Bullet 2+1' },
    { value: '3+0', label: 'Blitz 3+0' },
    { value: '5+0', label: 'Blitz 5+0' },
    { value: '5+3', label: 'Blitz 5+3' },
    { value: '10+0', label: 'Rapid 10+0' },
    { value: '15+10', label: 'Rapid 15+10' },
    { value: '25+10', label: 'Rapid 25+10' },
    { value: '30+0', label: 'Classical 30+0' },
    { value: '60+0', label: 'Classical 60+0' },
    { value: '90+30', label: 'Classical 90+30' },
  ]

  const ratingRanges = [
    { value: '0-1000', label: '0-1000 (Beginner)' },
    { value: '1000-1500', label: '1000-1500 (Intermediate)' },
    { value: '1500-2000', label: '1500-2000 (Advanced)' },
    { value: '2000-2500', label: '2000-2500 (Expert)' },
    { value: '2500+', label: '2500+ (Master)' },
  ]

  const handleTimeControlToggle = (value: string) => {
    const newFilters = { ...filters }
    if (newFilters.timeControl.includes(value)) {
      newFilters.timeControl = newFilters.timeControl.filter(tc => tc !== value)
    } else {
      newFilters.timeControl.push(value)
    }
    onFiltersChange(newFilters)
  }

  const handleRatingRangeToggle = (value: string) => {
    const newFilters = { ...filters }
    if (newFilters.ratingRange.includes(value)) {
      newFilters.ratingRange = newFilters.ratingRange.filter(range => range !== value)
    } else {
      newFilters.ratingRange.push(value)
    }
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({ timeControl: [], ratingRange: [] })
  }

  const getActiveFiltersCount = () => {
    return filters.timeControl.length + filters.ratingRange.length
  }

  return (
    <div className="flex items-center gap-2">
      {/* Time Control Filter */}
      <Dialog open={isTimeControlOpen} onOpenChange={setIsTimeControlOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={`bg-white/5 border-white/10 ${filters.timeControl.length > 0 ? 'border-blue-500 text-blue-400' : ''}`}
          >
            <Clock className="size-4 mr-2" />
            Time Control
            {filters.timeControl.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {filters.timeControl.length}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Filter by Time Control</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {timeControls.map((tc) => (
                <Button
                  key={tc.value}
                  variant={filters.timeControl.includes(tc.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeControlToggle(tc.value)}
                  className={`justify-start ${
                    filters.timeControl.includes(tc.value) 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-white/10 border-white/20 hover:bg-white/15'
                  }`}
                >
                  {filters.timeControl.includes(tc.value) && (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {tc.label}
                </Button>
              ))}
            </div>
            
            <div className="flex justify-between pt-4 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFiltersChange({ ...filters, timeControl: [] })}
                className="bg-white/10 border-white/20"
              >
                Clear Time Controls
              </Button>
              <Button
                size="sm"
                onClick={() => setIsTimeControlOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Range Filter */}
      <Dialog open={isRatingRangeOpen} onOpenChange={setIsRatingRangeOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={`bg-white/10 border-white/20 ${filters.ratingRange.length > 0 ? 'border-blue-500 text-blue-400' : ''}`}
          >
            <Trophy className="size-4 mr-2" />
            Rating Range
            {filters.ratingRange.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {filters.ratingRange.length}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Filter by Rating Range</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              {ratingRanges.map((range) => (
                <Button
                  key={range.value}
                  variant={filters.ratingRange.includes(range.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRatingRangeToggle(range.value)}
                  className={`w-full justify-start ${
                    filters.ratingRange.includes(range.value) 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-white/10 border-white/20 hover:bg-white/15'
                  }`}
                >
                  {filters.ratingRange.includes(range.value) && (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {range.label}
                </Button>
              ))}
            </div>
            
            <div className="flex justify-between pt-4 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFiltersChange({ ...filters, ratingRange: [] })}
                className="bg-white/10 border-white/20"
              >
                Clear Rating Ranges
              </Button>
              <Button
                size="sm"
                onClick={() => setIsRatingRangeOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear All Filters */}
      {getActiveFiltersCount() > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-muted-foreground hover:text-white"
        >
          Clear All ({getActiveFiltersCount()})
        </Button>
      )}
    </div>
  )
}
