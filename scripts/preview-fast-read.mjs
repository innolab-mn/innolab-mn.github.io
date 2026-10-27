import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/fast_read/', import.meta.url));
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.gltf':'model/gltf+json', '.glb':'model/gltf-binary', '.bin':'application/octet-stream', '.ttf':'font/ttf', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp' };
const port = Number(process.env.FAST_READ_PORT || 4173);
http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const candidate = path.resolve(root, '.' + pathname);
    if (candidate !== path.resolve(root) && !candidate.startsWith(path.resolve(root) + path.sep)) { response.writeHead(403).end(); return; }
    if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405).end(); return; }
    const file = (await stat(candidate)).isDirectory() ? path.join(candidate, 'index.html') : candidate;
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`fast_read: http://localhost:${port}`));
