import { useRef } from 'react'

interface SoundOptions {
  volume?: number
  loop?: boolean
}

export const useSound = () => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  const createAudio = (src: string, options: SoundOptions = {}): HTMLAudioElement => {
    const audio = new Audio(src)
    audio.volume = options.volume || 0.5
    audio.loop = options.loop || false
    audio.preload = 'auto'
    return audio
  }

  const playSound = (soundKey: string, src: string, options: SoundOptions = {}) => {
    try {
      if (!audioRefs.current[soundKey]) {
        audioRefs.current[soundKey] = createAudio(src, options)
      }
      
      const audio = audioRefs.current[soundKey]
      audio.currentTime = 0
      audio.play().catch(console.error)
    } catch (error) {
      console.warn('Could not play sound:', soundKey, error)
    }
  }

  const stopSound = (soundKey: string) => {
    if (audioRefs.current[soundKey]) {
      audioRefs.current[soundKey].pause()
      audioRefs.current[soundKey].currentTime = 0
    }
  }

  // UI Sounds
  const playClick = () => playSound('click', '/sounds/ui-click.mp3', { volume: 0.3 })
  const playSuccess = () => playSound('success', '/sounds/ui-success.mp3', { volume: 0.4 })
  const playError = () => playSound('error', '/sounds/ui-error.mp3', { volume: 0.4 })
  
  // Search Sounds
  const playSearchStart = () => playSound('searchStart', '/sounds/search-start.mp3', { volume: 0.3 })
  const playSearchEnd = () => playSound('searchEnd', '/sounds/search-end.mp3', { volume: 0.3 })
  const playCountdown = () => playSound('countdown', '/sounds/countdown.mp3', { volume: 0.2 })
  const playWaitMatch = () => playSound('waitMatch', '/sounds/wait-match.mp3', { volume: 0.3 })
  
  // Match Sounds
  const playMatchFound = () => playSound('matchFound', '/sounds/match-found.mp3', { volume: 0.6 })
  const playMatchAccepted = () => playSound('matchAccepted', '/sounds/match-accepted.mp3', { volume: 0.5 })
  const playMatchDeclined = () => playSound('matchDeclined', '/sounds/match-declined.mp3', { volume: 0.4 })
  
  // Chess Sounds
  const playMove = () => playSound('move', '/sounds/chess-move.mp3', { volume: 0.3 })
  const playCheck = () => playSound('check', '/sounds/chess-check.mp3', { volume: 0.4 })
  const playCheckmate = () => playSound('checkmate', '/sounds/chess-checkmate.mp3', { volume: 0.6 })
  const playDraw = () => playSound('draw', '/sounds/chess-draw.mp3', { volume: 0.4 })
  const playResign = () => playSound('resign', '/sounds/chess-resign.mp3', { volume: 0.4 })

  return {
    playClick,
    playSuccess,
    playError,
    playSearchStart,
    playSearchEnd,
    playCountdown,
    playWaitMatch,
    playMatchFound,
    playMatchAccepted,
    playMatchDeclined,
    playMove,
    playCheck,
    playCheckmate,
    playDraw,
    playResign,
    stopSound,
  }
}
