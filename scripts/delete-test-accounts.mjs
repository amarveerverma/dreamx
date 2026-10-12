import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function deleteAccounts() {
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) return console.error(listError);

  for (const user of usersData.users) {
    if (user.email.includes('.test@')) {
      console.log(`Deleting user: ${user.email}`);
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    }
  }
}

deleteAccounts();
