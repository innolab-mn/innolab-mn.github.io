import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ||
  "https://innolab.mn,https://www.innolab.mn,http://localhost:3000,http://127.0.0.1:3000")
  .split(",").map(value => value.trim());
const url = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function digest(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(serviceKey),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const hash = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function limitedBody(req: Request) {
  const reader = req.body?.getReader();
  if (!reader) throw new Error("missing_body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4096) { await reader.cancel(); throw new Error("large_body"); }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(body));
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const cors = {
    "Access-Control-Allow-Origin": origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
  const reply = (status: number, body: unknown, extra = {}) => new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json", ...extra },
  });
  if (origin && !allowedOrigins.includes(origin)) return reply(403, { error: "origin_not_allowed" });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return reply(405, { error: "method_not_allowed" }, { Allow: "POST, OPTIONS" });
  if (!req.headers.get("content-type")?.includes("application/json")) return reply(415, { error: "invalid_request" });
  let input;
  try { input = await limitedBody(req); } catch { return reply(400, { error: "invalid_request" }); }
  const username = typeof input?.username === "string" ? input.username.trim().normalize("NFC").toLowerCase() : "";
  const password = input?.password;
  const captchaToken = input?.captchaToken;
  if (captchaToken !== undefined && (typeof captchaToken !== "string" || !captchaToken.trim() || captchaToken.length > 2048)) {
    return reply(400, { error: "invalid_request" });
  }
  if (!/^[\p{L}\p{N}][\p{L}\p{N}_.-]{2,23}$/u.test(username) ||
      typeof password !== "string" || password.length < 8 || password.length > 128) {
    return reply(400, { error: "invalid_login" });
  }
  try {
    const consume = async (bucket: string, max: number, seconds: number) => {
      const { data, error } = await admin.rpc("consume_member_login_limit", {
        bucket, max_attempts: max, window_seconds: seconds,
      });
      if (error) throw error;
      return data === true;
    };
    // Global and account limits remain effective even if a caller spoofs IP headers.
    const globalAllowed = await consume("global", 300, 60);
    if (!globalAllowed) return reply(429, { error: "rate_limited" }, { "Retry-After": "60" });
    const accountAllowed = await consume(`user:${await digest(username)}`, 10, 900);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipAllowed = await consume(`ip:${await digest(ip)}`, 30, 900);
    if (!accountAllowed || !ipAllowed) return reply(429, { error: "rate_limited" }, { "Retry-After": "900" });
    const { data: email, error: lookupError } = await admin.rpc("member_login_email", { login_username: username });
    if (lookupError) throw lookupError;
    // Always ask Auth to verify a password, including when the username is unknown.
    const auth = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await auth.auth.signInWithPassword({
      email: email || "unknown-member@invalid.example", password,
      ...(captchaToken ? { options: { captchaToken } } : {}),
    });
    if (error?.code === "captcha_failed") return reply(400, { error: "captcha_failed" });
    if (error?.status === 429) return reply(429, { error: "rate_limited" }, { "Retry-After": "60" });
    if (error || !email || !data.session) return reply(400, { error: "invalid_login" });
    return reply(200, { access_token: data.session.access_token, refresh_token: data.session.refresh_token });
  } catch {
    // Deliberately do not log bodies, credentials, tokens, email mappings, or SDK errors.
    return reply(503, { error: "unavailable" });
  }
});
