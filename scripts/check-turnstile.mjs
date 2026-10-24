import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../lib/turnstile.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
function fixture(env = {}) {
  const api = {}, scripts = [], timers = new Map();
  const window = {};
  vm.runInNewContext(code, {
    exports: api, window, process: { env },
    document: {
      createElement: () => ({ remove() { this.removed = true; } }),
      head: { appendChild(script) { scripts.push(script); } },
    },
    setTimeout(callback) { const id = timers.size + 1; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  return { api, window, scripts, timers };
}
const test = fixture();
assert.equal(test.api.turnstileSiteKey, "", "unconfigured production must not silently use a test key");
const configured = { NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'public-widget-key' };
assert.equal(fixture(configured).api.turnstileSiteKey, 'public-widget-key', 'missing flag preserves existing deployments');
assert.equal(fixture({...configured, NEXT_PUBLIC_CAPTCHA_ENABLED:'true'}).api.turnstileSiteKey, 'public-widget-key');
assert.equal(fixture({...configured, NEXT_PUBLIC_CAPTCHA_ENABLED:'false'}).api.turnstileSiteKey, '', 'disabled CAPTCHA has no effective key for any Auth form');
assert.equal(fixture({...configured, NEXT_PUBLIC_CAPTCHA_ENABLED:' FALSE '}).api.turnstileSiteKey, '');
assert.equal(fixture({NEXT_PUBLIC_CAPTCHA_ENABLED:'true'}).api.turnstileSiteKey, '', 'enabling without a key cannot load a widget');
const first = test.api.loadTurnstile();
assert.equal(test.api.loadTurnstile(), first, "concurrent mounts must share one script");
assert.equal(test.scripts.length, 1);
assert.equal(test.scripts[0].src, "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit");
const firstFailure = assert.rejects(first, /captcha_unavailable/);
test.scripts[0].onerror();
await firstFailure;
assert.equal(test.scripts[0].removed, true);
const retry = test.api.loadTurnstile();
const provider = { ready: () => { throw new Error("ready() is invalid for an async/defer script"); } };
test.window.turnstile = provider;
test.scripts[1].onload();
assert.equal(await retry, provider);
assert.equal(await test.api.loadTurnstile(), provider);
assert.equal(test.scripts.length, 2, "a ready API must not reload on route navigation");
assert.equal(test.timers.size, 0);
const timeout = fixture();
const pending = timeout.api.loadTurnstile();
const timeoutFailure = assert.rejects(pending, /captcha_unavailable/);
[...timeout.timers.values()][0]();
await timeoutFailure;
assert.equal(timeout.scripts[0].removed, true);
const restarted = timeout.api.loadTurnstile();
timeout.window.turnstile = provider;
timeout.scripts[1].onload();
assert.equal(await restarted, provider);
console.log("PASS Turnstile: enabled/disabled/unset configuration, single script, blocked-script retry, timeout recovery, ready API reuse, no fallback test key");
