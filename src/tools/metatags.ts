import { MetatagsGetInput } from "../schemas/metatags.js";
import type { Metatags } from "../types/revroute.js";
import { jsonContent, type ToolRegistry } from "./_register.js";

export function registerMetatagsTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_metatags_get",
    description:
      "Fetch og:title, og:description, og:image for a URL. NOTE: as of 2026-05-14 this endpoint is not yet implemented in revroute (returns 404). The tool stays registered for forward compatibility — calls will succeed once revroute ships /metatags. Title/description/image are also returned inline when calling revroute_link_create / revroute_link_get for an existing link.",
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
