#!/usr/bin/env node

/**
 * Comprehensive Auth Debug Script
 * Run with: node test-auth-debug.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 GoodEats Auth Debug Tool\n');
console.log('='.repeat(50));

// Check environment variables
console.log('1. Environment Variables:');
console.log('   Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('   Supabase Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Missing environment variables! Check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist in Node.js
    autoRefreshToken: false,
  }
});

async function testDatabase() {
  console.log('\n2. Database Connection:');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('   ❌ Database Error:', error.message);
      return false;
    } else {
      console.log('   ✅ Database Connected');
      return true;
    }
  } catch (e) {
    console.log('   ❌ Connection Error:', e.message);
    return false;
  }
}

async function checkUserProfiles() {
  console.log('\n3. User Profiles Check:');
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, username, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('   ❌ Error fetching users:', error.message);
      return;
    }
    
    console.log(`   Found ${users.length} users:`);
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email}`);
      console.log(`      - Username: ${user.username || '❌ MISSING'}`);
      console.log(`      - Full Name: ${user.full_name || '❌ MISSING'}`);
      console.log(`      - Created: ${new Date(user.created_at).toLocaleString()}`);
    });
  } catch (e) {
    console.log('   ❌ Error:', e.message);
  }
}

async function testAuthFlow(email, password) {
  console.log('\n4. Testing Auth Flow:');
  console.log(`   Email: ${email}`);
  
  // Test sign in
  console.log('   Attempting sign in...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (signInError) {
    console.log('   ❌ Sign In Failed:', signInError.message);
    return null;
  }
  
  console.log('   ✅ Sign In Successful');
  console.log(`   User ID: ${signInData.user.id}`);
  console.log(`   Email: ${signInData.user.email}`);
  
  // Check if user profile exists
  console.log('\n   Checking user profile...');
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', signInData.user.id)
    .single();
  
  if (profileError) {
    console.log('   ❌ Profile Not Found:', profileError.message);
  } else {
    console.log('   ✅ Profile Found:');
    console.log(`      - Username: ${profile.username || '❌ MISSING'}`);
    console.log(`      - Full Name: ${profile.full_name || '❌ MISSING'}`);
    console.log(`      - Email: ${profile.email}`);
  }
  
  // Check user metadata
  console.log('\n   Auth User Metadata:');
  console.log(`      - user_metadata:`, signInData.user.user_metadata);
  console.log(`      - app_metadata:`, signInData.user.app_metadata);
  
  return signInData.user;
}

async function checkTrigger() {
  console.log('\n5. Checking Database Trigger:');
  
  try {
    const { data, error } = await supabase.rpc('get_function_definition', {
      function_name: 'handle_new_user'
    });
    
    if (error) {
      console.log('   ⚠️  Could not verify trigger (this is okay, check manually in Supabase)');
    } else {
      console.log('   ✅ Trigger function exists');
    }
  } catch (e) {
    console.log('   ⚠️  Could not verify trigger (check manually in Supabase)');
  }
}

async function checkLocalStorage() {
  console.log('\n6. Browser Storage Issues:');
  console.log('   ⚠️  This script cannot check browser localStorage');
  console.log('   ℹ️  To check manually:');
  console.log('      1. Open browser DevTools (F12)');
  console.log('      2. Go to Application > Local Storage');
  console.log('      3. Look for keys starting with "sb-"');
  console.log('      4. These should contain your session tokens');
}

async function main() {
  const args = process.argv.slice(2);
  
  await testDatabase();
  await checkUserProfiles();
  await checkTrigger();
  await checkLocalStorage();
  
  if (args.length >= 2) {
    const [email, password] = args;
    await testAuthFlow(email, password);
  } else {
    console.log('\n💡 To test specific credentials, run:');
    console.log('   node test-auth-debug.js your@email.com yourpassword');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🔍 Debug Complete\n');
  
  console.log('📋 Next Steps:');
  console.log('1. If users are missing username/full_name, the trigger may not be working');
  console.log('2. If sign-in fails with valid credentials, check password in Supabase dashboard');
  console.log('3. If profile page shows "Not Signed In", clear browser localStorage');
  console.log('4. Make sure to restart your dev server after updating code');
}

main().catch(console.error);

