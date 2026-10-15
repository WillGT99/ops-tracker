// LightWork Ops Tracker: Cloudflare Worker
// 1. Relays AI requests to Groq, so the API key never reaches the browser.
// 2. Stores the shared tracker data in a Cloudflare D1 database.
// 3. Checks a shared team password on every request.
//
// Settings (Worker > Settings > Variables and Secrets):
//   GROQ_API_KEY    Secret. Your Groq API key.
//   APP_PASSWORD    Secret. The shared team password.
//   ALLOWED_ORIGIN  Text. Your GitHub Pages origin, e.g. https://willgt99.github.io (no trailing slash).
//   MODEL           Text, optional. Defaults to openai/gpt-oss-120b.
// Binding (Worker > Settings > Bindings): D1 database, variable name DB.
// The table is created automatically on first use.

const MAX_BODY = 1_000_000; // 1 MB

export default {
  async fetch(request, env) {
    const origin = (request.headers.get("Origin") || "").toLowerCase();
    const allowed = (env.ALLOWED_ORIGIN || "").toLowerCase().replace(/\/+$/, "");
    const cors = {
      "Access-Control-Allow-Origin": allowed || "*",
      "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Team-Password",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };
    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (allowed && origin && origin !== allowed) return json({ error: "forbidden" }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    if (!env.APP_PASSWORD) return json({ error: "APP_PASSWORD is not set on the Worker" }, 500);
    if (!safeEqual(request.headers.get("X-Team-Password") || "", env.APP_PASSWORD)) {
      return json({ error: "wrong password" }, 401);
    }

    const path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
    try {
      if (path === "/data" && request.method === "GET") return json(await readState(env));
      if (path === "/data" && request.method === "PUT") return await writeState(request, env, json);
      if ((path === "/ai" || path === "/") && request.method === "POST") return await relayAI(request, env, json);
      return json({ error: "not found" }, 404);
    } catch (e) {
      return json({ error: String((e && e.message) || e).slice(0, 200) }, 500);
    }
  },
};

function safeEqual(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

async function ensureTable(env) {
  if (!env.DB) throw new Error("D1 database not bound (variable name must be DB)");
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY, version INTEGER NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL)"
  ).run();
}

async function readState(env) {
  await ensureTable(env);
  const row = await env.DB.prepare("SELECT version, data FROM state WHERE id = 1").first();
  return row ? { version: row.version, data: JSON.parse(row.data) } : { version: 0, data: { items: [] } };
}

// Saves only if the browser's copy is up to date (its version matches the stored one).
// Otherwise returns 409 with the latest data, so one person's save never silently wipes another's.
async function writeState(request, env, json) {
  const text = await request.text();
  if (text.length > MAX_BODY) return json({ error: "data too large" }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ error: "invalid JSON" }, 400); }
  if (!body || !Number.isInteger(body.version) || !body.data || !Array.isArray(body.data.items)) {
    return json({ error: "expected { version, data: { items: [] } }" }, 400);
  }
  await ensureTable(env);
  const data = JSON.stringify(body.data), now = new Date().toISOString();
  const res = body.version === 0
    ? await env.DB.prepare("INSERT INTO state (id, version, data, updated_at) VALUES (1, 1, ?, ?) ON CONFLICT(id) DO NOTHING").bind(data, now).run()
    : await env.DB.prepare("UPDATE state SET data = ?, version = version + 1, updated_at = ? WHERE id = 1 AND version = ?").bind(data, now, body.version).run();
  if (res.meta.changes === 1) return json({ version: body.version + 1 });
  return json({ error: "conflict", ...(await readState(env)) }, 409);
}

async function relayAI(request, env, json) {
  if (!env.GROQ_API_KEY) return json({ error: "GROQ_API_KEY is not set on the Worker" }, 500);
  const text = await request.text();
  if (text.length > MAX_BODY) return json({ error: "request too large" }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ error: "invalid JSON" }, 400); }
  const { system, prompt } = body || {};
  if (typeof prompt !== "string" || !prompt) return json({ error: "missing prompt" }, 400);

  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + env.GROQ_API_KEY },
    body: JSON.stringify({
      model: env.MODEL || "openai/gpt-oss-120b",
      temperature: 0.2,
      messages: [
        ...(system ? [{ role: "system", content: String(system) }] : []),
        { role: "user", content: prompt },
      ],
    }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) return json({ error: "groq " + r.status + ((d.error && d.error.message) ? ": " + d.error.message.slice(0, 120) : "") }, 502);
  const out = d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
  if (!out) return json({ error: "empty AI response" }, 502);
  return json({ text: out });
}
