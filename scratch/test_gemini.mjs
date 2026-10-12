import { readFileSync } from 'fs';
import { resolve } from 'path';

const envContent = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) {
      let v = t.slice(idx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      env[t.slice(0, idx).trim()] = v;
    }
  }
}

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Respond with valid JSON: {"status": "ok", "message": "Gemini 3.8 Flash online"}' }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Output:', data.candidates?.[0]?.content?.parts?.[0]?.text);
}

test();
