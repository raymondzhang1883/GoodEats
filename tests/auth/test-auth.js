// Test authentication directly with Supabase
// Run with: node test-auth.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testAuth() {
  console.log('Testing Supabase Authentication...\n')

  // Check environment variables
  console.log('Environment Check:')
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set')
  console.log('SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set')
  console.log('')

  // Replace with your test credentials
  const testEmail = 'raymond.zhang@utexas.edu' // Update this
  const testPassword = 'password' // Update this with your actual password

  console.log(`Attempting to sign in with email: ${testEmail}`)

  try {
    // Test sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (error) {
      console.error('❌ Sign in failed:', error.message)
      console.error('Error details:', error)

      // Try to check if user exists
      console.log('\nChecking if user exists in auth.users...')
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
      if (userError) {
        console.log('Cannot list users (needs admin access)')
      }
    } else {
      console.log('✅ Sign in successful!')
      console.log('User ID:', data.user.id)
      console.log('Email:', data.user.email)
      console.log('Session:', data.session ? 'Active' : 'None')

      // Sign out
      await supabase.auth.signOut()
      console.log('✅ Signed out successfully')
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testAuth()