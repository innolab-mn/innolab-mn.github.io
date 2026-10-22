import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderEmailTemplate } from "./email-template-tools.mjs";
import { messages } from "../supabase/templates/messages.mjs";

const root = new URL("../supabase/", import.meta.url);
const config = await readFile(new URL("config.toml", root), "utf8");
const origins = ["https://innolab.mn", "https://www.innolab.mn", "http://localhost:3000", "http://127.0.0.1:3000"];
let cases = 0;
for (const kind of ["confirmation", "recovery", ...messages.map(message => message.key)]) {
  const source = await readFile(new URL(`templates/${kind}.html`, root), "utf8");
  const subjectSource = await readFile(new URL(`templates/${kind}.subject.txt`, root), "utf8");
  assert.ok(subjectSource.length <= 255, "hosted subject fields allow at most 255 characters");
  if (["confirmation", "recovery"].includes(kind)) assert.ok(config.includes(`subject = '${subjectSource}'`), "local SMTP subject must match the reviewed subject file");
  assert.ok(source.includes('src="https://innolab.mn/android-chrome-192x192.png"'), "use the verified public PNG logo");
  assert.ok(!source.includes("<script") && !source.includes(".Data.first_name"), "no scripting or untrusted profile interpolation in emails");
  for (const origin of origins) for (const locale of ["en", "mn"]) {
    const page = kind === "recovery" ? "reset-password" : "members";
    const data = { redirectTo: `${origin}/${locale === "en" ? "en/" : ""}${page}`, locale, confirmationUrl: "https://example.test/verify?token=test-only&type=signup", siteUrl: "https://innolab.mn" };
    const html = renderEmailTemplate(source, data);
    const subject = renderEmailTemplate(subjectSource, data);
    assert.ok(html.includes(`<div lang="${locale}">`));
    assert.ok(!html.includes(`<div lang="${locale === "en" ? "mn" : "en"}">`), "send only the requested language");
    assert.equal(/[А-Яа-яӨөҮү]/u.test(subject), locale === "mn");
    const message = messages.find(message => message.key === kind);
    if (message?.token) {
      assert.ok(html.includes("123456") && !html.includes("example.test/verify"), "reauthentication sends a code, not an unsupported confirmation link");
    } else if (!message?.notification) assert.ok(html.includes('href="https://example.test/verify?token=test-only&amp;type=signup"'), "preserve the secure action URL and escape HTML");
    else assert.ok(!html.includes("example.test/verify"), "security notices must not invent verification links");
    assert.ok(html.includes("InnoLab") && html.includes("@media") && html.includes('role="presentation"'));
    cases++;
  }
  const fallback = renderEmailTemplate(source, { redirectTo: "", siteUrl: "https://innolab.mn" });
  assert.ok(fallback.includes('<div lang="mn">') && !fallback.includes('<div lang="en">'), "missing language defaults to Mongolian");
}
console.log(`PASS ${cases} email language/subject cases, secure action links, brand logo, and responsive email markup`);
