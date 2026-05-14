import { AnalyticsQueryInput } from "../schemas/analytics.js";
import type { AnalyticsResult } from "../types/revroute.js";
import { type ToolRegistry, jsonContent } from "./_register.js";

export function registerAnalyticsTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_analytics_query",
    description:
      "Aggregate analytics across the workspace. groupBy controls the dimension (count/timeseries/countries/cities/devices/browsers/os/referers/top_links/top_urls/utm_*). Use either `interval` OR explicit `start`/`end`. Filter by linkId, domain, tagId, etc. Returns at most `maxItems` rows (default 5000).",
    inputSchema: AnalyticsQueryInput,
    handler: async (args, ctx) => {
      const { maxItems, ...query } = args;
      const data = await ctx.client.get<
        AnalyticsResult | { clicks: number; leads: number; sales: number }
      >("/analytics", { query: { ...query }, apiKey: ctx.apiKey });

      if (!Array.isArray(data)) {
        return jsonContent({ groupBy: args.groupBy, data });
      }

      let truncated = false;
      let rows = data;
      if (rows.length > maxItems) {
        rows = rows.slice(0, maxItems);
        truncated = true;
      }

      return jsonContent({
        groupBy: args.groupBy,
        event: args.event,
        count: rows.length,
        truncated,
        data: rows,
        ...(truncated
          ? { _hint: `Results truncated at maxItems=${maxItems}. Narrow the time range or filter.` }
          : {}),
      });
    },
  });
}
