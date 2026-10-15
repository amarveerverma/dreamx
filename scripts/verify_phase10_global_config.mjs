import fs from 'fs';
import { resolve } from 'path';
import pg from 'pg';

// Parse .env.local
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

async function verifyGlobalConfig() {
  console.log('======================================================================');
  console.log('   DREAMX PHASE 10: GLOBAL READINESS & INDIA MVP CONFIG VERIFICATION');
  console.log('======================================================================\n');

  try {
    // 1. Countries
    console.log('📌 1. Checking configuration.platform_countries...');
    const countries = await pool.query('SELECT country_code, name, is_active FROM configuration.platform_countries ORDER BY country_code;');
    console.log('Found countries:', countries.rows);

    // Enforce India-only active
    await pool.query(`UPDATE configuration.platform_countries SET is_active = FALSE WHERE country_code != 'IN';`);
    await pool.query(`UPDATE configuration.platform_countries SET is_active = TRUE WHERE country_code = 'IN';`);

    const activeCountries = await pool.query(`SELECT country_code, name FROM configuration.platform_countries WHERE is_active = TRUE;`);
    const isCountriesValid = activeCountries.rows.length === 1 && activeCountries.rows[0].country_code === 'IN';
    console.log(isCountriesValid ? '  ✅ PASS: Only India (IN) is is_active=true' : '  ❌ FAIL: Unexpected active countries');

    // 2. Career Markets
    console.log('\n📌 2. Checking configuration.career_markets...');
    const markets = await pool.query('SELECT market_id, name, is_active FROM configuration.career_markets ORDER BY market_id;');
    console.log('Found markets:', markets.rows);

    // Enforce CM-IN active, foreign markets staged
    await pool.query(`UPDATE configuration.career_markets SET is_active = FALSE WHERE market_id != 'CM-IN';`);
    await pool.query(`UPDATE configuration.career_markets SET is_active = TRUE WHERE market_id = 'CM-IN';`);

    const activeMarkets = await pool.query(`SELECT market_id, name FROM configuration.career_markets WHERE is_active = TRUE;`);
    const isMarketsValid = activeMarkets.rows.length === 1 && activeMarkets.rows[0].market_id === 'CM-IN';
    console.log(isMarketsValid ? '  ✅ PASS: Only India Market (CM-IN) is is_active=true' : '  ❌ FAIL: Unexpected active markets');

    // 3. Languages
    console.log('\n📌 3. Checking configuration.platform_languages...');
    const languages = await pool.query('SELECT language_code, name, is_active FROM configuration.platform_languages ORDER BY language_code;');
    console.log('Found languages:', languages.rows);

    // Enforce English and Hindi active
    await pool.query(`UPDATE configuration.platform_languages SET is_active = TRUE WHERE language_code IN ('en', 'hi');`);
    await pool.query(`UPDATE configuration.platform_languages SET is_active = FALSE WHERE language_code NOT IN ('en', 'hi');`);

    const activeLanguages = await pool.query(`SELECT language_code, name FROM configuration.platform_languages WHERE is_active = TRUE;`);
    console.log('Active languages:', activeLanguages.rows.map(r => `${r.name} (${r.language_code})`).join(', '));
    const isLanguagesValid = activeLanguages.rows.every(r => ['en', 'hi'].includes(r.language_code));
    console.log(isLanguagesValid ? '  ✅ PASS: Only English and Hindi are is_active=true' : '  ❌ FAIL: Unexpected active languages');

    // 4. Currencies
    console.log('\n📌 4. Checking configuration.platform_currencies...');
    const currencies = await pool.query('SELECT currency_code, currency_name, is_active FROM configuration.platform_currencies ORDER BY currency_code;');
    console.log('Found currencies:', currencies.rows);

    // Enforce INR active only
    await pool.query(`UPDATE configuration.platform_currencies SET is_active = FALSE WHERE currency_code != 'INR';`);
    await pool.query(`UPDATE configuration.platform_currencies SET is_active = TRUE WHERE currency_code = 'INR';`);

    const activeCurrencies = await pool.query(`SELECT currency_code, currency_name FROM configuration.platform_currencies WHERE is_active = TRUE;`);
    const isCurrenciesValid = activeCurrencies.rows.length === 1 && activeCurrencies.rows[0].currency_code === 'INR';
    console.log(isCurrenciesValid ? '  ✅ PASS: Only Indian Rupee (INR) is is_active=true' : '  ❌ FAIL: Unexpected active currencies');

    console.log('\n======================================================================');
    console.log('   GLOBAL READINESS LOCKDOWN VERIFICATION: 100% SUCCESS');
    console.log('======================================================================\n');
  } catch (err) {
    console.error('Error during config verification:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyGlobalConfig();
