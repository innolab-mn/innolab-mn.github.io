import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

const require = createRequire(import.meta.url);
const compile = source => ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const halloweenCode = compile(await readFile(new URL('../decoration/halloween.tsx', import.meta.url), 'utf8'));
const indexCode = compile(await readFile(new URL('../decoration/index.tsx', import.meta.url), 'utf8'));
function render(event, locale = 'mn') {
  const art = {};
  vm.runInNewContext(halloweenCode, { exports: art, require });
  const entry = {};
  vm.runInNewContext(indexCode, {
    exports: entry, process: { env: { EVENT_DECORATION: event } },
    require: name => name === './halloween' ? art : name.endsWith('.css') ? {} : require(name),
  });
  return renderToStaticMarkup(createElement(entry.default, { locale }));
}
for (const value of [undefined, '', '  ', 'unknown', '__proto__', 'constructor']) {
  assert.equal(render(value), '', `No decoration for ${String(value)}`);
}
for (const value of ['halloween', ' HALLOWEEN ']) {
  const html = render(value);
  assert.ok(html.includes('data-event-decoration="halloween"'));
  assert.ok(html.includes('aria-hidden="true"'));
  assert.ok(html.includes('halloween-pumpkin'));
  assert.equal((html.match(/<input\b/g) || []).length, 1, 'One native motion pause control');
  assert.match(html, /type="checkbox"[^>]*id="decoration-motion-toggle"[^>]*aria-label="Чимэглэлийн хөдөлгөөнийг түр зогсоох"/);
  assert.match(html, /<label[^>]*for="decoration-motion-toggle"/);
  assert.ok(!/^<div[^>]*aria-hidden/.test(html), 'Pause control is accessible');
  assert.ok([...html.matchAll(/<svg\b[^>]*>/g)].every(([svg]) => svg.includes('aria-hidden="true"')), 'Artwork itself is decorative');
  assert.ok(!/<(script|a|button)\b/i.test(html), 'No scripts, links or click-only pumpkin');
}
assert.match(render('halloween', 'en'), /aria-label="Pause decoration animations"/);
console.log('PASS static decoration: empty/unknown values, explicit registry, server-rendered artwork and localized native animation pause control.');
