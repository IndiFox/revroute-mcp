import { maskSecret } from "../client/auth.js";

const SECRET_HEADERS = new Set(["authorization", "x-api-key", "cookie", "set-cookie"]);

export interface Logger {
  debug: (msg: string, data?: Record<string, unknown>) => void;
  info: (msg: string, data?: Record<string, unknown>) => void;
  warn: (msg: string, data?: Record<string, unknown>) => void;
  error: (msg: string, data?: Record<string, unknown>) => void;
}

const formatLine = (level: string, msg: string, data?: Record<string, unknown>): string => {
  const timestamp = new Date().toISOString();
  if (!data || Object.keys(data).length === 0) {
    return `[${timestamp}] ${level} ${msg}`;
  }
  return `[${timestamp}] ${level} ${msg} ${JSON.stringify(data)}`;
};

export function createLogger(opts: { debug: boolean }): Logger {
  const write = (level: string, msg: string, data?: Record<string, unknown>) => {
    process.stderr.write(`${formatLine(level, msg, data)}\n`);
  };
  return {
    debug: (msg, data) => {
      if (opts.debug) write("DEBUG", msg, data);
    },
    info: (msg, data) => write("INFO ", msg, data),
    warn: (msg, data) => write("WARN ", msg, data),
    error: (msg, data) => write("ERROR", msg, data),
  };
}

export function scrubHeaders(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    const key = k.toLowerCase();
    if (SECRET_HEADERS.has(key)) {
      const bearer = v.match(/^Bearer\s+(.+)$/i);
      out[k] = bearer ? `Bearer ${maskSecret(bearer[1] ?? "")}` : "***";
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function truncate(text: string, maxBytes = 2048): string {
  if (text.length <= maxBytes) return text;
  return `${text.slice(0, maxBytes)}…[truncated ${text.length - maxBytes} chars]`;
}
