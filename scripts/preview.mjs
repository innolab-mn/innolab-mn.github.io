import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

// Serve the static export with the same extensionless URLs as GitHub Pages.
const root = path.resolve("out");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".txt": "text/plain",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};
http
  .createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      const candidate = path.resolve(root, "." + pathname);
      if (candidate !== root && !candidate.startsWith(root + path.sep)) {
        response.writeHead(403).end();
        return;
      }
      for (const file of [
        candidate,
        candidate + ".html",
        path.join(candidate, "index.html"),
      ]) {
        if (
          await stat(file)
            .then((info) => info.isFile())
            .catch(() => false)
        ) {
          response.writeHead(200, {
            "Content-Type":
              types[path.extname(file)] || "application/octet-stream",
          });
          response.end(
            request.method === "HEAD" ? undefined : await readFile(file),
          );
          return;
        }
      }
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      response.end(await readFile(path.join(root, "404.html")));
    } catch {
      response.writeHead(500).end("Unable to serve the static export.");
    }
  })
  .listen(3000, "127.0.0.1", () =>
    console.log("InnoLab preview: http://localhost:3000"),
  );
