import EventMap from '@/components/map/EventMap'
import BottomNav from '@/components/layout/BottomNav'

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow-sm px-4 py-3 z-10">
        <h1 className="text-2xl font-bold text-primary-500 text-center">GoodEats!</h1>
      </header>

      <main className="flex-1 relative">
        <EventMap />
      </main>

      <BottomNav />
    </div>
  )
}