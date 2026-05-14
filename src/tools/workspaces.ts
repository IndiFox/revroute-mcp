import { WorkspaceGetInput } from "../schemas/workspace.js";
import type { Workspace } from "../types/revroute.js";
import { jsonContent, type ToolRegistry } from "./_register.js";

export function registerWorkspaceTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_workspace_get",
    description:
      "Retrieve information about the current workspace (determined by the API key): plan, usage, limits.",
    inputSchema: WorkspaceGetInput,
    handler: async (_args, ctx) => {
      const data = await ctx.client.get<Workspace>("/workspaces/current", { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });
}
