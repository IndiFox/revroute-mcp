import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import type { ResolvedConfig } from "../config.js";
import { createServer } from "../server.js";

export async function runStdio(config: ResolvedConfig): Promise<void> {
  const { server, logger } = createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("transport:stdio_connected");

  // Graceful shutdown on signals so Claude Desktop can restart cleanly.
  const shutdown = (signal: string) => {
    logger.info("transport:stdio_shutdown", { signal });
    server.close().finally(() => process.exit(0));
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
