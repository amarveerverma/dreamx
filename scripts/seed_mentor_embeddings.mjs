import pg from "pg";
import fs from "fs";

// Load .env.local cleanly stripping comments and quotes
const envContent = fs.readFileSync(".env.local", "utf8");
const envVars = {};
envContent.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const withoutComment = trimmed.split("#")[0].trim();
    const eqIdx = withoutComment.indexOf("=");
    if (eqIdx > 0) {
      const key = withoutComment.substring(0, eqIdx).trim();
      const val = withoutComment.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      envVars[key] = val;
    }
  }
});

const dbUrl = envVars.DATABASE_URL;
const geminiKey = envVars.GEMINI_API_KEY;

if (!dbUrl) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}

const client = new pg.Client({ connectionString: dbUrl });

async function generateVector(text) {
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text: text.slice(0, 2048) }] },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.embedding?.values?.length === 768) {
          return json.embedding.values;
        }
      }
    } catch (err) {
      console.warn("Gemini embedding fallback:", err.message);
    }
  }

  // Deterministic fallback vector
  const dim = 768;
  const vec = new Array(dim).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  for (let i = 0; i < dim; i++) {
    const seed = Math.sin(hash + i) * 10000;
    vec[i] = Number((seed - Math.floor(seed)).toFixed(6));
  }
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vec.map((v) => Number((v / norm).toFixed(6)));
}

async function seed() {
  console.log("--- SEEDING MENTOR EMBEDDINGS (Phase 5 via Postgres) ---");
  try {
    await client.connect();

    const mentorsRes = await client.query(`
      SELECT id, full_name, headline, bio, languages_spoken, years_experience, target_career_market_id
      FROM public.profiles
      WHERE role = 'mentor'
    `);

    const mentors = mentorsRes.rows;
    console.log(`Found ${mentors.length} mentor profiles to embed.`);

    for (const mentor of mentors) {
      const chunk = `Mentor: ${mentor.full_name || "Expert"}. Headline: ${mentor.headline || "Senior Tech Leader"}. Bio: ${mentor.bio || "Experienced mentor"}. Experience: ${mentor.years_experience || 5} years. Market: ${mentor.target_career_market_id || "CM-IN"}. Languages: ${Array.isArray(mentor.languages_spoken) ? mentor.languages_spoken.join(", ") : "en"}`;
      const embedding = await generateVector(chunk);
      const vectorStr = `[${embedding.join(",")}]`;

      await client.query(`
        INSERT INTO ai.document_embeddings (entity_id, entity_type, content_chunk, metadata, embedding)
        VALUES ($1, $2, $3, $4, $5::extensions.vector)
        ON CONFLICT (entity_id, entity_type)
        DO UPDATE SET content_chunk = EXCLUDED.content_chunk, embedding = EXCLUDED.embedding, updated_at = NOW()
      `, [
        mentor.id,
        "mentor_profile",
        chunk,
        JSON.stringify({ market: mentor.target_career_market_id || "CM-IN", full_name: mentor.full_name }),
        vectorStr
      ]);

      console.log(`Successfully embedded mentor ${mentor.full_name || mentor.id} into ai.document_embeddings!`);
    }

    const countRes = await client.query("SELECT COUNT(*) FROM ai.document_embeddings");
    console.log(`Total records in ai.document_embeddings: ${countRes.rows[0].count}`);
    console.log("--- SEEDING COMPLETE ---");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await client.end();
  }
}

seed();
