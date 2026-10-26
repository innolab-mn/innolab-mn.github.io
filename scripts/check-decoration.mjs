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
function render(event) {
  const art = {};
  vm.runInNewContext(halloweenCode, { exports: art, require });
  const entry = {};
  vm.runInNewContext(indexCode, {
    exports: entry, process: { env: { EVENT_DECORATION: event } },
    require: name => name === './halloween' ? art : name.endsWith('.css') ? {} : require(name),
  });
  return renderToStaticMarkup(createElement(entry.default));
}
for (const value of [undefined, '', '  ', 'unknown', '__proto__', 'constructor']) {
  assert.equal(render(value), '', `No decoration for ${String(value)}`);
}
for (const value of ['halloween', ' HALLOWEEN ']) {
  const html = render(value);
  assert.ok(html.includes('data-event-decoration="halloween"'));
  assert.ok(html.includes('aria-hidden="true"'));
  assert.ok(html.includes('halloween-pumpkin'));
  assert.ok(!/<(script|button|a|input)\b/i.test(html), 'Artwork has no scripts or interactive elements');
}
console.log('PASS static decoration: Halloween server rendering, blank/unknown values render nothing, explicit registry, no interactive artwork.');
