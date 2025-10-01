import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/use-auth'
import { usePageTitle } from '@/lib/use-page-title'
import { 
  Users, 
  Trophy, 
  Zap, 
  Clock, 
  TrendingUp, 
  Star,
  Crown,
  Target,
  Award
} from 'lucide-react'
import { useNavigate } from 'react-router'

export const HomePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  usePageTitle('Chess Arena - Home')

  const stats = [
    { label: 'Online Players', value: '1,234', icon: Users, color: 'text-blue-400' },
    { label: 'Active Games', value: '89', icon: Trophy, color: 'text-green-400' },
    { label: 'Today\'s Matches', value: '456', icon: Zap, color: 'text-yellow-400' },
    { label: 'Total Players', value: '12,567', icon: TrendingUp, color: 'text-purple-400' },
  ]

  const quickActions = [
    {
      title: 'Quick Match',
      description: 'Find opponents quickly',
      icon: Zap,
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => navigate('/lobby?tab=quick')
    },
    {
      title: 'Create Room',
      description: 'Create a private room',
      icon: Users,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => navigate('/lobby?tab=create')
    },
    {
      title: 'View Leaderboard',
      description: 'View rankings',
      icon: Trophy,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      onClick: () => navigate('/leaderboard')
    },
    {
      title: 'Game History',
      description: 'View game history',
      icon: Clock,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => navigate('/game-history')
    },
  ]

  const achievements = [
    { title: 'First Win', description: 'Win your first game', icon: Star, unlocked: true },
    { title: 'Rapid Player', description: 'Play 10 Rapid games', icon: Clock, unlocked: true },
    { title: 'Blitz Master', description: 'Win 5 Blitz games', icon: Zap, unlocked: false },
    { title: 'Rating 1500+', description: 'Reach 1500+ rating', icon: Target, unlocked: true },
    { title: 'Tournament Winner', description: 'Win a tournament', icon: Crown, unlocked: false },
  ]

  return (
    <div className="flex flex-col gap-6 items-center justify-center w-full h-[calc(100vh-4rem)] p-6">
      <div className="flex flex-col gap-6 items-center justify-center w-full max-w-6xl">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Welcome to Chess Arena!
          </h1>
          <p className="text-xl text-white/70 max-w-2xl">
            The premier online chess platform with opponents from around the world
          </p>
          {user && (
            <div className="flex items-center justify-center gap-2 text-white/60">
              <span>Hello,</span>
              <span className="font-semibold text-white">{user.email?.split('@')[0] || 'User'}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="p-4 text-center bg-white/10">
                <div className="flex flex-col items-center gap-2">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="w-full">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Button
                  key={index}
                  onClick={action.onClick}
                  className={`${action.color} h-auto p-6 flex flex-col items-center gap-3`}
                >
                  <Icon className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-sm text-white/90">{action.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="w-full">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Your Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon
              return (
                <Card key={index} className={`p-4 ${achievement.unlocked ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.unlocked ? 'bg-green-500/20' : 'bg-white/10'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        achievement.unlocked ? 'text-green-400' : 'text-white/40'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        achievement.unlocked ? 'text-white' : 'text-white/80'
                      }`}>
                        {achievement.title}
                      </div>
                      <div className={`text-sm ${
                        achievement.unlocked ? 'text-white/90' : 'text-white/60'
                      }`}>
                        {achievement.description}
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <Award className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Getting Started */}
        {!user && (
          <Card className="p-6 w-full max-w-2xl text-center bg-white/10">
            <h3 className="text-xl font-bold text-white mb-2">Start Playing Now!</h3>
            <p className="text-white/80 mb-4">
              Sign in to join matches, track your rating, and unlock achievements
            </p>
            <Button onClick={() => navigate('/login')} size="lg">
              Sign In / Sign Up
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
