#!/usr/bin/env node

/**
 * Diagnose Auth Mismatch
 * Check if profiles exist without auth accounts (orphaned profiles)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Diagnosing Auth Mismatch Issues\n');
console.log('='.repeat(60));

if (!supabaseServiceRole) {
  console.log('\n❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is required for this check!\n');
  console.log('To get your Service Role Key:');
  console.log('1. Go to Supabase Dashboard → Settings → API');
  console.log('2. Find "service_role" under "Project API keys"');
  console.log('3. Copy it and add to .env.local:\n');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...\n');
  console.log('⚠️  Keep this key SECRET - it has admin access!\n');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function diagnose() {
  console.log('\n1️⃣  Fetching auth.users (authentication accounts)...\n');
  
  const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.log('❌ Error fetching auth users:', authError.message);
    process.exit(1);
  }
  
  console.log(`   Found ${authUsers.length} auth account(s):\n`);
  authUsers.forEach((user, i) => {
    console.log(`   ${i + 1}. ${user.email}`);
    console.log(`      ID: ${user.id}`);
    console.log(`      Confirmed: ${user.email_confirmed_at ? '✅ Yes' : '❌ No (THIS COULD BE THE ISSUE!)'}`);
    console.log(`      Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '❌ Never'}`);
    console.log(`      Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log();
  });
  
  console.log('2️⃣  Fetching public.users (profile records)...\n');
  
  const { data: publicUsers, error: publicError } = await supabaseAdmin
    .from('users')
    .select('id, email, username, full_name, created_at')
    .order('created_at', { ascending: false });
  
  if (publicError) {
    console.log('❌ Error fetching profiles:', publicError.message);
    process.exit(1);
  }
  
  console.log(`   Found ${publicUsers.length} profile record(s):\n`);
  publicUsers.forEach((user, i) => {
    console.log(`   ${i + 1}. ${user.email}`);
    console.log(`      ID: ${user.id}`);
    console.log(`      Username: ${user.username || '❌ MISSING'}`);
    console.log(`      Full Name: ${user.full_name || '❌ MISSING'}`);
    console.log(`      Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log();
  });
  
  console.log('3️⃣  Checking for mismatches...\n');
  
  const authIds = authUsers.map(u => u.id);
  const publicIds = publicUsers.map(u => u.id);
  const authEmails = authUsers.map(u => u.email.toLowerCase());
  const publicEmails = publicUsers.map(u => u.email.toLowerCase());
  
  // Orphaned profiles (profile exists but no auth account)
  const orphanedProfiles = publicUsers.filter(p => !authIds.includes(p.id));
  
  // Missing profiles (auth account exists but no profile)
  const missingProfiles = authUsers.filter(a => !publicIds.includes(a.id));
  
  // Email mismatches (same email but different IDs)
  const emailMismatches = publicUsers.filter(p => {
    const matchingAuth = authUsers.find(a => a.email.toLowerCase() === p.email.toLowerCase());
    return matchingAuth && matchingAuth.id !== p.id;
  });
  
  if (orphanedProfiles.length > 0) {
    console.log('   🚨 ORPHANED PROFILES FOUND! (Profile exists but NO auth account)\n');
    console.log('   This is the "Invalid credentials" issue!\n');
    orphanedProfiles.forEach(profile => {
      console.log(`   ❌ ${profile.email}`);
      console.log(`      Profile ID: ${profile.id}`);
      console.log(`      Problem: No matching auth.users entry`);
      console.log(`      Solution: Delete this profile and sign up fresh\n`);
    });
  }
  
  if (missingProfiles.length > 0) {
    console.log('   ⚠️  AUTH ACCOUNTS WITHOUT PROFILES (Trigger not working)\n');
    missingProfiles.forEach(auth => {
      console.log(`   ⚠️  ${auth.email}`);
      console.log(`      Auth ID: ${auth.id}`);
      console.log(`      Problem: No matching public.users entry`);
      console.log(`      Solution: Trigger should create this automatically\n`);
    });
  }
  
  if (emailMismatches.length > 0) {
    console.log('   🔄 EMAIL MISMATCHES (Same email, different IDs)\n');
    emailMismatches.forEach(profile => {
      const matchingAuth = authUsers.find(a => a.email.toLowerCase() === profile.email.toLowerCase());
      console.log(`   🔄 ${profile.email}`);
      console.log(`      Profile ID: ${profile.id}`);
      console.log(`      Auth ID: ${matchingAuth.id}`);
      console.log(`      Problem: Same email but different user IDs`);
      console.log(`      Solution: Delete one and recreate\n`);
    });
  }
  
  if (orphanedProfiles.length === 0 && missingProfiles.length === 0 && emailMismatches.length === 0) {
    console.log('   ✅ No mismatches found - all accounts are in sync!\n');
    
    // Check for email confirmation issues
    const unconfirmed = authUsers.filter(u => !u.email_confirmed_at);
    if (unconfirmed.length > 0) {
      console.log('   ⚠️  However, some accounts are not email-confirmed:\n');
      unconfirmed.forEach(user => {
        console.log(`   ⚠️  ${user.email} - Email not confirmed`);
        console.log(`      This will cause "Invalid credentials" error!`);
        console.log(`      Solution: Confirm email or disable confirmation requirement\n`);
      });
    }
  }
  
  console.log('='.repeat(60));
  console.log('\n💡 Quick Fixes:\n');
  
  if (orphanedProfiles.length > 0) {
    console.log('To delete orphaned profiles, run in Supabase SQL Editor:\n');
    orphanedProfiles.forEach(p => {
      console.log(`DELETE FROM public.users WHERE id = '${p.id}'; -- ${p.email}`);
    });
    console.log('\nThen sign up again with these emails.\n');
  }
  
  if (missingProfiles.length > 0) {
    console.log('To create missing profiles, run in Supabase SQL Editor:\n');
    missingProfiles.forEach(a => {
      console.log(`INSERT INTO public.users (id, email, username, full_name) VALUES ('${a.id}', '${a.email}', '${a.email.split('@')[0]}', '${a.email.split('@')[0]}');`);
    });
    console.log();
  }
  
  const unconfirmed = authUsers.filter(u => !u.email_confirmed_at);
  if (unconfirmed.length > 0) {
    console.log('To confirm emails manually, run in Supabase SQL Editor:\n');
    unconfirmed.forEach(u => {
      console.log(`UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = '${u.id}'; -- ${u.email}`);
    });
    console.log('\nOr disable email confirmation in Supabase Dashboard:');
    console.log('Authentication → Settings → Email Auth → Disable "Confirm email"\n');
  }
}

diagnose().catch(console.error);

