import { Command } from "commander";

import { loadConfig } from "./config.js";
import { runStdio } from "./transport/stdio.js";
import { runHttp } from "./transport/http.js";
import { SERVER_INFO } from "./server.js";

async function main(): Promise<void> {
  const program = new Command();
  program
    .name("revroute-mcp")
    .description("MCP server for revroute.ru (short links, analytics, conversion tracking).")
    .version(SERVER_INFO.version)
    .option(
      "-t, --transport <type>",
      "transport: stdio (default) | http",
      "stdio",
    )
    .option("-p, --port <number>", "HTTP port (default: 8787)")
    .option("-H, --host <host>", "HTTP bind host (default: 127.0.0.1)")
    .option("--base-url <url>", "override REVROUTE_API_BASE_URL")
    .option("--cors-origin <origin>", "override REVROUTE_CORS_ORIGIN")
    .option("--enable-partners", "enable partner-program tools (or set REVROUTE_ENABLE_PARTNERS=1)")
    .option("-d, --debug", "verbose logging to stderr");

  program.parse(process.argv);
  const opts = program.opts<{
    transport: string;
    port?: string;
    host?: string;
    baseUrl?: string;
    corsOrigin?: string;
    enablePartners?: boolean;
    debug?: boolean;
  }>();

  // CLI flags override env.
  if (opts.port) process.env.REVROUTE_HTTP_PORT = opts.port;
  if (opts.host) process.env.REVROUTE_HTTP_HOST = opts.host;
  if (opts.baseUrl) process.env.REVROUTE_API_BASE_URL = opts.baseUrl;
  if (opts.corsOrigin) process.env.REVROUTE_CORS_ORIGIN = opts.corsOrigin;
  if (opts.enablePartners) process.env.REVROUTE_ENABLE_PARTNERS = "1";
  if (opts.debug) process.env.REVROUTE_DEBUG = "1";

  const config = loadConfig();

  if (opts.transport === "http") {
    await runHttp(config);
    return;
  }

  if (opts.transport !== "stdio") {
    process.stderr.write(
      `[revroute-mcp] Unknown transport "${opts.transport}". Use stdio or http.\n`,
    );
    process.exit(2);
  }

  await runStdio(config);
}

main().catch((err) => {
  process.stderr.write(
    `[revroute-mcp] Fatal: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`,
  );
  process.exit(1);
});
