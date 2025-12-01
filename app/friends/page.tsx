'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, X } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'

// Mock friends data
const MOCK_FRIENDS = [
  { id: 1, name: 'Sarah Johnson', initials: 'SJ' },
  { id: 2, name: 'Michael Chen', initials: 'MC' },
  { id: 3, name: 'Emily Rodriguez', initials: 'ER' },
  { id: 4, name: 'David Kim', initials: 'DK' },
  { id: 5, name: 'Jessica Williams', initials: 'JW' },
]

export default function FriendsPage() {
  const router = useRouter()
  const [friends, setFriends] = useState(MOCK_FRIENDS)
  const [searchQuery, setSearchQuery] = useState('')

  const handleRemoveFriend = (friendId: number) => {
    setFriends(friends.filter(friend => friend.id !== friendId))
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary-500 to-primary-600 text-white px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">Friends</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search to Add Friends"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </header>

      {/* Friends List */}
      <div className="mobile-container py-6">
        <div className="card divide-y divide-gray-100">
          {friends.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No friends yet. Search to add friends!</p>
            </div>
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className="p-4 flex items-center gap-4">
                {/* Profile Picture (Initials) */}
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                  {friend.initials}
                </div>

                {/* Friend Name */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Remove</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Friends Count */}
        {friends.length > 0 && (
          <p className="text-center text-gray-500 text-sm mt-4">
            {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

