'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, DollarSign,
  ChefHat, Share2, Heart, MessageCircle, Loader2, Check, X
} from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'

type EventDetails = {
  id: string
  title: string
  description: string
  event_type: string
  date: string
  time: string
  duration_hours: number
  location_name: string
  location_address: string
  max_attendees: number
  current_attendees: number
  meal_theme: string | null
  is_free: boolean
  price: number
  dietary_options: string[] | null
  audience: string
  host: {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
  }
  rsvps: {
    user_id: string
    status: string
    bringing_dish: string | null
    guests_count: number
    user: {
      username: string
      avatar_url: string | null
    }
  }[]
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  // Using global supabase instance
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRsvp, setUserRsvp] = useState<any>(null)
  const [showRsvpModal, setShowRsvpModal] = useState(false)
  const [rsvpForm, setRsvpForm] = useState({
    status: 'attending',
    bringing_dish: '',
    guests_count: 1,
  })

  useEffect(() => {
    fetchEventDetails()
    getCurrentUser()
  }, [params.id])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      setCurrentUser(data)
    }
  }

  const fetchEventDetails = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          host:users!host_id(*),
          rsvps(
            *,
            user:users(username, avatar_url)
          )
        `)
        .eq('id', params.id)
        .single()

      if (eventError) throw eventError
      setEvent(eventData as any)

      // Check if current user has RSVP'd
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const existingRsvp = eventData.rsvps.find((r: any) => r.user_id === user.id)
        setUserRsvp(existingRsvp)
      }
    } catch (error: any) {
      toast.error('Failed to load event details')
      router.push('/home')
    } finally {
      setLoading(false)
    }
  }

  const handleRsvp = async () => {
    if (!currentUser) {
      toast.error('Please sign in to RSVP')
      router.push('/')
      return
    }

    setRsvpLoading(true)
    try {
      if (userRsvp) {
        // Update existing RSVP
        const { error } = await supabase
          .from('rsvps')
          .update({
            status: rsvpForm.status,
            bringing_dish: rsvpForm.bringing_dish || null,
            guests_count: rsvpForm.guests_count,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userRsvp.id)

        if (error) throw error
        toast.success('RSVP updated!')
      } else {
        // Create new RSVP
        const { error } = await supabase
          .from('rsvps')
          .insert({
            event_id: params.id,
            user_id: currentUser.id,
            status: rsvpForm.status,
            bringing_dish: rsvpForm.bringing_dish || null,
            guests_count: rsvpForm.guests_count,
          })

        if (error) throw error
        toast.success('RSVP submitted!')
      }

      setShowRsvpModal(false)
      fetchEventDetails()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit RSVP')
    } finally {
      setRsvpLoading(false)
    }
  }

  const getEventIcon = (type: string) => {
    const icons: Record<string, string> = {
      potluck: '🍲',
      dinner: '🍽️',
      cooking_class: '👨‍🍳',
      picnic: '🧺',
      other: '🎉'
    }
    return icons[type] || '🎉'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!event) return null

  const isHost = currentUser?.id === event.host.id
  const isFull = event.current_attendees >= event.max_attendees
  const attendingUsers = event.rsvps.filter(r => r.status === 'attending')
  
  // Calculate total guests (including +1s, +2s, etc.)
  const totalAttendingGuests = attendingUsers.reduce((sum, rsvp) => sum + (rsvp.guests_count || 1), 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold">Event Details</h1>
          <button className="p-2">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="mobile-container py-6 space-y-6">
        {/* Event Header */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{getEventIcon(event.event_type)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{event.title}</h1>
                {event.audience === 'friends' ? (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
                    Friends Only
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                    Public
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Hosted by</span>
                <span className="font-medium text-primary-500">@{event.host.username}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Info */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-sm text-gray-600">{event.time} ({event.duration_hours} hours)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">{event.location_name}</p>
              <p className="text-sm text-gray-600">{event.location_address}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">{event.current_attendees} / {event.max_attendees} attending</p>
              <p className="text-sm text-gray-600">{event.max_attendees - event.current_attendees} spots left</p>
            </div>
          </div>

          {event.meal_theme && (
            <div className="flex items-center gap-3">
              <ChefHat className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Theme: {event.meal_theme}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-gray-500" />
            <p className="font-medium">
              {event.is_free ? 'Free Event' : `$${event.price} per person`}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="card p-6">
          <h2 className="font-semibold mb-3">About this event</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
        </div>

        {/* Dietary Options */}
        {event.dietary_options && event.dietary_options.length > 0 && (
          <div className="card p-6">
            <h2 className="font-semibold mb-3">Dietary Options</h2>
            <div className="flex flex-wrap gap-2">
              {event.dietary_options.map((option) => (
                <span
                  key={option}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meal Planning for Potlucks */}
        {event.event_type === 'potluck' && attendingUsers.length > 0 && (
          <div className="card p-6">
            <h2 className="font-semibold mb-4">🍽️ Meal Planning</h2>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="font-medium text-orange-700 mb-1">Appetizers</div>
                  {attendingUsers.filter(r => r.bringing_dish?.toLowerCase().includes('appetizer') ||
                    r.bringing_dish?.toLowerCase().includes('starter')).length > 0 ? (
                    <div className="text-xs text-gray-600">
                      {attendingUsers.filter(r => r.bringing_dish?.toLowerCase().includes('appetizer') ||
                        r.bringing_dish?.toLowerCase().includes('starter')).map(r => r.bringing_dish).join(', ')}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">Needed</div>
                  )}
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-green-700 mb-1">Mains</div>
                  {attendingUsers.filter(r => r.bringing_dish && !r.bringing_dish.toLowerCase().includes('dessert') &&
                    !r.bringing_dish.toLowerCase().includes('drink') && !r.bringing_dish.toLowerCase().includes('appetizer')).length > 0 ? (
                    <div className="text-xs text-gray-600 line-clamp-2">
                      {attendingUsers.filter(r => r.bringing_dish && !r.bringing_dish.toLowerCase().includes('dessert') &&
                        !r.bringing_dish.toLowerCase().includes('drink') && !r.bringing_dish.toLowerCase().includes('appetizer'))
                        .map(r => r.bringing_dish).join(', ')}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">Needed</div>
                  )}
                </div>
                <div className="bg-pink-50 p-3 rounded-lg">
                  <div className="font-medium text-pink-700 mb-1">Desserts</div>
                  {attendingUsers.filter(r => r.bringing_dish?.toLowerCase().includes('dessert') ||
                    r.bringing_dish?.toLowerCase().includes('cake') || r.bringing_dish?.toLowerCase().includes('cookie')).length > 0 ? (
                    <div className="text-xs text-gray-600">
                      {attendingUsers.filter(r => r.bringing_dish?.toLowerCase().includes('dessert') ||
                        r.bringing_dish?.toLowerCase().includes('cake') || r.bringing_dish?.toLowerCase().includes('cookie'))
                        .map(r => r.bringing_dish).join(', ')}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">Needed</div>
                  )}
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-blue-700 mb-1">Drinks</div>
                  {attendingUsers.filter(r => r.bringing_dish?.toLowerCase().includes('drink') ||
                    r.bringing_dish?.toLowerCase().includes('beverage')).length > 0 ? (
                    <div className="text-xs text-gray-600">
                      {attendingUsers.filter(r => r.bringing_dish?.toLowerCase().includes('drink') ||
                        r.bringing_dish?.toLowerCase().includes('beverage')).map(r => r.bringing_dish).join(', ')}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">Needed</div>
                  )}
                </div>
              </div>
            </div>
            {userRsvp?.status === 'attending' && !userRsvp?.bringing_dish && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 Don't forget to update your RSVP with what you're bringing!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Attendees */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">
            Who's Coming ({totalAttendingGuests} {totalAttendingGuests === 1 ? 'guest' : 'guests'})
          </h2>
          {attendingUsers.length > 0 ? (
            <div className="space-y-3">
              {attendingUsers.map((rsvp) => (
                <div key={rsvp.user_id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {rsvp.user.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">@{rsvp.user.username}</p>
                    {rsvp.bringing_dish && (
                      <p className="text-sm text-gray-600">Bringing: {rsvp.bringing_dish}</p>
                    )}
                  </div>
                  {rsvp.guests_count > 1 && (
                    <span className="text-sm text-gray-500">+{rsvp.guests_count - 1}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No one has RSVP'd yet. Be the first!</p>
          )}
        </div>

        {/* RSVP Button */}
        {!isHost && (
          <button
            onClick={() => setShowRsvpModal(true)}
            disabled={isFull && !userRsvp}
            className={`btn-primary w-full ${isFull && !userRsvp ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {userRsvp
              ? `Update RSVP (${userRsvp.status})`
              : isFull
                ? 'Event Full'
                : 'RSVP to Event'
            }
          </button>
        )}
      </div>

      {/* RSVP Modal */}
      {showRsvpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">RSVP to Event</h2>
              <button onClick={() => setShowRsvpModal(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Will you attend?</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRsvpForm({ ...rsvpForm, status: 'attending' })}
                  className={`p-3 rounded-lg border-2 ${
                    rsvpForm.status === 'attending'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <Check className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-xs">Going</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRsvpForm({ ...rsvpForm, status: 'maybe' })}
                  className={`p-3 rounded-lg border-2 ${
                    rsvpForm.status === 'maybe'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="text-xl mb-1">?</span>
                  <div className="text-xs">Maybe</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRsvpForm({ ...rsvpForm, status: 'declined' })}
                  className={`p-3 rounded-lg border-2 ${
                    rsvpForm.status === 'declined'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <X className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-xs">Can't Go</div>
                </button>
              </div>
            </div>

            {rsvpForm.status === 'attending' && event.event_type === 'potluck' && (
              <div>
                <label className="block text-sm font-medium mb-2">What will you bring?</label>
                <input
                  type="text"
                  value={rsvpForm.bringing_dish}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, bringing_dish: e.target.value })}
                  className="input"
                  placeholder="Pasta salad, cookies, drinks..."
                />
              </div>
            )}

            {rsvpForm.status === 'attending' && (
              <div>
                <label className="block text-sm font-medium mb-2">Number of guests (including you)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={rsvpForm.guests_count}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, guests_count: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
            )}

            <button
              onClick={handleRsvp}
              disabled={rsvpLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {rsvpLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                userRsvp ? 'Update RSVP' : 'Submit RSVP'
              )}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}