import {
  DomainAvailabilityInput,
  DomainCreateInput,
  DomainDeleteInput,
  DomainListInput,
  DomainUpdateInput,
} from "../schemas/domain.js";
import type { Domain } from "../types/revroute.js";
import { type ToolRegistry, jsonContent } from "./_register.js";

export function registerDomainTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_domain_create",
    description: "Add a custom domain to the workspace.",
    inputSchema: DomainCreateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.post<Domain>("/domains", args, { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_domain_list",
    description: "List all domains attached to the workspace.",
    inputSchema: DomainListInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Domain[]>("/domains", {
        query: { ...args },
        apiKey: ctx.apiKey,
      });
      return jsonContent({ data, pagination: { page: args.page, pageSize: args.pageSize } });
    },
  });

  reg.define({
    name: "revroute_domain_update",
    description: "Update a domain's settings (placeholder URL, fallback URL, archived flag).",
    inputSchema: DomainUpdateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.patch<Domain>(
        `/domains/${encodeURIComponent(args.slug)}`,
        args.data,
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_domain_delete",
    description: "Remove a custom domain from the workspace. Requires confirm: true.",
    inputSchema: DomainDeleteInput,
    destructive: true,
    handler: async (args, ctx) => {
      const data = await ctx.client.delete<{ slug: string }>(
        `/domains/${encodeURIComponent(args.slug)}`,
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_domain_check_availability",
    description: "Check whether a domain slug is available to register through revroute.",
    inputSchema: DomainAvailabilityInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<{ available: boolean; price?: number }>(
        "/domains/availability",
        { query: { slug: args.slug }, apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });
}
