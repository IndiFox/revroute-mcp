import {
  TagCreateInput,
  TagDeleteInput,
  TagListInput,
  TagUpdateInput,
} from "../schemas/tag.js";
import type { Tag } from "../types/revroute.js";
import { jsonContent, type ToolRegistry } from "./_register.js";

export function registerTagTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_tag_create",
    description: "Create a tag for organizing short links.",
    inputSchema: TagCreateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.post<Tag>("/tags", args, { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_tag_list",
    description: "List tags in the workspace.",
    inputSchema: TagListInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Tag[]>("/tags", {
        query: { ...args },
        apiKey: ctx.apiKey,
      });
      return jsonContent({ data, pagination: { page: args.page, pageSize: args.pageSize } });
    },
  });

  reg.define({
    name: "revroute_tag_update",
    description: "Rename or recolor a tag.",
    inputSchema: TagUpdateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.patch<Tag>(
        `/tags/${encodeURIComponent(args.id)}`,
        args.data,
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_tag_delete",
    description: "Delete a tag (does not delete the links it tagged). Requires confirm: true.",
    inputSchema: TagDeleteInput,
    destructive: true,
    handler: async (args, ctx) => {
      const data = await ctx.client.delete<{ id: string }>(
        `/tags/${encodeURIComponent(args.id)}`,
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });
}
