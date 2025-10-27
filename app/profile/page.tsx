'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'
import { toast } from 'react-hot-toast'
import {
  Settings, LogOut, Calendar, Users, ChefHat,
  Edit, Camera, MapPin, Mail, Loader2
} from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'

export default function ProfilePage() {
  const router = useRouter()
  const { user: authUser, loading: authLoading } = useAuth()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    eventsHosted: 0,
    eventsAttended: 0,
    friends: 0,
  })
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    dietary_preferences: [] as string[],
  })

  const DIETARY_PREFERENCES = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
    'Nut-Free', 'Halal', 'Kosher', 'Pescatarian'
  ]

  useEffect(() => {
    if (!authLoading && authUser) {
      fetchUserProfile()
    } else if (!authLoading && !authUser) {
      setLoading(false)
    }
  }, [authUser, authLoading])

  const fetchUserProfile = async () => {
    if (!authUser) {
      setLoading(false)
      return
    }

    try {
      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError) {
        console.error('User profile error:', userError)
        // Profile might not exist yet, that's okay
        setUser(null)
      } else {
        setUser(userData)
        setFormData({
          full_name: userData.full_name,
          username: userData.username,
          bio: userData.bio || '',
          location: userData.location || '',
          dietary_preferences: userData.dietary_preferences || [],
        })

        // Get stats
        const [hostedEvents, attendedEvents, friendships] = await Promise.all([
          supabase.from('events').select('id', { count: 'exact' }).eq('host_id', authUser.id),
          supabase.from('rsvps').select('id', { count: 'exact' }).eq('user_id', authUser.id).eq('status', 'attending'),
          supabase.from('friendships').select('id', { count: 'exact' }).or(`user_id.eq.${authUser.id},friend_id.eq.${authUser.id}`).eq('status', 'accepted'),
        ])

        setStats({
          eventsHosted: hostedEvents.count || 0,
          eventsAttended: attendedEvents.count || 0,
          friends: friendships.count || 0,
        })

        // Get upcoming events
        const { data: rsvps } = await supabase
          .from('rsvps')
          .select(`
            event:events(
              id,
              title,
              date,
              time,
              event_type
            )
          `)
          .eq('user_id', authUser.id)
          .eq('status', 'attending')
          .gte('events.date', new Date().toISOString().split('T')[0])
          .limit(3)

        if (rsvps) {
          setUpcomingEvents(rsvps.map(r => r.event).filter(Boolean))
        }
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!authUser) return

    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id)

      if (error) throw error
      toast.success('Profile updated!')
      setEditMode(false)
      fetchUserProfile()
    } catch (error: any) {
      toast.error('Failed to update profile')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const toggleDietaryPreference = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(pref)
        ? prev.dietary_preferences.filter(p => p !== pref)
        : [...prev.dietary_preferences, pref]
    }))
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Signed In</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your profile</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Go to Sign In
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">Your profile hasn't been created yet</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="btn-primary"
          >
            Complete Profile Setup
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary-500 to-primary-600 text-white px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Profile</h1>
          <div className="flex gap-2">
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="p-2 bg-white/20 rounded-lg"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleLogout}
              className="p-2 bg-white/20 rounded-lg"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center text-3xl font-bold">
              {user.username?.[0]?.toUpperCase() || '?'}
            </div>
            {editMode && (
              <button className="absolute bottom-0 right-0 p-1.5 bg-primary-600 rounded-full">
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex-1">
            {editMode ? (
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="bg-white/20 border border-white/30 rounded px-3 py-1 w-full mb-1 text-white"
              />
            ) : (
              <h2 className="text-xl font-semibold">{user.full_name}</h2>
            )}
            <p className="opacity-90">@{user.username}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.eventsHosted}</div>
            <div className="text-xs opacity-90">Hosted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.eventsAttended}</div>
            <div className="text-xs opacity-90">Attended</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.friends}</div>
            <div className="text-xs opacity-90">Friends</div>
          </div>
        </div>
      </header>

      {/* Rest of the profile content... */}
      <div className="mobile-container py-6 space-y-6">
        {/* Bio */}
        <div className="card p-4">
          <h3 className="font-semibold mb-3">About</h3>
          {editMode ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="input min-h-[80px]"
            />
          ) : (
            <p className="text-gray-600">
              {user.bio || 'No bio yet. Tell us about yourself!'}
            </p>
          )}
        </div>

        {/* Edit Mode Buttons */}
        {editMode && (
          <div className="flex gap-3">
            <button
              onClick={handleUpdate}
              className="btn-primary flex-1"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditMode(false)
                setFormData({
                  full_name: user.full_name,
                  username: user.username,
                  bio: user.bio || '',
                  location: user.location || '',
                  dietary_preferences: user.dietary_preferences || [],
                })
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}