import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth/use-auth'
import { usePageTitle } from '@/lib/use-page-title'
import { User, Mail, Calendar, Trophy, Settings } from 'lucide-react'
import { useState } from 'react'

export const ProfilePage = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  })

  usePageTitle('Profile')

  const handleSave = () => {
    // TODO: Implement profile update
    console.log('Saving profile:', form)
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col gap-6 items-center justify-center w-full h-[calc(100vh-4rem)] p-6">
      <div className="flex flex-col gap-6 items-center justify-center w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        
        <Card className="w-full p-6 bg-white/10">
          <div className="space-y-6">
            {/* Profile Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-white/80">{user?.email}</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/10 border-white/20"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="bg-white/10 border-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="bg-white/10 border-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    disabled={!isEditing}
                    className="bg-white/10 border-white/20"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setForm({
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        email: user?.email || '',
                      })
                    }}
                    className="bg-white/10 border-white/20"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-white/80 mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm">Rating</span>
                </div>
                <div className="text-2xl font-bold text-white">1200</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-white/80 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Joined</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
