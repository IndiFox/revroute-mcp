import { z } from "zod";
import { NonEmptyString, PaginationInput, SortOrderInput } from "./common.js";

// Partner-program endpoints in revroute are flat (no /programs/{id}/ prefix).
// programId exists on Partner as a field but there's no public list-programs API —
// each workspace has a single implicit program.

const PartnerStatus = z.enum(["approved", "invited", "rejected", "banned", "pending", "archived"]);
const CommissionStatus = z.enum([
  "pending",
  "processed",
  "paid",
  "duplicate",
  "fraud",
  "canceled",
  "refunded",
]);
const PayoutStatus = z.enum(["created", "pending", "completed", "failed", "canceled"]);

const PartnerCore = z.object({
  name: NonEmptyString,
  email: NonEmptyString.email().optional(),
  companyName: z.string().optional(),
  description: z.string().optional(),
  image: NonEmptyString.url().optional(),
  country: NonEmptyString.optional(),
  paypalEmail: NonEmptyString.email().optional(),
  tenantId: NonEmptyString.optional(),
  username: NonEmptyString.optional(),
});

export const PartnerCreateInput = PartnerCore.strict();

export const PartnerListInput = PaginationInput.extend({
  search: z.string().optional(),
  status: PartnerStatus.optional(),
  country: NonEmptyString.optional(),
  groupId: NonEmptyString.optional(),
  tenantId: NonEmptyString.optional(),
  sortBy: z
    .enum([
      "createdAt",
      "totalCommissions",
      "totalClicks",
      "totalLeads",
      "totalConversions",
      "totalSaleAmount",
      "netRevenue",
    ])
    .optional(),
  sortOrder: SortOrderInput,
}).strict();

export const PartnerGetInput = z
  .object({
    id: NonEmptyString.optional(),
    partnerId: NonEmptyString.optional(),
    tenantId: NonEmptyString.optional(),
  })
  .strict()
  .refine((v) => Boolean(v.id || v.partnerId || v.tenantId), {
    message: "Provide one of: id, partnerId, or tenantId",
  });

export const PartnerUpdateInput = z
  .object({
    id: NonEmptyString.optional(),
    partnerId: NonEmptyString.optional(),
    data: PartnerCore.partial().extend({ status: PartnerStatus.optional() }),
  })
  .strict()
  .refine((v) => Boolean(v.id || v.partnerId), {
    message: "Provide either id or partnerId",
  });

export const CommissionListInput = PaginationInput.extend({
  partnerId: NonEmptyString.optional(),
  customerId: NonEmptyString.optional(),
  invoiceId: NonEmptyString.optional(),
  status: CommissionStatus.optional(),
  type: z.enum(["click", "lead", "sale", "custom"]).optional(),
  sortBy: z.enum(["createdAt", "amount", "earnings"]).optional(),
  sortOrder: SortOrderInput,
}).strict();

export const CommissionUpdateInput = z
  .object({
    id: NonEmptyString.describe("Commission id, e.g. cm_xxx"),
    status: CommissionStatus.optional(),
    amount: z.number().int().min(0).optional(),
    earnings: z.number().int().min(0).optional(),
    description: z.string().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 1, {
    message: "Pass at least one field to update besides id",
  });

export const BountyListInput = PaginationInput.extend({
  type: z.enum(["submission", "performance"]).optional(),
}).strict();

export const BountyCreateInput = z
  .object({
    name: NonEmptyString,
    description: z.string().optional(),
    type: z.enum(["submission", "performance"]),
    rewardAmount: z.number().int().min(0),
    rewardDescription: z.string().optional(),
    startsAt: NonEmptyString.optional(),
    endsAt: NonEmptyString.optional(),
    submissionsOpenAt: NonEmptyString.optional(),
    submissionRequirements: z.string().optional(),
    performanceCondition: z.string().optional(),
    performanceScope: z.enum(["new", "all"]).optional(),
    groupIds: z.array(NonEmptyString).optional(),
  })
  .strict();

export const PayoutListInput = PaginationInput.extend({
  partnerId: NonEmptyString.optional(),
  status: PayoutStatus.optional(),
  invoiceId: NonEmptyString.optional(),
  sortBy: z.enum(["createdAt", "amount", "paidAt"]).optional(),
  sortOrder: SortOrderInput,
}).strict();

export const PayoutCreateInput = z
  .object({
    partnerId: NonEmptyString,
    amount: z
      .number()
      .int()
      .min(1)
      .describe("Amount in the smallest currency unit (cents/kopecks)"),
    currency: NonEmptyString.default("USD"),
    description: z.string().optional(),
    invoiceId: NonEmptyString.optional(),
    periodStart: NonEmptyString.optional(),
    periodEnd: NonEmptyString.optional(),
  })
  .strict();
