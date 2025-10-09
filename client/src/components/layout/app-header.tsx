import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/use-auth'
import { cn } from '@/lib/utils'
import { 
  Trophy, 
  Users, 
  Home, 
  User, 
  LogOut,
  Settings,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSound } from '@/lib/use-sound'

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/lobby', label: 'Lobby', icon: Users },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/game-history', label: 'Game History', icon: Users },
]

export const AppHeader: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { playClick } = useSound()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getCurrentPageTitle = () => {
    const currentPath = location.pathname
    const item = navItems.find(item => item.path === currentPath)
    return item ? item.label : 'Chess Arena'
  }

  return (
    <header className="bg-black/80 backdrop-blur-sm border-b-2 border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Current Page */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">♔</span>
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">Chess Arena</span>
            </div>
            
            {/* Current Page Title */}
            <div className="hidden md:flex items-center gap-2 text-white/70">
              <span className="text-sm">›</span>
              <span className="text-sm font-medium">{getCurrentPageTitle()}</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    playClick()
                    navigate(item.path)
                  }}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    isActive 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </nav>

          {/* Profile & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Profile Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-white hover:bg-white/10"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.email?.split('@')[0] || 'Guest'}
                </span>
              </Button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-white/10 py-1 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white">
                      {user?.email?.split('@')[0] || 'Guest'}
                    </p>
                    <p className="text-xs text-white/60">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsProfileOpen(false)
                      navigate('/profile')
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsProfileOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:bg-white/10"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      playClick()
                      navigate(item.path)
                      setIsMobileMenuOpen(false)
                    }}
                    className={cn(
                      "flex items-center gap-2 justify-start transition-colors",
                      isActive 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
