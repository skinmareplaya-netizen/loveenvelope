const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
export async function onRequestGet({ params, env }) {
  if (!env.DB) return new Response(JSON.stringify({ error: "Database unavailable" }), { status: 503, headers: JSON_HEADERS });
  const id = String(params.id || "");
  if (!/^[a-f0-9]{18}$/.test(id)) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: JSON_HEADERS });
  const row = await env.DB.prepare(
    "SELECT id, kind, theme, recipient, sender, title, message, signature, music, created_at FROM envelopes WHERE id = ?"
  ).bind(id).first();
  if (!row) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: JSON_HEADERS });
  return new Response(JSON.stringify(row), { headers: JSON_HEADERS });
}
