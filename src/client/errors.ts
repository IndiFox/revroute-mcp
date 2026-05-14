import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";

export interface RevrouteErrorBody {
  error?: {
    code?: string;
    message?: string;
    doc_url?: string;
  };
  message?: string;
}

export class RevrouteApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly docUrl?: string;
  public readonly retryAfterSeconds?: number;
  public readonly rawBody?: string;

  constructor(opts: {
    status: number;
    message: string;
    code?: string;
    docUrl?: string;
    retryAfterSeconds?: number;
    rawBody?: string;
  }) {
    super(opts.message);
    this.name = "RevrouteApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.docUrl = opts.docUrl;
    this.retryAfterSeconds = opts.retryAfterSeconds;
    this.rawBody = opts.rawBody;
  }
}

// Custom MCP error codes (per JSON-RPC 2.0, application range is -32000..-32099).
export const MCP_ERROR_UNAUTHORIZED = -32001;
export const MCP_ERROR_FORBIDDEN = -32002;
export const MCP_ERROR_RATE_LIMITED = -32003;

export function toMcpError(err: unknown): McpError {
  if (err instanceof McpError) return err;
  if (err instanceof RevrouteApiError) {
    const data: Record<string, unknown> = {
      status: err.status,
      ...(err.code ? { code: err.code } : {}),
      ...(err.docUrl ? { doc_url: err.docUrl } : {}),
      ...(err.retryAfterSeconds ? { retry_after_seconds: err.retryAfterSeconds } : {}),
    };

    if (err.status === 401) {
      return new McpError(
        MCP_ERROR_UNAUTHORIZED as ErrorCode,
        `Unauthorized: ${err.message}. Check REVROUTE_API_KEY.`,
        data,
      );
    }
    if (err.status === 403) {
      return new McpError(
        MCP_ERROR_FORBIDDEN as ErrorCode,
        `Forbidden: ${err.message}. The API key may lack required scopes.`,
        data,
      );
    }
    if (err.status === 404) {
      return new McpError(ErrorCode.InvalidParams, `Not found: ${err.message}`, data);
    }
    if (err.status === 422 || err.status === 400) {
      return new McpError(ErrorCode.InvalidParams, err.message, data);
    }
    if (err.status === 429) {
      return new McpError(
        MCP_ERROR_RATE_LIMITED as ErrorCode,
        `Rate limited by revroute API. Retry after ${err.retryAfterSeconds ?? "?"}s.`,
        data,
      );
    }
    return new McpError(ErrorCode.InternalError, `Upstream error: ${err.message}`, data);
  }
  if (err instanceof Error) {
    return new McpError(ErrorCode.InternalError, err.message);
  }
  return new McpError(ErrorCode.InternalError, "Unknown error");
}

export function scrubSecrets(input: string, secrets: string[]): string {
  let out = input;
  for (const secret of secrets) {
    if (!secret) continue;
    out = out.split(secret).join("***");
  }
  return out;
}
