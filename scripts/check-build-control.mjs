import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
const source = await readFile(new URL('../supabase/functions/trigger-build/index.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source.replace(/^import[^\r\n]*\r?\n/, ''), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
function fixture(overrides = {}) {
  const settings = { role: 'superadmin', user: true, authError: false, roleError: false, allowed: true, limitError: false, token: 'server-only-token', githubOk: true, dispatchOk: true, runs: [], ...overrides };
  let handler; const calls = [], limits = [], authCalls = [];
  vm.runInNewContext(code, { exports: {}, Request, Response, AbortSignal,
    Deno: { env: { get: key => ({ SUPABASE_URL: 'https://fixture.supabase.co', SUPABASE_ANON_KEY: 'public-key', SUPABASE_SERVICE_ROLE_KEY: 'service-key', GITHUB_ACTIONS_TOKEN: settings.token })[key] }, serve: fn => { handler = fn; } },
    createClient: (_url, key, options) => key === 'service-key' ? {
      rpc: async (name, args) => { limits.push({ name, args }); return { data: settings.allowed, error: settings.limitError ? {} : null }; },
    } : {
      auth: { getUser: async token => { authCalls.push({ token, authorization: options.global.headers.Authorization }); return { data: { user: settings.user && token === 'valid-session' ? { id: 'verified-user' } : null }, error: settings.authError ? {} : null }; } },
      rpc: async () => ({ data: settings.role, error: settings.roleError ? {} : null }),
    },
    fetch: async (url, options) => { calls.push({ url, options });
      if (url.endsWith('/dispatches')) return new Response(settings.dispatchOk ? null : 'private provider context', { status: settings.dispatchOk ? 204 : 403 });
      return new Response(JSON.stringify({ workflow_runs: settings.runs }), { status: settings.githubOk ? 200 : 403 });
    },
  });
  return { calls, limits, authCalls, request: (method = 'POST', auth = 'valid-session', origin = 'https://innolab.mn') => handler(new Request('https://fixture/trigger-build', {
    method, headers: { ...(auth ? { Authorization: 'Bearer ' + auth } : {}), Origin: origin, ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}) },
    ...(method === 'POST' ? { body: JSON.stringify({ role: 'superadmin', ref: 'malicious-branch', repository: 'other/repo' }) } : {}),
  })) };
}
for (const role of ['member', 'admin']) { const f = fixture({ role }); assert.equal((await f.request()).status, 403); assert.equal(f.calls.length, 0); }
for (const auth of [null, 'expired-session']) { const f = fixture(); assert.equal((await f.request('POST', auth)).status, 401); assert.equal(f.calls.length, 0); }
for (const condition of [{ authError: true }, { roleError: true }, { token: '' }]) { const f = fixture(condition); assert.ok([401, 503].includes((await f.request()).status)); assert.equal(f.calls.length, 0); }
const origin = fixture(); assert.equal((await origin.request('POST', 'valid-session', 'https://untrusted.example')).status, 403); assert.equal(origin.calls.length, 0);
const options = fixture(); assert.equal((await options.request('OPTIONS', null)).status, 204); assert.equal(options.calls.length, 0);
const method = fixture(); assert.equal((await method.request('DELETE')).status, 405);
const rate = fixture({ allowed: false }); assert.equal((await rate.request()).status, 429); assert.equal(rate.calls.length, 1);
const limit = fixture({ limitError: true }); assert.equal((await limit.request()).status, 503); assert.equal(limit.calls.length, 1);
const active = fixture({ runs: [{ id: 1, status: 'in_progress', html_url: 'https://github.com/innolab-mn/innolab-mn.github.io/actions/runs/1' }] }); assert.equal((await active.request()).status, 409); assert.equal(active.calls.length, 1); assert.equal(active.limits.length, 0);
const status = fixture({ runs: [{ id: 2, status: 'completed', conclusion: 'success', html_url: 'https://untrusted.example' }] }); const info = await (await status.request('GET')).json(); assert.equal(info.run.url, 'https://github.com/innolab-mn/innolab-mn.github.io/actions/workflows/nextjs.yml'); assert.equal(status.limits.length, 0);
assert.equal(JSON.stringify(info).includes('server-only-token'), false);
const failure = fixture({ dispatchOk: false }); const error = await failure.request(); assert.equal(error.status, 502); assert.deepEqual(await error.json(), { error: 'github_unavailable' });
const success = fixture(); const queued = await success.request(); assert.equal(queued.status, 202); assert.equal(queued.headers.get('cache-control'), 'no-store'); assert.equal((await queued.json()).status, 'queued');
assert.equal(success.calls[1].options.body, '{"ref":"main"}'); assert.equal(success.calls[1].url, 'https://api.github.com/repos/innolab-mn/innolab-mn.github.io/actions/workflows/nextjs.yml/dispatches');
assert.equal(success.authCalls[0].authorization, 'Bearer valid-session'); assert.equal(success.limits[0].args.bucket, 'build:global');
console.log('PASS build control: verified sessions, current superadmin role, fixed destination, CORS, secret isolation, shared limit, active-run guard, 204 dispatch, sanitized errors/status.');
