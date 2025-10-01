import { createContext, useContext, useRef, ReactNode } from 'react'

interface SoundManager {
  playClick: () => void
  playSuccess: () => void
  playError: () => void
  playSearchStart: () => void
  playSearchEnd: () => void
  playMatchFound: () => void
  playMatchAccepted: () => void
  playMatchDeclined: () => void
  playCountdown: () => void
  playMove: () => void
  playCheck: () => void
  playCheckmate: () => void
  playDraw: () => void
  playResign: () => void
}

const SoundContext = createContext<SoundManager | null>(null)

export const useSoundManager = (): SoundManager => {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error('useSoundManager must be used within a SoundProvider')
  }
  return context
}

interface SoundProviderProps {
  children: ReactNode
}

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  const createAudio = (src: string, volume: number = 0.5): HTMLAudioElement => {
    const audio = new Audio(src)
    audio.volume = volume
    audio.preload = 'auto'
    return audio
  }

  const playSound = (soundKey: string, src: string, volume: number = 0.5) => {
    try {
      if (!audioRefs.current[soundKey]) {
        audioRefs.current[soundKey] = createAudio(src, volume)
      }
      
      const audio = audioRefs.current[soundKey]
      audio.currentTime = 0
      audio.play().catch(console.error)
    } catch (error) {
      console.warn('Could not play sound:', soundKey, error)
    }
  }

  const soundManager: SoundManager = {
    // UI Sounds
    playClick: () => playSound('click', '/sounds/ui-click.mp3', 0.3),
    playSuccess: () => playSound('success', '/sounds/ui-success.mp3', 0.4),
    playError: () => playSound('error', '/sounds/ui-error.mp3', 0.4),
    
    // Search Sounds
    playSearchStart: () => playSound('searchStart', '/sounds/search-start.mp3', 0.3),
    playSearchEnd: () => playSound('searchEnd', '/sounds/search-end.mp3', 0.3),
    playCountdown: () => playSound('countdown', '/sounds/countdown.mp3', 0.2),
    
    // Match Sounds
    playMatchFound: () => playSound('matchFound', '/sounds/match-found.mp3', 0.6),
    playMatchAccepted: () => playSound('matchAccepted', '/sounds/match-accepted.mp3', 0.5),
    playMatchDeclined: () => playSound('matchDeclined', '/sounds/match-declined.mp3', 0.4),
    
    // Chess Sounds
    playMove: () => playSound('move', '/sounds/chess-move.mp3', 0.3),
    playCheck: () => playSound('check', '/sounds/chess-check.mp3', 0.4),
    playCheckmate: () => playSound('checkmate', '/sounds/chess-checkmate.mp3', 0.6),
    playDraw: () => playSound('draw', '/sounds/chess-draw.mp3', 0.4),
    playResign: () => playSound('resign', '/sounds/chess-resign.mp3', 0.4),
  }

  return (
    <SoundContext.Provider value={soundManager}>
      {children}
    </SoundContext.Provider>
  )
}
