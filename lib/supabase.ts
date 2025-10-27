import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './supabase/database.types'

// Single supabase client instance for the entire app
// This client handles cookies properly for session persistence
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return ''
        const value = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
        return value ? decodeURIComponent(value[2]) : ''
      },
      set(name: string, value: string, options?: any) {
        if (typeof document === 'undefined') return
        let str = `${name}=${encodeURIComponent(value)}`
        if (options?.maxAge) str += `; Max-Age=${options.maxAge}`
        if (options?.path) str += `; Path=${options.path}`
        str += '; SameSite=Lax; Secure'
        document.cookie = str
      },
      remove(name: string) {
        if (typeof document === 'undefined') return
        document.cookie = `${name}=; Max-Age=0; Path=/`
      },
    },
  }
)