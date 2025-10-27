export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          dietary_preferences: string[] | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url?: string | null
          bio?: string | null
          dietary_preferences?: string[] | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          dietary_preferences?: string[] | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          host_id: string
          title: string
          description: string
          event_type: 'potluck' | 'dinner' | 'cooking_class' | 'picnic' | 'other'
          date: string
          time: string
          duration_hours: number
          location_name: string
          location_address: string
          latitude: number
          longitude: number
          max_attendees: number
          current_attendees: number
          cover_image: string | null
          meal_theme: string | null
          price: number
          is_free: boolean
          dietary_options: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          host_id: string
          title: string
          description: string
          event_type: 'potluck' | 'dinner' | 'cooking_class' | 'picnic' | 'other'
          date: string
          time: string
          duration_hours?: number
          location_name: string
          location_address: string
          latitude: number
          longitude: number
          max_attendees: number
          current_attendees?: number
          cover_image?: string | null
          meal_theme?: string | null
          price?: number
          is_free?: boolean
          dietary_options?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          host_id?: string
          title?: string
          description?: string
          event_type?: 'potluck' | 'dinner' | 'cooking_class' | 'picnic' | 'other'
          date?: string
          time?: string
          duration_hours?: number
          location_name?: string
          location_address?: string
          latitude?: number
          longitude?: number
          max_attendees?: number
          current_attendees?: number
          cover_image?: string | null
          meal_theme?: string | null
          price?: number
          is_free?: boolean
          dietary_options?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      rsvps: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: 'attending' | 'maybe' | 'declined'
          bringing_dish: string | null
          dietary_restrictions: string | null
          guests_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status: 'attending' | 'maybe' | 'declined'
          bringing_dish?: string | null
          dietary_restrictions?: string | null
          guests_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: 'attending' | 'maybe' | 'declined'
          bringing_dish?: string | null
          dietary_restrictions?: string | null
          guests_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
        }
      }
      meal_plans: {
        Row: {
          id: string
          event_id: string
          dishes: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          dishes: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          dishes?: Json
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          event_id: string | null
          content: string
          images: string[] | null
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id?: string | null
          content: string
          images?: string[] | null
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string | null
          content?: string
          images?: string[] | null
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}