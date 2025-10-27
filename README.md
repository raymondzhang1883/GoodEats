# GoodEats! 🍲

A social platform that brings people together through the joy of food. Connect with your community through potlucks, cooking classes, and shared meals.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Google Maps API key (optional for development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/goodeats.git
cd goodeats
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL from `/supabase/schema.sql` in the SQL Editor
   - Run the trigger function from `/supabase/create-user-function.sql`

4. **Configure environment variables**
```bash
cp .env.local.example .env.local
```
Add your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key (optional)
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

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

## 📝 Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Database Migrations
All database changes should be added to `/supabase/schema.sql`

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for protected routes
- User data isolation through RLS policies
- Secure session management

## 📚 Documentation

- [Supabase Setup Guide](./docs/SUPABASE_SETUP.md)
- [Authentication Flow](./docs/AUTH_FIX_SUMMARY.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built with ❤️ for the UT Austin community