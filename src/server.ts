import { Server } from "@modelcontextprotocol/sdk/server/index.js";

import { RevrouteClient } from "./client/http.js";
import type { ResolvedConfig } from "./config.js";
import { buildRegistry } from "./tools/index.js";
import { createLogger, type Logger } from "./util/logger.js";

export const SERVER_INFO = {
  name: "revroute-mcp",
  version: "0.2.0",
};

export interface CreatedServer {
  server: Server;
  client: RevrouteClient;
  logger: Logger;
}

// Per-request override hook used by the Streamable HTTP transport to pass the
// caller-supplied API key into tool handlers. Stdio leaves it undefined.
export type ApiKeyResolver = () => string | undefined;

export function createServer(
  config: ResolvedConfig,
  apiKeyResolver?: ApiKeyResolver,
): CreatedServer {
  const logger = createLogger({ debug: config.debug });
  const client = new RevrouteClient({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    logger,
  });

  const server = new Server(SERVER_INFO, {
    capabilities: {
      tools: {},
    },
  });

  const registry = buildRegistry({ enablePartners: config.enablePartners });

  registry.bind(server, () => ({
    client,
    apiKey: apiKeyResolver?.() ?? config.apiKey,
    logger,
  }));

  logger.info("server:ready", {
    tools: registry.list().length,
    baseUrl: config.baseUrl,
    partners: config.enablePartners,
  });

  return { server, client, logger };
}
