import {
  LinkBulkCreateInput,
  LinkBulkDeleteInput,
  LinkBulkUpdateInput,
  LinkCountInput,
  LinkCreate,
  LinkDeleteInput,
  LinkIdInput,
  LinkListInput,
  LinkUpdate,
  LinkUpsert,
} from "../schemas/link.js";
import type { Link } from "../types/revroute.js";
import { jsonContent, type ToolRegistry } from "./_register.js";

function linkPath(
  id: string | undefined,
  externalId: string | undefined,
): {
  path: string;
  extra?: Record<string, string>;
} {
  if (id) return { path: `/links/${encodeURIComponent(id)}` };
  if (externalId) return { path: "/links/info", extra: { externalId } };
  return { path: "/links/info" };
}

export function registerLinkTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_link_create",
    description: "Create a new short link. Returns the created link with shortLink and qrCode.",
    inputSchema: LinkCreate,
    handler: async (args, ctx) => {
      const data = await ctx.client.post<Link>("/links", args, { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_link_upsert",
    description:
      "Create or update a short link in a single call, keyed by url (and optional externalId).",
    inputSchema: LinkUpsert,
    handler: async (args, ctx) => {
      const data = await ctx.client.put<Link>("/links/upsert", args, { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_link_list",
    description:
      "List short links for the workspace with pagination. Filter by domain, tag, search query, or user.",
    inputSchema: LinkListInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Link[]>("/links", {
        query: { ...args },
        apiKey: ctx.apiKey,
      });
      return jsonContent({
        data,
        pagination: {
          page: args.page,
          pageSize: args.pageSize,
          hasMore: data.length === args.pageSize,
        },
        _hint:
          data.length === args.pageSize
            ? `Call again with page=${args.page + 1} for more.`
            : undefined,
      });
    },
  });

  reg.define({
    name: "revroute_link_get",
    description: "Retrieve a single short link. Identify it by id, externalId, or domain+key.",
    inputSchema: LinkIdInput,
    handler: async (args, ctx) => {
      if (args.id) {
        const data = await ctx.client.get<Link>(`/links/${encodeURIComponent(args.id)}`, {
          apiKey: ctx.apiKey,
        });
        return jsonContent(data);
      }
      const data = await ctx.client.get<Link>("/links/info", {
        query: {
          externalId: args.externalId,
          domain: args.domain,
          key: args.key,
        },
        apiKey: ctx.apiKey,
      });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_link_update",
    description: "Update fields on an existing short link.",
    inputSchema: LinkUpdate,
    handler: async (args, ctx) => {
      const { id, externalId, ...body } = args;
      const { path } = linkPath(id, externalId);
      const data = await ctx.client.patch<Link>(path, body, {
        apiKey: ctx.apiKey,
        query: externalId && !id ? { externalId } : undefined,
      });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_link_delete",
    description: "Permanently delete a single short link. No undo. Requires confirm: true.",
    inputSchema: LinkDeleteInput,
    destructive: true,
    handler: async (args, ctx) => {
      const { id, externalId, domain, key } = args;
      let path: string;
      if (id) {
        path = `/links/${encodeURIComponent(id)}`;
      } else {
        path = "/links/info";
      }
      const data = await ctx.client.delete<{ id: string }>(path, {
        apiKey: ctx.apiKey,
        query: !id ? { externalId, domain, key } : undefined,
      });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_link_bulk_create",
    description: "Create up to 100 short links in a single request.",
    inputSchema: LinkBulkCreateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.post<Link[]>("/links/bulk", args.links, {
        apiKey: ctx.apiKey,
      });
      return jsonContent({ created: data.length, links: data });
    },
  });

  reg.define({
    name: "revroute_link_bulk_update",
    description:
      "Apply the same partial update to up to 100 links, identified by linkIds OR externalIds.",
    inputSchema: LinkBulkUpdateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.patch<Link[]>("/links/bulk", args, { apiKey: ctx.apiKey });
      return jsonContent({ updated: data.length, links: data });
    },
  });

  reg.define({
    name: "revroute_link_bulk_delete",
    description: "Permanently delete up to 100 short links by ID. No undo. Requires confirm: true.",
    inputSchema: LinkBulkDeleteInput,
    destructive: true,
    handler: async (args, ctx) => {
      const data = await ctx.client.delete<{ deletedCount: number }>("/links/bulk", {
        apiKey: ctx.apiKey,
        query: { linkIds: args.linkIds },
      });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_link_count",
    description:
      "Count short links matching the given filters. Optionally group by domain/tag/user.",
    inputSchema: LinkCountInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<number | Record<string, number>>("/links/count", {
        query: { ...args },
        apiKey: ctx.apiKey,
      });
      return jsonContent(data);
    },
  });
}
