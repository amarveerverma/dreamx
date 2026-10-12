import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestAccount(email, password, role, fullName) {
  console.log(`Creating/updating test account: ${email} (${role})...`);
  
  // Try to create the user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      role: role,
      full_name: fullName
    }
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log(`User ${email} already exists. Updating password and metadata...`);
      
      // We need the user ID to update them
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) {
         console.error("Failed to list users to find existing account.", listError);
         return;
      }
      
      const user = usersData.users.find(u => u.email === email);
      if (user) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          password: password,
          user_metadata: { role: role, full_name: fullName }
        });
        if (updateError) {
           console.error(`Failed to update existing user ${email}:`, updateError);
        } else {
           console.log(`Successfully updated existing user ${email}.`);
        }
      }
    } else {
      console.error(`Error creating user ${email}:`, error);
    }
  } else {
    console.log(`Successfully created user ${email}. ID: ${data.user.id}`);
  }
}

async function main() {
  await createTestAccount(
    'student.test@your-test-domain.example',
    'TestPassword123!',
    'student',
    'Test Student'
  );

  await createTestAccount(
    'mentor.test@your-test-domain.example',
    'TestPassword123!',
    'mentor',
    'Test Mentor'
  );
  
  console.log("Test accounts setup complete.");
}

main().catch(console.error);
