'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Calendar, Clock, MapPin, Users, DollarSign, ChefHat, Loader2 } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'

const EVENT_TYPES = [
  { value: 'potluck', label: 'Potluck', icon: '🍲' },
  { value: 'dinner', label: 'Dinner Party', icon: '🍽️' },
  { value: 'cooking_class', label: 'Cooking Class', icon: '👨‍🍳' },
  { value: 'picnic', label: 'Picnic', icon: '🧺' },
  { value: 'other', label: 'Other', icon: '🎉' },
]

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
]

export default function CreateEventPage() {
  const router = useRouter()
  // Using global supabase instance
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'potluck',
    date: '',
    time: '',
    duration_hours: 2,
    location_name: '',
    location_address: '',
    max_attendees: 10,
    meal_theme: '',
    is_free: true,
    price: 0,
    dietary_options: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // For MVP, use default coordinates (would use Google Geocoding API in production)
      const eventData = {
        ...formData,
        host_id: user.id,
        latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
        price: formData.is_free ? 0 : formData.price,
        dietary_options: formData.dietary_options.length > 0 ? formData.dietary_options : null,
      }

      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single()

      if (error) throw error

      toast.success('Event created successfully!')
      router.push(`/events/${data.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const handleDietaryToggle = (option: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_options: prev.dietary_options.includes(option)
        ? prev.dietary_options.filter(o => o !== option)
        : [...prev.dietary_options, option]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold">Create Event</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mobile-container py-6 space-y-6">
        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Event Type</label>
          <div className="grid grid-cols-3 gap-3">
            {EVENT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, event_type: type.value })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.event_type === type.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-xs">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Sunday Potluck Dinner"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[100px]"
              placeholder="Join us for a cozy potluck dinner! Bring your favorite dish to share..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ChefHat className="inline h-4 w-4 mr-1" />
              Meal Theme (optional)
            </label>
            <input
              type="text"
              value={formData.meal_theme}
              onChange={(e) => setFormData({ ...formData, meal_theme: e.target.value })}
              className="input"
              placeholder="Italian Night, BBQ, Comfort Food..."
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Time
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="input"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location Name
            </label>
            <input
              type="text"
              required
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              className="input"
              placeholder="Community Center, My Apartment, Park Name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
            <input
              type="text"
              required
              value={formData.location_address}
              onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
              className="input"
              placeholder="123 Main St, San Francisco, CA 94102"
            />
          </div>
        </div>

        {/* Attendees */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline h-4 w-4 mr-1" />
            Maximum Attendees
          </label>
          <input
            type="number"
            required
            min="2"
            max="100"
            value={formData.max_attendees}
            onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) })}
            className="input"
          />
        </div>

        {/* Pricing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Event Cost</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={formData.is_free}
                onChange={() => setFormData({ ...formData, is_free: true, price: 0 })}
                className="h-4 w-4 text-primary-500"
              />
              <span>Free Event</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={!formData.is_free}
                onChange={() => setFormData({ ...formData, is_free: false })}
                className="h-4 w-4 text-primary-500"
              />
              <span>Paid Event</span>
            </label>
            {!formData.is_free && (
              <div className="relative ml-7">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="input pl-10"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
        </div>

        {/* Dietary Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Dietary Options Available
          </label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleDietaryToggle(option)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  formData.dietary_options.includes(option)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Create Event'
          )}
        </button>
      </form>

      <BottomNav />
    </div>
  )
}