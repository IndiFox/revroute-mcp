import {
  BountyCreateInput,
  BountyListInput,
  CommissionListInput,
  CommissionUpdateInput,
  PartnerCreateInput,
  PartnerGetInput,
  PartnerListInput,
  PartnerUpdateInput,
  PayoutCreateInput,
  PayoutListInput,
} from "../schemas/partner.js";
import type { Bounty, Commission, Partner, Payout } from "../types/revroute.js";
import { type ToolRegistry, jsonContent } from "./_register.js";

// Partner-program endpoints in revroute are flat — there's no `/programs/{id}/...` prefix
// and no list-programs API. Each workspace has a single implicit program, identified by
// programId on partner records but managed via these top-level endpoints.
//
// Only registered when REVROUTE_ENABLE_PARTNERS=1.
export function registerPartnerTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_partner_create",
    description: "Invite or directly create a partner in the workspace's program.",
    inputSchema: PartnerCreateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.post<Partner>("/partners", args, { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_partner_list",
    description:
      "List partners in the workspace's program. Filter by status, country, group, or search query.",
    inputSchema: PartnerListInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Partner[]>("/partners", {
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
      });
    },
  });

  reg.define({
    name: "revroute_partner_get",
    description: "Retrieve a partner by id, partnerId (alias), or tenantId.",
    inputSchema: PartnerGetInput,
    handler: async (args, ctx) => {
      const ident = args.id ?? args.partnerId;
      if (ident) {
        const data = await ctx.client.get<Partner>(`/partners/${encodeURIComponent(ident)}`, {
          apiKey: ctx.apiKey,
        });
        return jsonContent(data);
      }
      // Fallback: lookup by tenantId via query
      const data = await ctx.client.get<Partner>("/partners", {
        query: { tenantId: args.tenantId },
        apiKey: ctx.apiKey,
      });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_partner_update",
    description: "Update partner fields including status (approve / ban / reject).",
    inputSchema: PartnerUpdateInput,
    handler: async (args, ctx) => {
      const ident = args.id ?? args.partnerId;
      if (!ident) {
        // Schema's .refine() guarantees one of these is set; this satisfies the type checker.
        throw new Error("Provide either id or partnerId");
      }
      const data = await ctx.client.patch<Partner>(
        `/partners/${encodeURIComponent(ident)}`,
        args.data,
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_commission_list",
    description:
      "List commissions for the workspace's program. Filter by partner, customer, status, or type.",
    inputSchema: CommissionListInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Commission[]>("/commissions", {
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
      });
    },
  });

  reg.define({
    name: "revroute_commission_update",
    description:
      "Update an individual commission — change status (approve / fraud / refund), amount, earnings, or description.",
    inputSchema: CommissionUpdateInput,
    handler: async (args, ctx) => {
      const { id, ...body } = args;
      const data = await ctx.client.patch<Commission>(
        `/commissions/${encodeURIComponent(id)}`,
        body,
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_bounty_list",
    description: "List bounties (one-off rewards) defined for the workspace's program.",
    inputSchema: BountyListInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Bounty[]>("/bounties", {
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
      });
    },
  });

  reg.define({
    name: "revroute_bounty_create",
    description: "Create a bounty (performance or submission type) for the program.",
    inputSchema: BountyCreateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.post<Bounty>("/bounties", args, { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_payout_list",
    description: "List payouts. Filter by partner, status, or invoice.",
    inputSchema: PayoutListInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Payout[]>("/payouts", {
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
      });
    },
  });

  reg.define({
    name: "revroute_payout_create",
    description:
      "Initiate a payout to a partner. Billable — verify partnerId, amount (in smallest currency unit), and currency.",
    inputSchema: PayoutCreateInput,
    destructive: true,
    handler: async (args, ctx) => {
      const data = await ctx.client.post<Payout>("/payouts", args, { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });
}
