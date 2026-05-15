import {
  FolderCreateInput,
  FolderDeleteInput,
  FolderListInput,
  FolderUpdateInput,
} from "../schemas/folder.js";
import type { Folder } from "../types/revroute.js";
import { jsonContent, type ToolRegistry } from "./_register.js";

export function registerFolderTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_folder_create",
    description: "Create a folder for grouping links.",
    inputSchema: FolderCreateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.post<Folder>("/folders", args, { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_folder_list",
    description: "List folders in the workspace.",
    inputSchema: FolderListInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Folder[]>("/folders", {
        query: { ...args },
        apiKey: ctx.apiKey,
      });
      return jsonContent({ data, pagination: { page: args.page, pageSize: args.pageSize } });
    },
  });

  reg.define({
    name: "revroute_folder_update",
    description: "Rename a folder or change its access level.",
    inputSchema: FolderUpdateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.patch<Folder>(
        `/folders/${encodeURIComponent(args.id)}`,
        args.data,
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_folder_delete",
    description: "Delete a folder (links inside are not deleted). Requires confirm: true.",
    inputSchema: FolderDeleteInput,
    destructive: true,
    handler: async (args, ctx) => {
      const data = await ctx.client.delete<{ id: string }>(
        `/folders/${encodeURIComponent(args.id)}`,
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });
}
