'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'
import { Loader2 } from 'lucide-react'

export default function DebugPage() {
  const { user: authUser, loading: authLoading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkEverything()
  }, [])

  const checkEverything = async () => {
    setChecking(true)
    const info: any = {}

    // Check localStorage
    info.localStorage = {
      keys: Object.keys(localStorage).filter(k => k.startsWith('sb-')),
      hasSession: localStorage.getItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token') !== null
    }

    // Check auth session
    const { data: sessionData } = await supabase.auth.getSession()
    info.session = {
      exists: !!sessionData.session,
      user: sessionData.session?.user
        ? {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            user_metadata: sessionData.session.user.user_metadata,
          }
        : null
    }

    // Check user profile
    if (sessionData.session?.user) {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single()

      info.profile = {
        exists: !!profile,
        data: profile,
        error: error?.message
      }
    }

    // Check database connection
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1)
      info.database = {
        connected: !error,
        error: error?.message
      }
    } catch (e: any) {
      info.database = {
        connected: false,
        error: e.message
      }
    }

    setDebugInfo(info)
    setChecking(false)
  }

  const clearLocalStorage = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-'))
    keys.forEach(key => localStorage.removeItem(key))
    alert('Cleared ' + keys.length + ' localStorage keys. Refresh the page.')
  }

  const testSignOut = async () => {
    await supabase.auth.signOut()
    alert('Signed out. Refresh to see changes.')
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Auth Debug Console</h1>

        {/* Auth Provider State */}
        <div className="card p-6 mb-4">
          <h2 className="text-xl font-semibold mb-3">1. Auth Provider State</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Loading: {authLoading ? '⏳ Yes' : '✅ No'}</div>
            <div>User: {authUser ? '✅ Logged In' : '❌ Not Logged In'}</div>
            {authUser && (
              <>
                <div>User ID: {authUser.id}</div>
                <div>Email: {authUser.email}</div>
              </>
            )}
          </div>
        </div>

        {/* Session State */}
        <div className="card p-6 mb-4">
          <h2 className="text-xl font-semibold mb-3">2. Session State</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Session Exists: {debugInfo.session?.exists ? '✅ Yes' : '❌ No'}</div>
            {debugInfo.session?.user && (
              <>
                <div>User ID: {debugInfo.session.user.id}</div>
                <div>Email: {debugInfo.session.user.email}</div>
                <div>Metadata: {JSON.stringify(debugInfo.session.user.user_metadata)}</div>
              </>
            )}
          </div>
        </div>

        {/* LocalStorage */}
        <div className="card p-6 mb-4">
          <h2 className="text-xl font-semibold mb-3">3. LocalStorage</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Supabase Keys Found: {debugInfo.localStorage?.keys?.length || 0}</div>
            <div>Has Session: {debugInfo.localStorage?.hasSession ? '✅ Yes' : '❌ No'}</div>
            {debugInfo.localStorage?.keys?.length > 0 && (
              <div className="text-xs bg-gray-100 p-2 rounded mt-2">
                {debugInfo.localStorage.keys.map((key: string) => (
                  <div key={key}>{key}</div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={clearLocalStorage}
            className="btn-secondary mt-3"
          >
            Clear LocalStorage
          </button>
        </div>

        {/* Profile State */}
        <div className="card p-6 mb-4">
          <h2 className="text-xl font-semibold mb-3">4. User Profile</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Profile Exists: {debugInfo.profile?.exists ? '✅ Yes' : '❌ No'}</div>
            {debugInfo.profile?.error && (
              <div className="text-red-600">Error: {debugInfo.profile.error}</div>
            )}
            {debugInfo.profile?.data && (
              <div className="text-xs bg-gray-100 p-2 rounded mt-2">
                <div>ID: {debugInfo.profile.data.id}</div>
                <div>Email: {debugInfo.profile.data.email}</div>
                <div>Username: {debugInfo.profile.data.username || '❌ MISSING'}</div>
                <div>Full Name: {debugInfo.profile.data.full_name || '❌ MISSING'}</div>
                <div>Created: {new Date(debugInfo.profile.data.created_at).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Database Connection */}
        <div className="card p-6 mb-4">
          <h2 className="text-xl font-semibold mb-3">5. Database Connection</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Connected: {debugInfo.database?.connected ? '✅ Yes' : '❌ No'}</div>
            {debugInfo.database?.error && (
              <div className="text-red-600">Error: {debugInfo.database.error}</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-3">Actions</h2>
          <div className="flex gap-3">
            <button onClick={checkEverything} className="btn-primary">
              🔄 Refresh Debug Info
            </button>
            <button onClick={testSignOut} className="btn-secondary">
              🚪 Sign Out
            </button>
            <button onClick={() => window.location.href = '/'} className="btn-secondary">
              🏠 Go to Sign In
            </button>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card p-6 mt-4 bg-blue-50">
          <h2 className="text-xl font-semibold mb-3">💡 Troubleshooting Tips</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>If session exists but AuthProvider shows "Not Logged In", there's a state sync issue</li>
            <li>If profile doesn't exist but session does, the database trigger isn't working</li>
            <li>If username/full_name are missing, check the signup flow and trigger</li>
            <li>Try clearing localStorage and signing in again</li>
            <li>Check browser console for any errors</li>
            <li>Make sure you've restarted the dev server after code changes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
