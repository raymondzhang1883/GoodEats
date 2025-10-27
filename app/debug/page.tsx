'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [error, setError] = useState<string>('')
  // Using global supabase instance

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        setError(`Session error: ${sessionError.message}`)
      }
      setSessionInfo(session)

      // Check user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        setError(prev => `${prev}\nUser error: ${userError.message}`)
      }
      setUserInfo(user)

      // Check localStorage
      const localStorage = window.localStorage
      const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase'))
      console.log('Supabase keys in localStorage:', supabaseKeys)

    } catch (err: any) {
      setError(err.message)
    }
  }

  const testSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com', // Replace with your test email
      password: 'password123' // Replace with your test password
    })

    if (error) {
      setError(`Sign in error: ${error.message}`)
    } else {
      console.log('Sign in success:', data)
      checkAuth()
    }
  }

  const testSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(`Sign out error: ${error.message}`)
    } else {
      console.log('Sign out success')
      checkAuth()
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>

      <div className="space-y-6">
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Session Info:</h2>
          <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-2">User Info:</h2>
          <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded">
            {JSON.stringify(userInfo, null, 2)}
          </pre>
        </div>

        {error && (
          <div className="card p-4 bg-red-50">
            <h2 className="font-semibold mb-2 text-red-600">Errors:</h2>
            <pre className="text-xs text-red-600">{error}</pre>
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={checkAuth} className="btn-primary">
            Refresh Auth Status
          </button>
          <button onClick={testSignIn} className="btn-secondary">
            Test Sign In
          </button>
          <button onClick={testSignOut} className="btn-secondary">
            Test Sign Out
          </button>
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-2">Environment:</h2>
          <p className="text-sm">
            Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}
          </p>
          <p className="text-sm">
            Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}
          </p>
        </div>
      </div>
    </div>
  )
}