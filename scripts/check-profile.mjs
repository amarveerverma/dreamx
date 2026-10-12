import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkProfile() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', 'student.test@your-test-domain.example')
    .single();

  if (error) {
    console.error("Profile Error:", error);
  } else {
    console.log("Profile Data:", JSON.stringify(data, null, 2));
  }
}

checkProfile();
