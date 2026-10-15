import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
for (const line of envFile.split(/\r?\n/)) {
  const withoutComment = line.split('#')[0].trim();
  if (withoutComment && withoutComment.includes('=')) {
    const idx = withoutComment.indexOf('=');
    const key = withoutComment.slice(0, idx).trim();
    let val = withoutComment.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
}

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function setupAdmin() {
  const adminEmail = 'admin@dreamx.com';
  const adminPassword = 'CareerMobility2025!';

  console.log(`Checking for admin account: ${adminEmail}...`);
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list users:', listError);
    return;
  }

  let user = usersData.users.find(u => u.email === adminEmail);

  if (!user) {
    console.log(`Creating admin account ${adminEmail}...`);
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      app_metadata: { user_role: 'admin' },
      user_metadata: { user_role: 'admin', full_name: 'Platform Operations Admin' },
    });
    if (createError) {
      console.error('Failed to create admin:', createError);
      return;
    }
    user = createData.user;
    console.log(`✅ Created admin user ID: ${user.id}`);
  } else {
    console.log(`Admin account exists. Updating app_metadata to admin...`);
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: adminPassword,
      app_metadata: { user_role: 'admin' },
      user_metadata: { user_role: 'admin', full_name: 'Platform Operations Admin' },
    });
    if (updateError) {
      console.error('Failed to update admin:', updateError);
      return;
    }
    console.log(`✅ Updated admin user metadata.`);
  }

  // Ensure profile exists and has role='admin'
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: user.id,
      email: adminEmail,
      full_name: 'Platform Operations Admin',
      role: 'admin',
      public_slug: 'platform-operations-admin',
      target_career_market_id: 'CM-IN',
      current_country: 'IN',
    })
    .select()
    .single();

  if (profileErr) {
    console.error('Error upserting admin profile:', profileErr);
  } else {
    console.log(`✅ Admin profile upserted with role: ${profile.role}`);
  }
}

setupAdmin().catch(console.error);
