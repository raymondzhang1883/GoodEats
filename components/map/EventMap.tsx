'use client'

import { useEffect, useState, useCallback } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, ChefHat, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}

type Event = {
  id: string
  title: string
  description: string
  event_type: string
  date: string
  time: string
  location_name: string
  location_address: string
  latitude: number
  longitude: number
  max_attendees: number
  current_attendees: number
  meal_theme: string | null
  is_free: boolean
  price: number
  host: {
    username: string
    avatar_url: string | null
  }
}

export default function EventMap() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [userLocation, setUserLocation] = useState(defaultCenter)
  const [eventsLoading, setEventsLoading] = useState(true)

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          console.log('Using default location')
        }
      )
    }

    fetchEvents()

    // Re-fetch events when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchEvents()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchEvents = async () => {
    try {
      setEventsLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          host:users!host_id(username, avatar_url)
        `)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching events:', error)
      } else if (data) {
        setEvents(data as any)
      }
    } catch (err) {
      console.error('Failed to fetch events:', err)
    } finally {
      setEventsLoading(false)
    }
  }

  const getMarkerIcon = (eventType: string) => {
    const icons: Record<string, string> = {
      potluck: '🍲',
      dinner: '🍽️',
      cooking_class: '👨‍🍳',
      picnic: '🧺',
      other: '🎉'
    }
    return icons[eventType] || '🎉'
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  console.log('EventMap rendering with API key:', apiKey ? 'Present' : 'Missing')
  console.log('Events count:', events.length)
  console.log('User location:', userLocation)

  if (!apiKey) {
    return (
      <div className="relative h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Configuration Error</h3>
          <p className="text-gray-600 mb-4">Google Maps API key is missing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <LoadScript 
        googleMapsApiKey={apiKey}
        onLoad={() => console.log('Google Maps script loaded successfully')}
        onError={(err) => console.error('Google Maps script failed to load:', err)}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation}
          zoom={13}
          options={mapOptions}
          onLoad={() => console.log('Google Map component loaded')}
          onUnmount={() => console.log('Google Map component unmounted')}
        >
          {events.map((event) => (
            <Marker
              key={event.id}
              position={{ lat: event.latitude, lng: event.longitude }}
              onClick={() => setSelectedEvent(event)}
              label={{
                text: getMarkerIcon(event.event_type),
                fontSize: '24px'
              }}
            />
          ))}

          {selectedEvent && (
            <InfoWindow
              position={{
                lat: selectedEvent.latitude,
                lng: selectedEvent.longitude
              }}
              onCloseClick={() => setSelectedEvent(null)}
            >
              <div className="p-4 max-w-xs">
                <h3 className="font-bold text-lg mb-2">{selectedEvent.title}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(selectedEvent.date), 'MMM d')} at {selectedEvent.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedEvent.location_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {selectedEvent.current_attendees}/{selectedEvent.max_attendees} attending
                    </span>
                  </div>
                  {selectedEvent.meal_theme && (
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4" />
                      <span>{selectedEvent.meal_theme}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-primary-500">
                    {selectedEvent.is_free ? 'Free' : `$${selectedEvent.price}`}
                  </span>
                  <button
                    className="text-xs btn-primary py-1 px-3"
                    onClick={() => {
                      window.location.href = `/events/${selectedEvent.id}`
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Event List Drawer */}
      <motion.div
        initial={{ y: '60%' }}
        animate={{ y: '60%' }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 300 }}
        dragElastic={0.2}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-10"
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />

        <div className="px-4 pb-safe-bottom">
          <h2 className="text-lg font-bold mb-4">Upcoming Events</h2>

          {eventsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No upcoming events found</p>
              <p className="text-sm text-gray-400 mt-2">Be the first to create one!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pb-4">
              {events.map((event) => (
              <motion.div
                key={event.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = `/events/${event.id}`}
                className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getMarkerIcon(event.event_type)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{format(new Date(event.date), 'MMM d')}</span>
                      <span>{event.time}</span>
                      <span>{event.current_attendees}/{event.max_attendees} going</span>
                      <span className="ml-auto font-medium text-primary-500">
                        {event.is_free ? 'Free' : `$${event.price}`}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}