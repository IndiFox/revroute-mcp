import { type Logger, scrubHeaders, truncate } from "../util/logger.js";
import { RevrouteApiError, type RevrouteErrorBody } from "./errors.js";

export interface RevrouteClientOptions {
  apiKey?: string;
  baseUrl: string;
  userAgent?: string;
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  logger?: Logger;
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | string[] | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
  // Per-request API key override (used by the HTTP transport for per-session auth).
  apiKey?: string;
}

const DEFAULT_USER_AGENT = "revroute-mcp/0.2.0 (+https://github.com/IndiFox/revroute-mcp)";
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_BACKOFF_MS = 10_000;

function backoffMs(attempt: number): number {
  const base = Math.min(2 ** attempt * 500, MAX_BACKOFF_MS);
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildQuery(query: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, String(v));
    } else {
      params.append(key, String(value));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export class RevrouteClient {
  public readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly userAgent: string;
  private readonly fetchImpl: typeof fetch;
  private readonly maxRetries: number;
  private readonly logger?: Logger;

  constructor(opts: RevrouteClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, "");
    this.apiKey = opts.apiKey;
    this.userAgent = opts.userAgent ?? DEFAULT_USER_AGENT;
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch;
    this.maxRetries = opts.maxRetries ?? 3;
    this.logger = opts.logger;
  }

  async request<T = unknown>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
    const apiKey = opts.apiKey ?? this.apiKey;
    if (!apiKey) {
      throw new RevrouteApiError({
        status: 401,
        message:
          "No API key configured. Set REVROUTE_API_KEY (stdio) or send Authorization: Bearer header (HTTP).",
      });
    }

    const url = `${this.baseUrl}${path}${buildQuery(opts.query)}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "User-Agent": this.userAgent,
      Accept: "application/json",
      ...opts.headers,
    };

    let bodyText: string | undefined;
    if (opts.body !== undefined) {
      bodyText = JSON.stringify(opts.body);
      headers["Content-Type"] = "application/json";
    }

    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      this.logger?.debug("http:request", {
        method,
        url,
        attempt,
        headers: scrubHeaders(headers),
      });

      let response: Response;
      try {
        response = await this.fetchImpl(url, { method, headers, body: bodyText });
      } catch (err) {
        lastError = err;
        if (attempt >= this.maxRetries) {
          throw new RevrouteApiError({
            status: 0,
            message: `Network error: ${err instanceof Error ? err.message : String(err)}`,
          });
        }
        await sleep(backoffMs(attempt));
        continue;
      }

      if (response.ok) {
        const contentType = response.headers.get("content-type") ?? "";
        if (response.status === 204 || contentType === "") {
          return undefined as T;
        }
        if (contentType.includes("application/json")) {
          return (await response.json()) as T;
        }
        if (contentType.startsWith("image/")) {
          const buf = Buffer.from(await response.arrayBuffer());
          return { mimeType: contentType, data: buf.toString("base64") } as T;
        }
        return (await response.text()) as unknown as T;
      }

      const rawBody = await response.text();
      this.logger?.debug("http:response_error", {
        status: response.status,
        body: truncate(rawBody),
      });

      if (RETRYABLE_STATUS.has(response.status) && attempt < this.maxRetries) {
        const retryAfter = parseRetryAfter(response.headers.get("retry-after"));
        const wait = retryAfter !== undefined ? retryAfter * 1000 : backoffMs(attempt);
        await sleep(wait);
        continue;
      }

      throw buildApiError(response.status, response.headers, rawBody);
    }

    throw new RevrouteApiError({
      status: 0,
      message: `Exhausted retries: ${lastError instanceof Error ? lastError.message : "unknown"}`,
    });
  }

  get<T = unknown>(path: string, opts: Omit<RequestOptions, "body"> = {}): Promise<T> {
    return this.request<T>("GET", path, opts);
  }

  post<T = unknown>(path: string, body?: unknown, opts: RequestOptions = {}): Promise<T> {
    return this.request<T>("POST", path, { ...opts, body });
  }

  put<T = unknown>(path: string, body?: unknown, opts: RequestOptions = {}): Promise<T> {
    return this.request<T>("PUT", path, { ...opts, body });
  }

  patch<T = unknown>(path: string, body?: unknown, opts: RequestOptions = {}): Promise<T> {
    return this.request<T>("PATCH", path, { ...opts, body });
  }

  delete<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
    return this.request<T>("DELETE", path, opts);
  }
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  if (Number.isFinite(num) && num >= 0) return num;
  const date = Date.parse(value);
  if (!Number.isNaN(date)) {
    return Math.max(0, Math.ceil((date - Date.now()) / 1000));
  }
  return undefined;
}

function buildApiError(status: number, headers: Headers, rawBody: string): RevrouteApiError {
  let parsed: RevrouteErrorBody | undefined;
  try {
    parsed = rawBody ? (JSON.parse(rawBody) as RevrouteErrorBody) : undefined;
  } catch {
    parsed = undefined;
  }
  const message =
    parsed?.error?.message ??
    parsed?.message ??
    `HTTP ${status}${rawBody ? `: ${rawBody.slice(0, 200)}` : ""}`;
  return new RevrouteApiError({
    status,
    message,
    code: parsed?.error?.code,
    docUrl: parsed?.error?.doc_url,
    retryAfterSeconds: parseRetryAfter(headers.get("retry-after")),
    rawBody,
  });
}
