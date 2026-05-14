import { z } from "zod";
import { NonEmptyString, PaginationInput, SortOrderInput } from "./common.js";

const CustomerCore = z.object({
  externalId: NonEmptyString.describe("Stable identifier from your own system"),
  name: z.string().optional(),
  email: NonEmptyString.email().optional(),
  avatar: NonEmptyString.url().optional(),
  country: NonEmptyString.optional(),
});

export const CustomerCreateInput = CustomerCore.strict();

export const CustomerUpdateInput = z
  .object({
    id: NonEmptyString.optional(),
    externalId: NonEmptyString.optional(),
    data: CustomerCore.partial(),
  })
  .strict()
  .refine((v) => Boolean(v.id) || Boolean(v.externalId), {
    message: "Provide either id or externalId",
  });

export const CustomerDeleteInput = z
  .object({
    id: NonEmptyString.optional(),
    externalId: NonEmptyString.optional(),
    confirm: z.literal(true),
  })
  .strict()
  .refine((v) => Boolean(v.id) || Boolean(v.externalId), {
    message: "Provide either id or externalId",
  });

export const CustomerGetInput = z
  .object({
    id: NonEmptyString.optional(),
    externalId: NonEmptyString.optional(),
  })
  .strict()
  .refine((v) => Boolean(v.id) || Boolean(v.externalId), {
    message: "Provide either id or externalId",
  });

export const CustomerListInput = PaginationInput.extend({
  search: z.string().optional(),
  email: NonEmptyString.email().optional(),
  sortBy: z.enum(["createdAt", "name"]).optional(),
  sortOrder: SortOrderInput,
}).strict();
