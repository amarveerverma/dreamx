import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(
  envFile
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const idx = l.indexOf('=');
      const key = l.slice(0, idx).trim();
      let val = l.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      return [key, val];
    })
);

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;


console.log('=== SUPABASE AUTH DIAGNOSTIC AUDIT ===');
console.log('Target Project URL:', SUPABASE_URL);

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const TEST_ACCOUNTS = [
  { email: 'student@dreamx.com', password: 'CareerMobility2025!', role: 'student' },
  { email: 'mentor.google@dreamx.com', password: 'CareerMobility2025!', role: 'mentor' },
  { email: 'admin@dreamx.com', password: 'CareerMobility2025!', role: 'admin' },
  { email: 'vermaamarveeer0@gamail.com', password: 'CareerMobility2025!', role: 'student' },
];

async function runAudit() {
  const results = {
    existingLogins: [],
    profileReads: [],
    profileUpdates: [],
    signupBehavior: null,
    gotrueConfig: null,
  };

  for (const acc of TEST_ACCOUNTS) {
    console.log(`\nTesting login for: ${acc.email}...`);
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email: acc.email,
      password: acc.password,
    });

    if (error) {
      console.error(`❌ Login failed for ${acc.email}:`, error.message);
      results.existingLogins.push({ email: acc.email, status: 'FAILED', error: error.message });
      continue;
    }

    console.log(`✅ Login successful for ${acc.email}. User ID: ${data.user.id}`);
    console.log(`   Role in app_metadata: ${data.user.app_metadata?.user_role}`);
    console.log(`   Session Expires in: ${data.session?.expires_in}s`);

    results.existingLogins.push({
      email: acc.email,
      status: 'SUCCESS',
      userId: data.user.id,
      userRole: data.user.app_metadata?.user_role,
      tokenType: data.session?.token_type,
      expiresIn: data.session?.expires_in,
    });

    // Test profile fetch with authenticated client
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      },
    });

    const { data: profile, error: profileErr } = await userClient
      .from('profiles')
      .select('id, full_name, email, role, public_slug')
      .eq('id', data.user.id)
      .single();

    if (profileErr) {
      console.error(`❌ Profile read failed for ${acc.email}:`, profileErr.message);
      results.profileReads.push({ email: acc.email, status: 'FAILED', error: profileErr.message });
    } else {
      console.log(`✅ Profile read succeeded for ${acc.email}: ${profile.full_name} (${profile.role})`);
      results.profileReads.push({ email: acc.email, status: 'SUCCESS', profile });
    }

    // Test profile update with authenticated client (simulating onboarding step 4)
    const { error: updateErr } = await userClient
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', data.user.id);

    if (updateErr) {
      console.error(`❌ Profile update failed for ${acc.email}:`, updateErr.message);
      results.profileUpdates.push({ email: acc.email, status: 'FAILED', error: updateErr.message });
    } else {
      console.log(`✅ Profile update succeeded for ${acc.email}`);
      results.profileUpdates.push({ email: acc.email, status: 'SUCCESS' });
    }
  }

  // Test Signup Behavior to see if email confirmation is required or auto-confirmed
  console.log('\nTesting new user signup behavior via anon client...');
  const testSignupEmail = `diag_test_${Date.now()}@dreamx-audit.internal`;
  const { data: signupData, error: signupErr } = await supabaseAnon.auth.signUp({
    email: testSignupEmail,
    password: 'CareerMobility2025!',
    options: {
      data: {
        full_name: 'Audit Diagnostic User',
        user_role: 'student',
      },
    },
  });

  if (signupErr) {
    console.error('❌ Signup error:', signupErr.message);
    results.signupBehavior = { status: 'FAILED', error: signupErr.message };
  } else {
    console.log('✅ Signup completed. User ID:', signupData.user?.id);
    console.log('   Has session immediately?:', !!signupData.session);
    console.log('   Is email confirmed?:', !!signupData.user?.confirmed_at);
    results.signupBehavior = {
      status: 'SUCCESS',
      userId: signupData.user?.id,
      hasSessionImmediately: !!signupData.session,
      isEmailConfirmed: !!signupData.user?.confirmed_at,
    };

    // Clean up test user
    if (signupData.user?.id) {
      console.log('Cleaning up diagnostic test user...');
      await supabaseAdmin.auth.admin.deleteUser(signupData.user.id);
      console.log('Diagnostic user removed.');
    }
  }

  console.log('\n=== AUDIT SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
}

runAudit().catch(console.error);
