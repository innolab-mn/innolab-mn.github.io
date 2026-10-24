import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import ts from "typescript";

const db = new PGlite();
const migration = await readFile(new URL("../supabase/migrations/202610220001_members.sql", import.meta.url), "utf8");
await db.exec(`
  create role anon; create role authenticated; create role service_role bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
  create function auth.uid() returns uuid language sql as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to authenticated;
`);
await db.exec(migration);
const alice = "00000000-0000-4000-8000-000000000001";
const bob = "00000000-0000-4000-8000-000000000002";
async function user(id, username, email = "member@example.test") {
  await db.query("insert into auth.users values ($1, $2, $3)", [id, email,
    JSON.stringify({ username, first_name: "Тэмүүлэн", last_name: "Бат", role: "admin" })]);
}
async function asRole(role, id, sql) {
  await db.exec("begin");
  try {
    await db.exec(`set local role ${role}`);
    await db.query("select set_config('request.jwt.claim.sub', $1, true)", [id || ""]);
    return await db.query(sql);
  } finally { await db.exec("rollback"); }
}
try {
  await user(alice, "  Maker_One  ", "alice@example.test");
  await user(bob, "БҮТЭЭГЧ", "bob@example.test");
  assert.equal((await db.query("select username from public.profiles where id=$1", [alice])).rows[0].username, "maker_one");
  assert.equal((await db.query("select username from public.profiles where id=$1", [bob])).rows[0].username, "бүтээгч");
  await assert.rejects(user("00000000-0000-4000-8000-000000000003", "MAKER_ONE"));
  await assert.rejects(user("00000000-0000-4000-8000-000000000004", "bad name"));
  assert.equal((await db.query("select count(*)::int as n from auth.users")).rows[0].n, 2, "failed signup rolls back auth user");
  assert.deepEqual((await asRole("authenticated", alice, "select id from public.profiles")).rows.map(row => row.id), [alice]);
  assert.deepEqual((await asRole("authenticated", bob, "select id from public.profiles")).rows.map(row => row.id), [bob]);
  await assert.rejects(asRole("anon", null, "select * from public.profiles"), /permission denied/);
  await assert.rejects(asRole("authenticated", alice, "update public.profiles set username='taken'"), /permission denied/);
  await assert.rejects(asRole("anon", null, "select public.member_login_email('maker_one')"), /permission denied/);
  await assert.rejects(asRole("authenticated", alice, "select public.member_login_email('maker_one')"), /permission denied/);
  await assert.rejects(asRole("anon", null, "select public.consume_member_login_limit('global',300,60)"), /permission denied/);
  assert.equal((await asRole("service_role", null, "select public.member_login_email('MAKER_ONE') as email")).rows[0].email, "alice@example.test");
  assert.equal((await db.query("select count(*)::int as n from information_schema.columns where table_schema='public' and table_name='profiles' and column_name in ('role','password','email')")).rows[0].n, 0);
  console.log("PASS PostgreSQL migration: canonical/unique Unicode usernames, atomic signup, private profiles, restricted email lookup and permissions");

  const source = await readFile(new URL("../supabase/functions/username-login/index.ts", import.meta.url), "utf8");
  const code = ts.transpileModule(source.replace(/^import[^\r\n]*\r?\n/, ""), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  let handler;
  let failDatabase = false;
  let captchaRequired = false;
  const authCalls = [];
  vm.runInNewContext(code, {
    exports: {}, Request, Response, TextEncoder, TextDecoder, Uint8Array, crypto: webcrypto,
    Deno: { env: { get: key => ({ SUPABASE_URL: "https://test.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "test-service-key", SUPABASE_ANON_KEY: "test-anon-key" })[key] }, serve: callback => { handler = callback; } },
    createClient: (_url, key) => key === "test-service-key" ? {
      rpc: async (name, args) => {
        if (failDatabase) return { error: new Error("database down") };
        const { rows } = name === "member_login_email" ?
          await db.query("select public.member_login_email($1) as value", [args.login_username]) :
          await db.query("select public.consume_member_login_limit($1,$2,$3) as value", [args.bucket, args.max_attempts, args.window_seconds]);
        return { data: rows[0].value, error: null };
      },
    } : { auth: { signInWithPassword: async input => {
      authCalls.push(input);
      if (captchaRequired && input.options?.captchaToken !== "fixture-valid-token") return {
        data: { session: null }, error: { status: 400, code: "captcha_failed" },
      };
      if (input.email === "alice@example.test" && input.password === "Test-only-password!1") return {
        data: { session: { access_token: "test-access", refresh_token: "test-refresh" } }, error: null,
      };
      return { data: { session: null }, error: { status: 400 } };
    } } },
  });
  const request = (body, overrides = {}) => new Request("https://test.supabase.co/functions/v1/username-login", {
    method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json", "x-forwarded-for": "192.0.2.1", ...overrides.headers },
    body: JSON.stringify(body), ...overrides,
  });
  let response = await handler(request({ username: "MAKER_ONE", password: "Test-only-password!1" }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { access_token: "test-access", refresh_token: "test-refresh" });
  assert.equal(response.headers.get("cache-control"), "no-store");
  response = await handler(request({ username: "missing", password: "Test-only-password!1" }));
  assert.equal(response.status, 400);
  assert.equal(authCalls.at(-1).email, "unknown-member@invalid.example", "unknown usernames still take Auth verification path");
  const unknownError = await response.text();
  response = await handler(request({ username: "maker_one", password: "Wrong-password!" }));
  assert.equal(await response.text(), unknownError, "generic error does not expose account existence");
  assert.equal((await handler(request({ username: "x", password: "short" }))).status, 400);
  assert.equal((await handler(request({ username: "maker_one", password: "x".repeat(5000) }))).status, 400);
  assert.equal((await handler(new Request("https://test.supabase.co", { method: "OPTIONS", headers: { origin: "http://localhost:3000" } }))).status, 204);
  assert.equal((await handler(new Request("https://test.supabase.co", { headers: { origin: "https://attacker.example" } }))).status, 403);
  assert.equal((await handler(new Request("https://test.supabase.co"))).status, 405);
  failDatabase = true;
  assert.equal((await handler(request({ username: "maker_one", password: "Test-only-password!1" }))).status, 503, "database errors fail closed");
  failDatabase = false;
  await db.exec("truncate private.member_login_limits");
  captchaRequired = true;
  response = await handler(request({ username: "maker_one", password: "Test-only-password!1" }));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "captcha_failed", "missing CAPTCHA must not create a session");
  response = await handler(request({ username: "missing", password: "Test-only-password!1", captchaToken: "bad-token" }));
  assert.equal((await response.json()).error, "captcha_failed", "CAPTCHA error must not reveal account existence");
  response = await handler(request({ username: "maker_one", password: "Test-only-password!1", captchaToken: "fixture-valid-token" }));
  assert.equal(response.status, 200);
  assert.equal(authCalls.at(-1).options.captchaToken, "fixture-valid-token", "Auth must receive the browser token");
  const beforeMalformed = authCalls.length;
  for (const captchaToken of [null, {}, "", "x".repeat(2049)]) {
    assert.equal((await handler(request({ username: "maker_one", password: "Test-only-password!1", captchaToken }))).status, 400);
  }
  assert.equal(authCalls.length, beforeMalformed, "malformed CAPTCHA tokens must be rejected before Auth");
  captchaRequired = false;
  await db.exec("truncate private.member_login_limits");
  for (let index = 0; index < 10; index++) assert.equal((await handler(request({ username: "maker_one", password: "Wrong-password!" }))).status, 400);
  response = await handler(request({ username: "maker_one", password: "Test-only-password!1" }, { headers: { origin: "http://localhost:3000", "content-type": "application/json", "x-forwarded-for": "192.0.2.99" } }));
  assert.equal(response.status, 429, "IP spoofing does not bypass username limit");
  assert.equal(response.headers.get("retry-after"), "900");
  console.log("PASS username login handler: password verification, session tokens, generic errors, CORS, request limits and fail-closed behavior");
} finally { await db.close(); }

const browserSource = await readFile(new URL("../lib/supabase.ts", import.meta.url), "utf8");
const browserCode = ts.transpileModule(browserSource.replace(/^import[^\r\n]*\r?\n/gm, ""), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
function browserModule(enabled, status = 200, errorCode = "generic") {
  const calls = [];
  const sessions = [];
  const recoveryRequests = [];
  const exported = {};
  vm.runInNewContext(browserCode, {
    exports: exported, AbortSignal, URL, trackRecoverySession: () => {},
    window: { location: { origin: "http://localhost:3000" } },
    process: { env: { NEXT_PUBLIC_MEMBERSHIP_ENABLED: enabled ? "true" : "false",
      NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-public-key" } },
    createClient: () => ({ auth: {
      onAuthStateChange: () => {},
      resetPasswordForEmail: async (email, options) => { recoveryRequests.push({ email, options }); return { error: status === 200 ? null : { status, code: errorCode } }; },
      setSession: async value => { sessions.push(value); return { error: null }; },
    } }),
    fetch: async (url, options) => {
      calls.push({ url, ...options });
      return new Response(JSON.stringify(status === 200 ? { access_token: "test-access", refresh_token: "test-refresh" } : { error: errorCode }), { status });
    },
  });
  return { api: exported, calls, sessions, recoveryRequests };
}
const disabled = browserModule(false);
assert.equal(disabled.api.getSupabase(), null);
await assert.rejects(disabled.api.loginWithUsername("maker_one", "Test-only-password!1"), /not_configured/);
assert.equal(disabled.calls.length, 0);
const enabled = browserModule(true);
await enabled.api.loginWithUsername(" MAKER_ONE ", "Test-only-password!1");
assert.equal(enabled.calls[0].url, "https://test.supabase.co/functions/v1/username-login");
assert.equal(enabled.calls[0].headers.apikey, "test-public-key");
assert.equal(enabled.calls[0].cache, "no-store");
assert.deepEqual(JSON.parse(enabled.calls[0].body), { username: "maker_one", password: "Test-only-password!1" });
assert.equal(enabled.sessions[0].access_token, "test-access");
for (const [status, message] of [[400, "invalid_login"], [429, "rate_limited"], [404, "unavailable"], [503, "unavailable"]]) {
  const test = browserModule(true, status);
  await assert.rejects(test.api.loginWithUsername("maker_one", "Wrong-password!"), new RegExp(message));
  assert.equal(test.sessions.length, 0);
}
console.log("PASS browser adapter: setup gate, canonical usernames, credential destination, SDK session handling and error mapping");
const captchaLogin = browserModule(true);
await captchaLogin.api.loginWithUsername("maker_one", "Test-only-password!1", "fixture-valid-token");
assert.equal(JSON.parse(captchaLogin.calls[0].body).captchaToken, "fixture-valid-token");
const failedCaptcha = browserModule(true, 400, "captcha_failed");
await assert.rejects(failedCaptcha.api.loginWithUsername("maker_one", "Test-only-password!1", "expired"), /captcha_failed/);
assert.equal(failedCaptcha.sessions.length, 0);

await enabled.api.requestPasswordReset(" maker@example.test ", "en");
await enabled.api.requestPasswordReset("maker@example.test", "mn");
assert.equal(enabled.recoveryRequests[0].email, "maker@example.test");
assert.equal(enabled.recoveryRequests[0].options.redirectTo, "http://localhost:3000/en/reset-password");
assert.equal(enabled.recoveryRequests[1].options.redirectTo, "http://localhost:3000/reset-password");
await enabled.api.requestPasswordReset("maker@example.test", "mn", "fixture-reset-token");
assert.equal(enabled.recoveryRequests[2].options.captchaToken, "fixture-reset-token");
await assert.rejects(failedCaptcha.api.requestPasswordReset("maker@example.test", "mn", "expired"), /captcha_failed/);
console.log("PASS CAPTCHA: bounded tokens, login proxy forwarding, Auth rejection without a session, and recovery token forwarding");
await assert.rejects(disabled.api.requestPasswordReset("maker@example.test", "en"), /not_configured/);
await assert.rejects(browserModule(true, 429).api.requestPasswordReset("maker@example.test", "en"), /rate_limited/);

const recoverySource = await readFile(new URL("../lib/password-recovery.ts", import.meta.url), "utf8");
const recoveryCode = ts.transpileModule(recoverySource, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const recovery = {};
const storage = new Map();
let clock = Date.now();
vm.runInNewContext(recoveryCode, {
  exports: recovery, atob,
  Date: class extends Date { static now() { return clock; } },
  sessionStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
});
const recoveryToken = `test.${Buffer.from(JSON.stringify({ session_id: "test-recovery-session" })).toString("base64url")}.test`;
let session = { user: { id: alice }, access_token: recoveryToken };
let verifiedUser = session.user;
let updateError = null;
const updates = [], signouts = [];
const recoveryClient = { auth: {
  getSession: async () => ({ data: { session }, error: null }),
  getUser: async () => ({ data: { user: verifiedUser }, error: null }),
  updateUser: async args => { updates.push(args); return { error: updateError }; },
  signOut: async args => { signouts.push(args); return { error: null }; },
} };
assert.equal(await recovery.canResetPassword(recoveryClient), false, "regular session must not open recovery form");
await assert.rejects(recovery.updateRecoveredPassword(recoveryClient, "Test-only-password!2"), /recovery_expired/);
assert.equal(updates.length, 0);
recovery.trackRecoverySession("PASSWORD_RECOVERY", session);
assert.equal(await recovery.canResetPassword(recoveryClient), true);
recovery.trackRecoverySession("SIGNED_IN", session);
assert.equal(await recovery.canResetPassword(recoveryClient), true, "restoring the same recovery session must survive reload");
verifiedUser = { id: bob };
assert.equal(await recovery.canResetPassword(recoveryClient), false, "server-verified identity must match");
verifiedUser = session.user;
clock += 31 * 60 * 1000;
assert.equal(await recovery.canResetPassword(recoveryClient), false, "expired marker must fail");
recovery.trackRecoverySession("PASSWORD_RECOVERY", session);
updateError = { code: "same_password" };
await assert.rejects(recovery.updateRecoveredPassword(recoveryClient, "Test-only-password!2"), /same_password/);
assert.equal(signouts.length, 0);
updateError = null;
await recovery.updateRecoveredPassword(recoveryClient, "Test-only-password!2");
assert.equal(signouts[0].scope, "global");
assert.equal(storage.size, 0);
assert.equal(await recovery.canResetPassword(recoveryClient), false, "recovery UI must clear after successful update");
recovery.trackRecoverySession("PASSWORD_RECOVERY", session);
recovery.trackRecoverySession("SIGNED_IN", { ...session, access_token: `test.${Buffer.from(JSON.stringify({ session_id: "different-sign-in" })).toString("base64url")}.test` });
assert.equal(await recovery.canResetPassword(recoveryClient), false, "ordinary sign-in clears recovery state");
console.log("PASS password recovery: localized email redirects, valid recovery session, server verification, expiry, password update and sign-out");
