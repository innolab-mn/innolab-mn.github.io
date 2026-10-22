import { readFile, writeFile } from "node:fs/promises";
import { messages } from "../supabase/templates/messages.mjs";

const root = new URL("../supabase/templates/", import.meta.url);
const approved = await readFile(new URL("confirmation.html", root), "utf8");
const branches = [...approved.matchAll(/<div lang="(en|mn)">([\s\S]*?)<\/div>\s*(?=\{\{ else|\{\{ end)/g)];
const shells = Object.fromEntries(branches.map(([, locale, body]) => [locale, body]));
const prefix = approved.slice(0, approved.indexOf("{{ if"));
const suffix = approved.slice(approved.lastIndexOf("{{ end }}") + "{{ end }}".length);
const origins = ["https://innolab.mn", "https://www.innolab.mn", "http://localhost:3000", "http://127.0.0.1:3000"];
const redirectCondition = "or " + origins.map(origin => `(eq .RedirectTo "${origin}/en/members")`).join(" ");
const escape = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
for (const message of messages) {
  const condition = message.mode === "metadata" ? 'eq .Data.locale "en"' : redirectCondition;
  const branch = locale => {
    const [subject, title, intro, button, panelTitle, panel] = message[locale];
    const shell = shells[locale];
    const headerEnd = shell.indexOf('<tr><td class="email-content"');
    const footerStart = shell.lastIndexOf('<tr><td class="email-footer"');
    const href = message.notification ? `{{ .SiteURL }}/${locale === "en" ? "en/" : ""}${message.reset ? "forgot-password" : "contact"}` : "{{ .ConfirmationURL }}";
    const action = message.token
      ? '<p style="padding:20px;margin:0;background:#f1f5eb;border:1px solid #d6e0d0;border-radius:5px;font-size:28px;letter-spacing:5px;text-align:center;font-weight:bold;color:#193d2d;">{{ .Token }}</p>'
      : `<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="background:#315d43;border-radius:5px;mso-padding-alt:18px;"><a href="${href}" style="display:block;padding:18px;color:#ffffff;font-size:15px;line-height:1.5;font-weight:bold;text-align:center;text-decoration:none;border-radius:5px;">${escape(button)} &rarr;</a></td></tr></table>`;
    const contact = message.reset ? `<p style="margin:22px 0 0;font-size:13px;line-height:1.8;"><a href="{{ .SiteURL }}/${locale === "en" ? "en/" : ""}contact" style="color:#315d43;">${locale === "en" ? "Contact InnoLab" : "InnoLab-тай холбоо барих"}</a></p>` : "";
    let header = shell.slice(0, headerEnd).replace(/(<div style="display:none;[^>]+>)[\s\S]*?(<\/div>)/, `$1${escape(intro)}$2`);
    return `<div lang="${locale}">${header}<tr><td class="email-content" style="padding:36px;background:#ffffff;">
<p style="margin:0 0 18px;font-size:11px;font-weight:bold;line-height:1.6;letter-spacing:1.5px;color:#456c4d;">INNOLAB / ${locale === "en" ? (message.notification ? "ACCOUNT SECURITY" : "MEMBERS") : (message.notification ? "БҮРТГЭЛИЙН АЮУЛГҮЙ БАЙДАЛ" : "ГИШҮҮД")}</p>
<h1 class="email-title" style="margin:0 0 22px;font-size:36px;line-height:1.2;font-weight:bold;letter-spacing:-1px;color:#193d2d;">${escape(title)}</h1>
<p style="margin:0 0 28px;font-size:16px;line-height:1.8;color:#42564a;">${escape(intro)}</p>
${action}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:30px;"><tr><td style="background:#f5f7f1;border-left:3px solid #b4cb89;padding:18px 20px;"><p style="margin:0 0 7px;font-size:12px;font-weight:bold;line-height:1.6;color:#315d43;">${escape(panelTitle)}</p><p style="margin:0;font-size:13px;line-height:1.85;color:#42564a;">${escape(panel)}</p></td></tr></table>${contact}
</td></tr>${shell.slice(footerStart)}</div>`;
  };
  const html = `${prefix}{{ if ${condition} }}\n${branch("en")}\n{{ else }}\n${branch("mn")}\n{{ end }}${suffix}`;
  const subjectCondition = message.mode === "metadata" ? 'eq .Data.locale "en"' : `eq .RedirectTo ${origins.map(origin => `"${origin}/en/members"`).join(" ")}`;
  let subject = `InnoLab — {{if ${subjectCondition}}}${message.en[0].replace(/^InnoLab — /, "")}{{else}}${message.mn[0].replace(/^InnoLab — /, "")}{{end}}${message.token ? " — {{ .Token }}" : ""}`;
  if (message.mode === "metadata") subject = subject.replace('{{if ', '{{ if ').replace('"en"}}', '"en" }}').replace('{{else}}', '{{ else }}').replace('{{end}}', '{{ end }}');
  if (subject.length > 255) throw new Error(`Subject exceeds dashboard limit: ${message.key}`);
  await writeFile(new URL(`${message.key}.html`, root), html);
  await writeFile(new URL(`${message.key}.subject.txt`, root), subject);
}
// Multi-argument eq preserves exact URL matching within the hosted subject limit.
for (const key of ["confirmation", "recovery"]) {
  const html = await readFile(new URL(`${key}.html`, root), "utf8");
  const source = await readFile(new URL(`${key}.subject.txt`, root), "utf8");
  const urls = [...html.matchAll(/eq \.RedirectTo "([^"]+)"/g)].map(match => match[1]);
  const [english, mongolian] = source.match(/}}(.*?){{\s*else\s*}}(.*?){{\s*end\s*}}/).slice(1);
  const condition = `eq .RedirectTo ${urls.map(url => `"${url}"`).join(" ")}`;
  const subject = `InnoLab — {{if ${condition}}}${english.replace(/^InnoLab — /, "")}{{else}}${mongolian.replace(/^InnoLab — /, "")}{{end}}`;
  if (!urls.length || subject.length > 255) throw new Error(`Invalid compact subject: ${key}`);
  await writeFile(new URL(`${key}.subject.txt`, root), subject);
}
const configUrl = new URL("../supabase/config.toml", import.meta.url);
let config = await readFile(configUrl, "utf8");
for (const key of ["confirmation", "recovery"]) {
  const subject = await readFile(new URL(`${key}.subject.txt`, root), "utf8");
  config = config.replace(new RegExp(`(\\[auth.email.template.${key}\\]\\r?\\n)subject = [^\\n]+`), `$1subject = '${subject}'`);
}
await writeFile(configUrl, config);
for (const message of messages) {
  const section = message.notification ? `auth.email.notification.${message.key.replace(/_notification$/, "")}` : `auth.email.template.${message.key}`;
  const subject = await readFile(new URL(`${message.key}.subject.txt`, root), "utf8");
  const block = `[${section}]\n${message.notification ? "enabled = false\n" : ""}subject = ${JSON.stringify(subject)}\ncontent_path = "./supabase/templates/${message.key}.html"\n`;
  const start = config.indexOf(`[${section}]`);
  if (start < 0) config += "\n" + block;
  else { const next = config.indexOf("\n[", start + 1); config = config.slice(0, start) + block + (next < 0 ? "" : config.slice(next)); }
}
await writeFile(configUrl, config);
console.log(`Generated ${messages.length} additional InnoLab email templates; Mongolian is the fallback.`);
