# GoodEats! 🍲

A social platform that brings people together through the joy of food. Connect with your community through potlucks, cooking classes, and shared meals.

## Features

- 📍 **Map-Based Event Discovery** - Find food events happening near you
- 🎉 **Event Hosting & RSVP** - Create and join community food events
- 👥 **Social Profiles & Friends** - Build connections over shared meals
- 🍳 **Shared Meal Planning** - Coordinate dishes for potlucks
- 📸 **Community Feed** - Share photos and memories from events
- 📅 **Calendar Integration** - Never miss a food event

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project URL and anon key from Project Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Maps**: Google Maps API
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **State**: Zustand
- **Dates**: date-fns

## Project Structure

```
/app              # Next.js app router pages
/components       # Reusable React components
/lib             # Utilities and configurations
/public          # Static assets
/supabase        # Database schema and migrations
```

## Mobile-First Design

The app is designed with a mobile-first approach and includes:
- Progressive Web App capabilities
- Touch-optimized interactions
- Bottom navigation for easy thumb access
- Swipe gestures for better UX
- Safe area handling for modern devices

## MVP Features Included

✅ User authentication (signup/login)
✅ Event discovery on map
✅ Event creation and management
✅ RSVP system with guest counts
✅ User profiles with dietary preferences
✅ Community feed for sharing experiences
✅ Calendar view for event tracking
✅ Mobile-responsive design

## Production Considerations

For production deployment, consider:
- Implementing email verification
- Adding real geocoding for addresses
- Setting up push notifications
- Implementing image uploads to Supabase Storage
- Adding more robust error handling
- Implementing rate limiting
- Adding analytics tracking

## License

MIT