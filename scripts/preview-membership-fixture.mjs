// Local UI test fixture only. Serves the real static build with a mock Auth API
// on a separate loopback origin. It never calls Supabase or sends real emails.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { renderEmailTemplate } from "./email-template-tools.mjs";
import { messages } from "../supabase/templates/messages.mjs";
const emailTemplates = new Set(["confirmation", "recovery", ...messages.map(message => message.key)]);

const root = path.resolve("out");
const port = Number(process.argv[2] || 3002);
const origin = `http://127.0.0.1:${port}`;
const env = await readFile(".env.local", "utf8");
const remote = env.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m)?.[1].trim();
if (!remote) throw new Error("Build with the public Supabase URL first.");
const user = { id: "00000000-0000-4000-8000-000000000001", aud: "authenticated", role: "authenticated", email: "fixture@example.test", email_confirmed_at: new Date().toISOString(), app_metadata: { provider: "email" }, user_metadata: {}, created_at: new Date().toISOString() };
const claims = { sub: user.id, session_id: "fixture-recovery-session", role: "authenticated", aud: "authenticated", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 };
const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url")}.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.test-fixture-only`;
const session = { access_token: token, refresh_token: "fixture-only-refresh", token_type: "bearer", expires_in: 3600, user };
const mime = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg" };
http.createServer(async (req, res) => {
  const url = new URL(req.url, origin);
  const json = (status, value) => { res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(value)); };
  try {
    const emailPreview = url.pathname.match(/^\/__fixture\/email\/([a-z_]+)\/(en|mn)$/);
    if (emailPreview && emailTemplates.has(emailPreview[1])) {
      let template = await readFile(`supabase/templates/${emailPreview[1]}.html`, "utf8");
      const page = emailPreview[1] === "recovery" ? "reset-password" : "members";
      template = renderEmailTemplate(template, {
        redirectTo: `https://innolab.mn/${emailPreview[2] === "en" ? "en/" : ""}${page}`,
        locale: emailPreview[2],
        confirmationUrl: origin + "/__fixture", siteUrl: origin,
      });
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(template); return;
    }
    if (url.pathname === "/__fixture") {
      const hash = new URLSearchParams({ access_token: token, refresh_token: session.refresh_token, expires_in: "3600", token_type: "bearer", type: "recovery" });
      res.writeHead(200, { "content-type": "text/html" });
      res.end(`<h1>Local Auth UI test fixture</h1><p>No real accounts or email requests.</p><a href="/en/register">Registration</a><br><a href="/en/forgot-password">Forgot password</a><br><a href="/en/reset-password#${hash}">Open test recovery link</a>`);
      return;
    }
    if (url.pathname.startsWith("/auth/v1/")) {
      // Discard request bodies. Do not log or persist sample passwords.
      for await (const _chunk of req) { /* Drain body. */ }
      if (url.pathname === "/auth/v1/signup") return json(200, { user, session: null });
      if (url.pathname === "/auth/v1/recover") return json(200, {});
      if (url.pathname === "/auth/v1/logout") return json(200, {});
      if (url.pathname === "/auth/v1/token") return json(200, session);
      if (url.pathname === "/auth/v1/user" && req.headers.authorization === `Bearer ${token}`) return json(200, user);
      return json(401, { message: "Fixture session missing", code: "session_not_found" });
    }
    if (url.pathname === "/rest/v1/profiles") return json(200, { id: user.id, first_name: "Test", last_name: "Maker", username: "fixture_maker" });
    const pathname = decodeURIComponent(url.pathname);
    const candidate = path.resolve(root, "." + pathname);
    if (candidate !== root && !candidate.startsWith(root + path.sep)) return json(403, {});
    let file;
    for (const option of [candidate, candidate + ".html", path.join(candidate, "index.html")]) {
      try { if ((await stat(option)).isFile()) { file = option; break; } } catch { /* Next candidate. */ }
    }
    if (!file) return json(404, {});
    const ext = path.extname(file);
    let body = await readFile(file);
    if ([".js", ".html", ".txt"].includes(ext)) body = Buffer.from(body.toString("utf8").replaceAll(remote, origin));
    res.writeHead(200, { "content-type": mime[ext] || "application/octet-stream", "cache-control": "no-store" }); res.end(body);
  } catch { json(500, { error: "fixture_failure" }); }
}).listen(port, "127.0.0.1", () => console.log(`Auth UI fixture: ${origin}/__fixture`));
