import { TrackLeadInput, TrackSaleInput } from "../schemas/track.js";
import { type ToolRegistry, jsonContent } from "./_register.js";

export function registerTrackTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_track_lead",
    description:
      "Record a lead conversion event tied to a clickId. Billable. Use only with real customer data — this writes to the production analytics stream.",
    inputSchema: TrackLeadInput,
    destructive: true,
    handler: async (args, ctx) => {
      const data = await ctx.client.post<unknown>("/track/lead", args, { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_track_sale",
    description:
      "Record a sale conversion event for an already-tracked customer. Billable. Use only with real customer data.",
    inputSchema: TrackSaleInput,
    destructive: true,
    handler: async (args, ctx) => {
      const data = await ctx.client.post<unknown>("/track/sale", args, { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });
}
