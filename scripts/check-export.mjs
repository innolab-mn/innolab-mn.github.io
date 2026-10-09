import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve("out");
if (!existsSync(root))
  throw new Error("Run npm run build before checking the static export.");
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory()
      ? walk(file)
      : file.endsWith(".html")
        ? [file]
        : [];
  });
}
const pages = new Map(
  walk(root).map((file) => [file, readFileSync(file, "utf8")]),
);
const errors = [];
let checkedLinks = 0;
for (const [file, html] of pages) {
  const route =
    "/" +
    path
      .relative(root, file)
      .replaceAll(path.sep, "/")
      .replace(/(?:index)?\.html$/, "");
  if ((html.match(/<h1[\s>]/g) || []).length !== 1)
    errors.push(`${route}: expected one h1`);
  if (!html.includes('lang="mn"'))
    errors.push(`${route}: missing Mongolian language`);
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="/.test(match[0]))
      errors.push(`${route}: image missing alt attribute`);
  }
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)) {
    const href = match[1].replaceAll("&amp;", "&");
    if (!href.startsWith("/") && !href.startsWith("#")) continue;
    if (href.startsWith("//")) continue;
    checkedLinks++;
    const url = new URL(href, `https://preview.local${route}`);
    const requested = path.join(root, decodeURIComponent(url.pathname));
    const target = [
      requested,
      requested + ".html",
      path.join(requested, "index.html"),
    ].find((candidate) => pages.has(candidate));
    if (!target) {
      errors.push(`${route}: missing target ${href}`);
      continue;
    }
    if (
      url.hash &&
      !pages
        .get(target)
        .includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)
    )
      errors.push(`${route}: missing anchor ${href}`);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Passed: ${pages.size} HTML pages, ${checkedLinks} internal links, heading and image-alt checks.`,
  );
