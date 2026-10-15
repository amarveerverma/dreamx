import fs from 'fs';
import { resolve } from 'path';
import pg from 'pg';

const envFile = fs.readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    let v = trimmed.slice(idx + 1).split('#')[0].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[trimmed.slice(0, idx).trim()] = v;
  }
}

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function applyMigration() {
  console.log('Applying migration 0012_privacy_and_dpdp_compliance.sql...');
  const sql = fs.readFileSync(resolve(process.cwd(), 'supabase/migrations/0012_privacy_and_dpdp_compliance.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('✅ Migration 0012 successfully applied!');
  } catch (err) {
    console.error('❌ Failed to apply migration 0012:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();
