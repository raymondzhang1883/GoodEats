# GoodEats! 🍲

A social platform that brings people together through the joy of food. Connect with your community through potlucks, cooking classes, and shared meals.

This is a class project for MAN 327H at The University of Texas at Austin. 

Hosted at: https://reallygoodeats.netlify.app/

## 📱 Features

### Core Functionality
- **📍 Map-Based Event Discovery** - Find food events near you
- **🎉 Event Hosting & RSVP** - Create and join community meals
- **👥 User Profiles** - Dietary preferences and social connections
- **🍳 Meal Planning** - Coordinate dishes for potlucks
- **📸 Community Feed** - Share photos and memories
- **📅 Calendar View** - Track upcoming events

### Technical Features
- Mobile-first responsive design
- Real-time updates with Supabase
- Row Level Security for data protection
- Automatic session persistence
- Progressive Web App capabilities

## 🏗️ Project Structure

```
/
├── app/                # Next.js 14 app directory
│   ├── (auth)/        # Authentication pages
│   ├── home/          # Main map view
│   ├── events/        # Event pages
│   ├── profile/       # User profile
│   ├── feed/          # Community feed
│   └── calendar/      # Calendar view
├── components/        # Reusable React components
│   ├── auth/         # Authentication components
│   ├── layout/       # Layout components
│   └── map/          # Map components
├── lib/              # Utilities and configs
│   └── supabase.ts   # Supabase client
├── supabase/         # Database files
│   ├── schema.sql    # Main database schema
│   └── create-user-function.sql
├── public/           # Static assets
├── docs/             # Documentation
└── tests/            # Test files
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Maps**: Google Maps API
- **State**: React Context
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for protected routes
- User data isolation through RLS policies
- Secure session management

## 📚 Documentation

- [Supabase Setup Guide](./docs/SUPABASE_SETUP.md)
- [Authentication Flow](./docs/AUTH_FIX_SUMMARY.md)

## 📄 License

This project is licensed under the MIT License.
