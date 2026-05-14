import { MetatagsGetInput } from "../schemas/metatags.js";
import type { Metatags } from "../types/revroute.js";
import { jsonContent, type ToolRegistry } from "./_register.js";

export function registerMetatagsTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_metatags_get",
    description:
      "Fetch og:title, og:description, and og:image for a URL. Useful for previewing a destination before shortening.",
    inputSchema: MetatagsGetInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Metatags>("/metatags", {
        query: { url: args.url },
        apiKey: ctx.apiKey,
      });
      return jsonContent(data);
    },
  });
}
