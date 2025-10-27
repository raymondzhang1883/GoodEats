import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return ''
          const cookies = document.cookie.split('; ')
          const cookie = cookies.find(c => c.startsWith(`${name}=`))
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : ''
        },
        set(name: string, value: string, options?: any) {
          if (typeof document === 'undefined') return
          let cookieString = `${name}=${encodeURIComponent(value)}`

          if (options?.maxAge) {
            cookieString += `; Max-Age=${options.maxAge}`
          }
          if (options?.path) {
            cookieString += `; Path=${options.path}`
          }
          cookieString += '; SameSite=Lax'

          document.cookie = cookieString
        },
        remove(name: string) {
          if (typeof document === 'undefined') return
          document.cookie = `${name}=; Max-Age=0; Path=/`
        }
      }
    }
  )
}