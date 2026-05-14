import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { createServer as createMcpServer } from "../server.js";
import type { ResolvedConfig } from "../config.js";

interface SessionEntry {
  transport: StreamableHTTPServerTransport;
  apiKey: string;
  lastTouched: number;
}

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min idle

export async function runHttp(config: ResolvedConfig): Promise<void> {
  const sessions = new Map<string, SessionEntry>();

  // Purge idle sessions every minute.
  const sweeper = setInterval(() => {
    const cutoff = Date.now() - SESSION_TTL_MS;
    for (const [id, entry] of sessions) {
      if (entry.lastTouched < cutoff) {
        entry.transport.close().catch(() => {});
        sessions.delete(id);
      }
    }
  }, 60_000);
  sweeper.unref?.();

  const httpServer = createHttpServer(async (req, res) => {
    try {
      await handleRequest(req, res, sessions, config);
    } catch (err) {
      writeError(res, 500, err instanceof Error ? err.message : "Internal error");
    }
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(config.http.port, config.http.host, () => resolve());
  });

  process.stderr.write(
    `[revroute-mcp] HTTP transport listening on http://${config.http.host}:${config.http.port}\n`,
  );
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  sessions: Map<string, SessionEntry>,
  config: ResolvedConfig,
): Promise<void> {
  // CORS preflight & headers
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin, config.http.corsOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else if (config.http.corsOrigin === "*") {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, mcp-session-id",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Authentication — the API key for revroute is supplied per request via Authorization header.
  const apiKey = extractBearer(req.headers.authorization);
  const sessionId = (req.headers["mcp-session-id"] as string | undefined)?.trim();

  if (!sessionId && req.method === "POST") {
    // New session: must include API key (used by all subsequent tool calls).
    if (!apiKey) {
      writeError(res, 401, "Missing Authorization: Bearer <revroute_api_key> header.");
      return;
    }
    await initSession(req, res, sessions, config, apiKey);
    return;
  }

  if (!sessionId) {
    writeError(res, 400, "Missing mcp-session-id header.");
    return;
  }

  const entry = sessions.get(sessionId);
  if (!entry) {
    writeError(res, 404, "Unknown session.");
    return;
  }
  entry.lastTouched = Date.now();

  // Each subsequent request may also override the API key per-call.
  if (apiKey) entry.apiKey = apiKey;

  await entry.transport.handleRequest(req, res);
}

async function initSession(
  req: IncomingMessage,
  res: ServerResponse,
  sessions: Map<string, SessionEntry>,
  config: ResolvedConfig,
  apiKey: string,
): Promise<void> {
  const sessionId = randomUUID();
  const entry: SessionEntry = {
    transport: new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId,
    }),
    apiKey,
    lastTouched: Date.now(),
  };

  const { server } = createMcpServer(config, () => entry.apiKey);
  await server.connect(entry.transport);
  sessions.set(sessionId, entry);

  entry.transport.onclose = () => {
    sessions.delete(sessionId);
  };

  await entry.transport.handleRequest(req, res);
}

function extractBearer(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  const header = Array.isArray(value) ? value[0] : value;
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim();
}

function isOriginAllowed(origin: string, allowed: string): boolean {
  if (allowed === "*") return true;
  return allowed.split(",").map((s) => s.trim()).includes(origin);
}

function writeError(res: ServerResponse, status: number, message: string): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: { code: status, message } }));
}
