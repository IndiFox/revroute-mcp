import { z } from "zod";
import { NonEmptyString, PaginationInput, SortOrderInput } from "./common.js";

export const ProgramIdInput = z.object({ programId: NonEmptyString }).strict();

export const ProgramListInput = PaginationInput.extend({}).strict();

const PartnerCore = z.object({
  name: NonEmptyString,
  email: NonEmptyString.email(),
  image: NonEmptyString.url().optional(),
  country: NonEmptyString.optional(),
});

export const PartnerCreateInput = ProgramIdInput.merge(PartnerCore).strict();

export const PartnerUpdateInput = z
  .object({
    programId: NonEmptyString,
    partnerId: NonEmptyString,
    data: PartnerCore.partial().extend({
      status: z.enum(["approved", "invited", "rejected", "banned", "pending"]).optional(),
    }),
  })
  .strict();

export const PartnerListInput = PaginationInput.extend({
  programId: NonEmptyString,
  search: z.string().optional(),
  status: z.enum(["approved", "invited", "rejected", "banned", "pending"]).optional(),
  sortBy: z.enum(["createdAt", "earnings"]).optional(),
  sortOrder: SortOrderInput,
}).strict();

export const PartnerGetInput = z
  .object({ programId: NonEmptyString, partnerId: NonEmptyString })
  .strict();

export const CommissionListInput = PaginationInput.extend({
  programId: NonEmptyString,
  partnerId: NonEmptyString.optional(),
  status: z
    .enum(["pending", "processed", "paid", "duplicate", "fraud", "canceled"])
    .optional(),
  type: z.enum(["click", "lead", "sale"]).optional(),
  sortOrder: SortOrderInput,
}).strict();

export const CommissionUpdateInput = z
  .object({
    programId: NonEmptyString,
    commissionId: NonEmptyString,
    status: z.enum(["pending", "processed", "paid", "duplicate", "fraud", "canceled"]),
  })
  .strict();

export const BountyListInput = PaginationInput.extend({
  programId: NonEmptyString,
}).strict();

export const BountyCreateInput = z
  .object({
    programId: NonEmptyString,
    name: NonEmptyString,
    description: z.string().optional(),
    type: z.enum(["submission", "performance"]),
    rewardAmount: z.number().int().min(0),
    rewardDescription: z.string().optional(),
    submissionRequirements: z.string().optional(),
    partnerIds: z.array(NonEmptyString).optional(),
  })
  .strict();

export const PayoutListInput = PaginationInput.extend({
  programId: NonEmptyString,
  partnerId: NonEmptyString.optional(),
  status: z.enum(["created", "pending", "completed", "failed", "canceled"]).optional(),
}).strict();

export const PayoutCreateInput = z
  .object({
    programId: NonEmptyString,
    partnerId: NonEmptyString,
    amount: z.number().int().min(1),
    currency: NonEmptyString.default("USD"),
    description: z.string().optional(),
  })
  .strict();
