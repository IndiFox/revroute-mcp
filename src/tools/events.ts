import { EventListInput } from "../schemas/event.js";
import type { EventRecord } from "../types/revroute.js";
import { jsonContent, type ToolRegistry } from "./_register.js";

export function registerEventTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_event_list",
    description:
      "List raw click/lead/sale events with filters. Paginated; pass page+pageSize to walk results.",
    inputSchema: EventListInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<EventRecord[]>("/events", {
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
            ? `Call again with page=${args.page + 1} for more events.`
            : undefined,
      });
    },
  });
}
