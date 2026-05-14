import { WorkspaceGetInput } from "../schemas/workspace.js";
import type { Workspace } from "../types/revroute.js";
import { jsonContent, type ToolRegistry } from "./_register.js";

export function registerWorkspaceTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_workspace_get",
    description:
      "List workspaces the API key has access to (plan, usage, limits). The API key authenticates a single workspace in most cases, so the array typically has one element.",
    inputSchema: WorkspaceGetInput,
    handler: async (_args, ctx) => {
      const data = await ctx.client.get<Workspace[]>("/workspaces", { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });
}
