const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
const allowedKinds = new Set(["sorry", "birthday", "date", "love", "support", "custom"]);
const allowedThemes = new Set(["noir", "blush", "garden", "sky"]);
const allowedMusic = new Set(["off", "chime", "ambient"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
function cleanString(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function randomId() {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "База данных не подключена. Следуй инструкции в README." }, 503);
  let input;
  try { input = await request.json(); } catch { return json({ error: "Некорректный JSON." }, 400); }
  const kind = allowedKinds.has(input.kind) ? input.kind : "custom";
  const theme = allowedThemes.has(input.theme) ? input.theme : "noir";
  const music = allowedMusic.has(input.music) ? input.music : "off";
  const to = cleanString(input.to, 60);
  const from = cleanString(input.from, 60);
  const title = cleanString(input.title, 90) || "Небольшое послание для тебя";
  const message = cleanString(input.message, 2500);
  const signature = cleanString(input.signature, 80);
  if (!message) return json({ error: "Текст послания не может быть пустым." }, 400);
  if (message.length > 2500) return json({ error: "Слишком длинное послание." }, 413);

  const id = randomId();
  const createdAt = new Date().toISOString();
  try {
    await env.DB.prepare(
      "INSERT INTO envelopes (id, kind, theme, recipient, sender, title, message, signature, music, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, kind, theme, to, from, title, message, signature, music, createdAt).run();
    return json({ id, createdAt }, 201);
  } catch (e) {
    return json({ error: "Не удалось сохранить послание. Проверь настройки D1 и повтори попытку." }, 500);
  }
}

export async function onRequestGet({ env }) {
  return json({ service: "LoveEnvelope API", status: "ok", create: "POST /api/envelopes", read: "GET /api/envelopes/:id" });
}
