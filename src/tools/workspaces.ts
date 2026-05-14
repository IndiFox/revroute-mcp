import { WorkspaceGetInput } from "../schemas/workspace.js";
import type { Workspace } from "../types/revroute.js";
import { type ToolRegistry, jsonContent } from "./_register.js";

export function registerWorkspaceTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_workspace_get",
    description:
      'Look up workspaces. Pass `slug` (or `idOrSlug`) to fetch one workspace; omit both to list all workspaces the API key can access. A workspace-scoped API key usually does NOT have permission to list, so the recommended call is `{ slug: "your-workspace" }`.',
    inputSchema: WorkspaceGetInput,
    handler: async (args, ctx) => {
      const lookup = args.slug ?? args.idOrSlug;
      if (lookup) {
        const data = await ctx.client.get<Workspace>(`/workspaces/${encodeURIComponent(lookup)}`, {
          apiKey: ctx.apiKey,
        });
        return jsonContent(data);
      }
      const data = await ctx.client.get<Workspace[]>("/workspaces", { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });
}
