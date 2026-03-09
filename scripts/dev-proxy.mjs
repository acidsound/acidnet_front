import { createReadStream, existsSync, statSync } from "node:fs";
import { access } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const clientRoot = path.join(repoRoot, "src", "acidnet", "frontend", "client");

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 4173);
const apiOrigin = new URL(process.env.API_ORIGIN || "http://127.0.0.1:8765");

const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function sendText(res, status, text, contentType = "text/plain; charset=utf-8") {
  const body = Buffer.from(text, "utf8");
  res.writeHead(status, {
    "Content-Type": contentType,
    "Content-Length": body.length,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function resolveStaticPath(urlPathname) {
  const rawPath = decodeURIComponent(urlPathname === "/" ? "/index.html" : urlPathname);
  const normalized = path
    .normalize(rawPath)
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/^[/\\]+/, "");
  const candidate = path.join(clientRoot, normalized);
  if (!candidate.startsWith(clientRoot)) {
    return null;
  }
  return candidate;
}

async function serveStatic(req, res, pathname) {
  const filePath = resolveStaticPath(pathname);
  if (!filePath) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    await access(filePath);
  } catch {
    sendText(res, 404, "Not found");
    return;
  }

  let finalPath = filePath;
  try {
    if (statSync(filePath).isDirectory()) {
      finalPath = path.join(filePath, "index.html");
    }
  } catch {
    sendText(res, 404, "Not found");
    return;
  }

  if (!existsSync(finalPath)) {
    sendText(res, 404, "Not found");
    return;
  }

  const ext = path.extname(finalPath).toLowerCase();
  const contentType = MIME_TYPES.get(ext) || "application/octet-stream";
  const { size } = statSync(finalPath);
  res.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": size,
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=60",
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(finalPath).pipe(res);
}

function proxyApi(req, res) {
  const upstreamUrl = new URL(req.url, apiOrigin);
  const client = upstreamUrl.protocol === "https:" ? https : http;
  const headers = { ...req.headers, host: apiOrigin.host };

  const upstreamReq = client.request(
    upstreamUrl,
    {
      method: req.method,
      headers,
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    }
  );

  upstreamReq.on("error", (error) => {
    sendText(res, 502, `Proxy upstream failed: ${error.message}`);
  });

  req.pipe(upstreamReq);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname.startsWith("/api/")) {
    proxyApi(req, res);
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    sendText(res, 405, "Method not allowed");
    return;
  }

  await serveStatic(req, res, url.pathname);
});

server.on("clientError", (error, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  console.error("Client error:", error.message);
});

server.listen(port, host, async () => {
  const indexUrl = `http://${host}:${port}`;
  const clientPath = path.relative(repoRoot, clientRoot) || ".";
  console.log(`[acidnet_front] dev proxy listening on ${indexUrl}`);
  console.log(`[acidnet_front] static root: ${clientPath}`);
  console.log(`[acidnet_front] api origin: ${apiOrigin.origin}`);
  console.log("[acidnet_front] routing: same-origin static + /api/* proxy");
  console.log("[acidnet_front] Pinggy example: ssh -p 443 -R0:localhost:" + port + " a.pinggy.io");
});
