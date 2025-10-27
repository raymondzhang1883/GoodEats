'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Loader2 } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import { motion } from 'framer-motion'

type Event = {
  id: string
  title: string
  event_type: string
  date: string
  time: string
  location_name: string
  is_host: boolean
}

export default function CalendarPage() {
  const router = useRouter()
  // Using global supabase instance
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    getCurrentUser()
    fetchEvents()
  }, [currentDate])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUser(user)
    }
  }

  const fetchEvents = async () => {
    if (!currentUser) return

    try {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)

      // Get events I'm hosting
      const { data: hostedEvents } = await supabase
        .from('events')
        .select('id, title, event_type, date, time, location_name')
        .eq('host_id', currentUser.id)
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0])

      // Get events I'm attending
      const { data: rsvps } = await supabase
        .from('rsvps')
        .select(`
          event:events(id, title, event_type, date, time, location_name)
        `)
        .eq('user_id', currentUser.id)
        .eq('status', 'attending')
        .gte('events.date', monthStart.toISOString().split('T')[0])
        .lte('events.date', monthEnd.toISOString().split('T')[0])

      const hostedEventsList: Event[] = (hostedEvents || []).map(e => ({
        id: e.id,
        title: e.title,
        event_type: e.event_type,
        date: e.date,
        time: e.time,
        location_name: e.location_name,
        is_host: true
      }))

      const attendingEventsList: Event[] = (rsvps || [])
        .filter((r: any) => r.event && r.event.id)
        .map((r: any) => ({
          id: r.event.id,
          title: r.event.title,
          event_type: r.event.event_type,
          date: r.event.date,
          time: r.event.time,
          location_name: r.event.location_name,
          is_host: false
        }))

      const allEvents = [...hostedEventsList, ...attendingEventsList]

      setEvents(allEvents)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })

    // Add padding days to start from Sunday
    const startPadding = start.getDay()
    const paddingDays = Array(startPadding).fill(null)

    return [...paddingDays, ...days]
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      isSameDay(new Date(event.date), date)
    )
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

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const days = getDaysInMonth()
  const today = new Date()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={handlePrevMonth} className="p-2">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          <button onClick={handleNextMonth} className="p-2">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* Calendar Grid */}
          <div className="mobile-container py-4">
            <div className="card p-4">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} />
                  }

                  const dayEvents = getEventsForDate(day)
                  const isToday = isSameDay(day, today)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)

                  return (
                    <motion.button
                      key={day.toISOString()}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        aspect-square p-1 rounded-lg relative
                        ${isToday ? 'bg-primary-100' : ''}
                        ${isSelected ? 'ring-2 ring-primary-500' : ''}
                        ${!isCurrentMonth ? 'opacity-30' : ''}
                        ${dayEvents.length > 0 ? 'font-semibold' : ''}
                      `}
                    >
                      <div className="text-sm">{format(day, 'd')}</div>
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                          {dayEvents.slice(0, 3).map((_, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 bg-primary-500 rounded-full"
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div className="mobile-container pb-4">
              <h2 className="font-semibold mb-3">
                Events on {format(selectedDate, 'MMMM d, yyyy')}
              </h2>

              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map(event => (
                    <motion.div
                      key={event.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push(`/events/${event.id}`)}
                      className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getEventIcon(event.event_type)}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{event.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="line-clamp-1">{event.location_name}</span>
                            </div>
                          </div>
                          {event.is_host && (
                            <span className="inline-block mt-2 px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                              You're hosting
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No events on this day</p>
                  <button
                    onClick={() => router.push('/create-event')}
                    className="mt-4 text-primary-500 font-medium"
                  >
                    Create an event
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Upcoming Events List */}
          {!selectedDate && (
            <div className="mobile-container pb-4">
              <h2 className="font-semibold mb-3">All Events This Month</h2>

              {events.length > 0 ? (
                <div className="space-y-3">
                  {events
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(event => (
                      <motion.div
                        key={event.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{getEventIcon(event.event_type)}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{event.title}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>{format(new Date(event.date), 'MMM d')}</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{event.time}</span>
                              </div>
                            </div>
                            {event.is_host && (
                              <span className="inline-block mt-2 px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                                You're hosting
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No events this month</p>
                  <button
                    onClick={() => router.push('/home')}
                    className="mt-4 text-primary-500 font-medium"
                  >
                    Discover events
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <BottomNav />
    </div>
  )
}