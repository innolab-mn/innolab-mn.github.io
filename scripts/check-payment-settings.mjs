import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
const source=await readFile(new URL('../lib/payment-settings.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
function fixture(env){const api={};vm.runInNewContext(code,{exports:api,process:{env}});return api;}
const env={NEXT_PUBLIC_SHOP_BANK_NAME:' Test Bank ',NEXT_PUBLIC_SHOP_BANK_ACCOUNT:' TEST-ACCOUNT ',NEXT_PUBLIC_SHOP_BANK_HOLDER:' Test Holder ',UNRELATED_SECRET:'must-never-leak'};
const api=fixture(env);
const details=await api.getPaymentDetails();
assert.deepEqual(JSON.parse(JSON.stringify(details)),{bank_name:'Test Bank',account_number:'TEST-ACCOUNT',account_name:'Test Holder'});
for(const key of ['NEXT_PUBLIC_SHOP_BANK_NAME','NEXT_PUBLIC_SHOP_BANK_ACCOUNT','NEXT_PUBLIC_SHOP_BANK_HOLDER']){const missing={...env};delete missing[key];await assert.rejects(fixture(missing).getPaymentDetails(),/payment_not_configured/);}
details.account_number='changed';assert.equal((await api.getPaymentDetails()).account_number,'TEST-ACCOUNT');
console.log('PASS static payment configuration: build environment only, whitespace handling, required fields, isolated values, no database or network dependency.');

for (const file of ['checkout.tsx', 'admin-dashboard.tsx']) {
  const source = await readFile(new URL('../app/_components/' + file, import.meta.url), 'utf8');
  assert.ok(source.includes('getPaymentDetails'), file + ' must use the static payment module');
  assert.ok(!source.includes('shop_payment_settings'), file + ' must not read bank details from the database');
  assert.ok(!source.includes('admin_save_bank'), file + ' must not write bank details to the database');
}
console.log('PASS checkout and admin: environment-only bank settings, no legacy database reads or writes.');
