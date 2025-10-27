'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, PlusCircle, Users, User } from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Home', href: '/home' },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: PlusCircle, label: 'Create', href: '/create-event' },
  { icon: Users, label: 'Feed', href: '/feed' },
  { icon: User, label: 'Profile', href: '/profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isCreate = item.label === 'Create'

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isCreate
                  ? 'text-primary-500'
                  : isActive
                  ? 'text-primary-500'
                  : 'text-gray-400'
              }`}
            >
              <Icon
                className={`h-6 w-6 ${
                  isCreate ? 'h-8 w-8' : ''
                }`}
                strokeWidth={isActive || isCreate ? 2.5 : 2}
              />
              <span className={`text-xs mt-1 ${isCreate ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}