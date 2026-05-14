import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  type CallToolRequest,
  CallToolRequestSchema,
  type CallToolResult,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { toMcpError } from "../client/errors.js";
import type { RevrouteClient } from "../client/http.js";
import type { Logger } from "../util/logger.js";

export interface ToolContext {
  client: RevrouteClient;
  // Optional per-call API key override (used by Streamable HTTP transport).
  apiKey?: string;
  logger: Logger;
}

export type ToolHandler<S extends z.ZodTypeAny> = (
  args: z.infer<S>,
  ctx: ToolContext,
) => Promise<CallToolResult>;

export interface ToolDefinition<S extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  description: string;
  inputSchema: S;
  handler: ToolHandler<S>;
  destructive?: boolean;
}

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>();

  define<S extends z.ZodTypeAny>(def: ToolDefinition<S>): void {
    if (this.tools.has(def.name)) {
      throw new Error(`Duplicate tool name: ${def.name}`);
    }
    this.tools.set(def.name, def as unknown as ToolDefinition);
  }

  list(): ToolDefinition[] {
    return [...this.tools.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  bind(server: Server, contextFor: (req: CallToolRequest) => ToolContext): void {
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.list().map((t) => ({
        name: t.name,
        description: t.destructive ? `[DESTRUCTIVE] ${t.description}` : t.description,
        inputSchema: zodToJsonSchema(t.inputSchema, {
          $refStrategy: "none",
          target: "openApi3",
        }) as Record<string, unknown>,
      })),
    }));

    server.setRequestHandler(CallToolRequestSchema, async (req) => {
      const tool = this.tools.get(req.params.name);
      if (!tool) {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${req.params.name}`);
      }
      const parsed = tool.inputSchema.safeParse(req.params.arguments ?? {});
      if (!parsed.success) {
        throw new McpError(
          ErrorCode.InvalidParams,
          formatZodIssues(parsed.error),
          parsed.error.flatten(),
        );
      }
      try {
        return await tool.handler(parsed.data, contextFor(req));
      } catch (err) {
        throw toMcpError(err);
      }
    });
  }
}

export function jsonContent(data: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function imageContent(mimeType: string, base64Data: string): CallToolResult {
  return {
    content: [{ type: "image", data: base64Data, mimeType }],
  };
}

function formatZodIssues(err: z.ZodError): string {
  return err.issues
    .map((iss) => `${iss.path.length ? iss.path.join(".") : "(root)"}: ${iss.message}`)
    .join("; ");
}
