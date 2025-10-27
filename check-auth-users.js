#!/usr/bin/env node

/**
 * Check Auth Users - See what accounts actually exist
 * This uses the Admin API to check auth.users
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Checking Auth Users\n');
console.log('='.repeat(50));

if (!supabaseServiceRole) {
  console.log('\n⚠️  SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.log('   Using anon key instead (limited access)\n');
  
  // Try with anon key - can at least check public.users
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  checkPublicUsers(supabase);
} else {
  // Use service role - can check auth.users
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  checkAuthUsers(supabaseAdmin);
}

async function checkAuthUsers(supabaseAdmin) {
  console.log('1. Checking auth.users (Admin Access):');
  
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.log('   ❌ Error:', error.message);
      return;
    }
    
    console.log(`   Found ${users.length} auth users:\n`);
    
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email}`);
      console.log(`      - ID: ${user.id}`);
      console.log(`      - Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`      - Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
      console.log(`      - Confirmed: ${user.email_confirmed_at ? '✅ Yes' : '❌ No'}`);
      console.log(`      - Metadata:`, user.user_metadata);
      console.log();
    });
    
    // Also check public.users
    await checkPublicUsers(supabaseAdmin);
    
    // Compare
    console.log('\n3. Comparison:');
    const { data: publicUsers } = await supabaseAdmin.from('users').select('id, email');
    const authIds = users.map(u => u.id);
    const publicIds = (publicUsers || []).map(u => u.id);
    
    const missingProfiles = authIds.filter(id => !publicIds.includes(id));
    
    if (missingProfiles.length > 0) {
      console.log(`   ⚠️  ${missingProfiles.length} auth users missing public profiles!`);
      console.log('   User IDs:', missingProfiles);
      console.log('\n   💡 This means your trigger is not working!');
    } else {
      console.log('   ✅ All auth users have profiles');
    }
    
  } catch (e) {
    console.log('   ❌ Error:', e.message);
  }
}

async function checkPublicUsers(supabase) {
  console.log('\n2. Checking public.users:');
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, username, full_name, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('   ❌ Error:', error.message);
      return;
    }
    
    console.log(`   Found ${users.length} profile records:\n`);
    
    if (users.length === 0) {
      console.log('   ⚠️  No profiles found!');
      console.log('   This means either:');
      console.log('      - No users have signed up yet');
      console.log('      - The database trigger is not working');
    } else {
      users.forEach((user, i) => {
        console.log(`   ${i + 1}. ${user.email}`);
        console.log(`      - Username: ${user.username || '❌ MISSING'}`);
        console.log(`      - Full Name: ${user.full_name || '❌ MISSING'}`);
        console.log(`      - Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log();
      });
    }
  } catch (e) {
    console.log('   ❌ Error:', e.message);
  }
}

console.log('\n' + '='.repeat(50));
console.log('\n💡 To get admin access, add your Service Role Key to .env.local:');
console.log('   SUPABASE_SERVICE_ROLE_KEY=your_key_here');
console.log('\n   Find it at: Supabase Dashboard → Settings → API → service_role key');

