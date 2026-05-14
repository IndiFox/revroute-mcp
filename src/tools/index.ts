import { z } from "zod";
import { ToolRegistry, jsonContent } from "./_register.js";
import { registerAnalyticsTools } from "./analytics.js";
import { registerCustomerTools } from "./customers.js";
import { registerDomainTools } from "./domains.js";
import { registerEventTools } from "./events.js";
import { registerFolderTools } from "./folders.js";
import { registerLinkTools } from "./links.js";
import { registerMetatagsTools } from "./metatags.js";
import { registerPartnerTools } from "./partners.js";
import { registerQrTools } from "./qr.js";
import { registerTagTools } from "./tags.js";
import { registerTrackTools } from "./track.js";
import { registerWorkspaceTools } from "./workspaces.js";

export interface RegisterAllOptions {
  enablePartners?: boolean;
}

export function buildRegistry(opts: RegisterAllOptions = {}): ToolRegistry {
  const reg = new ToolRegistry();

  // Always-on debug tool. Useful for testing the connection without an API key.
  reg.define({
    name: "revroute_ping",
    description:
      "Health-check tool. Returns the server version, configured base URL, and whether an API key is present. Does not call the upstream API.",
    inputSchema: z.object({}).strict(),
    handler: async (_args, ctx) => {
      return jsonContent({
        ok: true,
        server: "revroute-mcp",
        baseUrl: ctx.client.baseUrl ?? "(unknown)",
        apiKey: ctx.apiKey ? "configured" : "missing",
      });
    },
  });

  registerLinkTools(reg);
  registerAnalyticsTools(reg);
  registerDomainTools(reg);
  registerTagTools(reg);
  registerFolderTools(reg);
  registerCustomerTools(reg);
  registerEventTools(reg);
  registerMetatagsTools(reg);
  registerQrTools(reg);
  registerWorkspaceTools(reg);
  registerTrackTools(reg);

  if (opts.enablePartners) {
    registerPartnerTools(reg);
  }

  return reg;
}

export { ToolRegistry } from "./_register.js";
