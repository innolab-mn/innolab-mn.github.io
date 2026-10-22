// Preview the small, deliberately limited Go-template subset used by our email
// files. Supabase performs the actual Go rendering when sending an email.
export function renderEmailTemplate(source, { redirectTo = "", confirmationUrl = "", siteUrl = "", locale = "mn", token = "12345678" }) {
  const rendered = source.replace(/\{\{\s*if\s+([^{}\n]+?)\s*\}\}([\s\S]*?)\{\{\s*else\s*\}\}([\s\S]*?)\{\{\s*end\s*\}\}/g,
    (_match, condition, english, mongolian) => {
      let isEnglish;
      if (condition.trim() === 'eq .Data.locale "en"') isEnglish = locale === "en";
      else if (condition.startsWith("or ")) {
        const value = condition.slice(3).trim();
        const cases = [...value.matchAll(/\(eq \.RedirectTo "([^"]+)"\)/g)];
        if (!cases.length || cases.map(item => item[0]).join(" ") !== value) throw new Error("Unsupported email preview condition");
        isEnglish = cases.some(item => item[1] === redirectTo);
      } else if (condition.startsWith("eq .RedirectTo ")) {
        const value = condition.slice("eq .RedirectTo ".length).trim();
        const cases = [...value.matchAll(/"([^"]+)"/g)];
        if (!cases.length || cases.map(item => item[0]).join(" ") !== value) throw new Error("Unsupported email preview equality");
        isEnglish = cases.some(item => item[1] === redirectTo);
      } else throw new Error("Unsupported email preview condition");
      return isEnglish ? english : mongolian;
    });
  const escape = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const result = rendered.replaceAll("{{ .ConfirmationURL }}", escape(confirmationUrl)).replaceAll("{{ .SiteURL }}", escape(siteUrl)).replaceAll("{{ .Token }}", escape(token));
  if (result.includes("{{")) throw new Error("Unresolved email template expression");
  return result;
}
