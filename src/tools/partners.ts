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
  ProgramIdInput,
  ProgramListInput,
} from "../schemas/partner.js";
import type { Bounty, Commission, Partner, Payout, Program } from "../types/revroute.js";
import { jsonContent, type ToolRegistry } from "./_register.js";

// Registered only when REVROUTE_ENABLE_PARTNERS=1, to keep tools/list lean for users
// who don't operate an affiliate program.
export function registerPartnerTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_program_list",
    description: "List partner programs in the workspace.",
    inputSchema: ProgramListInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Program[]>("/programs", {
        query: { ...args },
        apiKey: ctx.apiKey,
      });
      return jsonContent({ data, pagination: { page: args.page, pageSize: args.pageSize } });
    },
  });

  reg.define({
    name: "revroute_program_get",
    description: "Retrieve a single program by id.",
    inputSchema: ProgramIdInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Program>(`/programs/${encodeURIComponent(args.programId)}`, {
        apiKey: ctx.apiKey,
      });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_partner_create",
    description: "Invite or directly create a partner in a program.",
    inputSchema: PartnerCreateInput,
    handler: async (args, ctx) => {
      const { programId, ...body } = args;
      const data = await ctx.client.post<Partner>(
        `/programs/${encodeURIComponent(programId)}/partners`,
        body,
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_partner_list",
    description: "List partners in a program. Filter by status or search query.",
    inputSchema: PartnerListInput,
    handler: async (args, ctx) => {
      const { programId, ...query } = args;
      const data = await ctx.client.get<Partner[]>(
        `/programs/${encodeURIComponent(programId)}/partners`,
        { query: { ...query }, apiKey: ctx.apiKey },
      );
      return jsonContent({ data, pagination: { page: args.page, pageSize: args.pageSize } });
    },
  });

  reg.define({
    name: "revroute_partner_get",
    description: "Retrieve a partner by id.",
    inputSchema: PartnerGetInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Partner>(
        `/programs/${encodeURIComponent(args.programId)}/partners/${encodeURIComponent(args.partnerId)}`,
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_partner_update",
    description: "Update partner fields including status (approve / ban / reject).",
    inputSchema: PartnerUpdateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.patch<Partner>(
        `/programs/${encodeURIComponent(args.programId)}/partners/${encodeURIComponent(args.partnerId)}`,
        args.data,
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_commission_list",
    description: "List commissions for a program, optionally filtered by partner, type, or status.",
    inputSchema: CommissionListInput,
    handler: async (args, ctx) => {
      const { programId, ...query } = args;
      const data = await ctx.client.get<Commission[]>(
        `/programs/${encodeURIComponent(programId)}/commissions`,
        { query: { ...query }, apiKey: ctx.apiKey },
      );
      return jsonContent({ data, pagination: { page: args.page, pageSize: args.pageSize } });
    },
  });

  reg.define({
    name: "revroute_commission_update",
    description: "Update the status of an individual commission (e.g. approve, mark as fraud).",
    inputSchema: CommissionUpdateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.patch<Commission>(
        `/programs/${encodeURIComponent(args.programId)}/commissions/${encodeURIComponent(args.commissionId)}`,
        { status: args.status },
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_bounty_list",
    description: "List bounties (one-off rewards) defined for a program.",
    inputSchema: BountyListInput,
    handler: async (args, ctx) => {
      const { programId, ...query } = args;
      const data = await ctx.client.get<Bounty[]>(
        `/programs/${encodeURIComponent(programId)}/bounties`,
        { query: { ...query }, apiKey: ctx.apiKey },
      );
      return jsonContent({ data, pagination: { page: args.page, pageSize: args.pageSize } });
    },
  });

  reg.define({
    name: "revroute_bounty_create",
    description: "Create a bounty for a program.",
    inputSchema: BountyCreateInput,
    handler: async (args, ctx) => {
      const { programId, ...body } = args;
      const data = await ctx.client.post<Bounty>(
        `/programs/${encodeURIComponent(programId)}/bounties`,
        body,
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_payout_list",
    description: "List payouts for a program. Filter by partner or status.",
    inputSchema: PayoutListInput,
    handler: async (args, ctx) => {
      const { programId, ...query } = args;
      const data = await ctx.client.get<Payout[]>(
        `/programs/${encodeURIComponent(programId)}/payouts`,
        { query: { ...query }, apiKey: ctx.apiKey },
      );
      return jsonContent({ data, pagination: { page: args.page, pageSize: args.pageSize } });
    },
  });

  reg.define({
    name: "revroute_payout_create",
    description: "Initiate a payout to a partner. Billable. Verify amount and currency.",
    inputSchema: PayoutCreateInput,
    destructive: true,
    handler: async (args, ctx) => {
      const { programId, ...body } = args;
      const data = await ctx.client.post<Payout>(
        `/programs/${encodeURIComponent(programId)}/payouts`,
        body,
        { apiKey: ctx.apiKey },
      );
      return jsonContent(data);
    },
  });
}
