import { z } from "zod";
import { NonEmptyString, PaginationInput } from "./common.js";

const DomainCore = z.object({
  slug: NonEmptyString.describe("Domain name, e.g. 'rev.ru'"),
  expiredUrl: NonEmptyString.url().optional(),
  notFoundUrl: NonEmptyString.url().optional(),
  placeholder: NonEmptyString.url().optional(),
  archived: z.boolean().optional(),
  primary: z.boolean().optional(),
  logo: NonEmptyString.url().optional(),
});

export const DomainCreateInput = DomainCore.strict();

export const DomainUpdateInput = z
  .object({
    slug: NonEmptyString.describe("Current slug to update"),
    data: DomainCore.partial(),
  })
  .strict();

export const DomainDeleteInput = z
  .object({
    slug: NonEmptyString,
    confirm: z.literal(true).describe("Must be set to true to acknowledge deletion"),
  })
  .strict();

export const DomainListInput = PaginationInput.extend({
  archived: z.boolean().optional(),
  search: z.string().optional(),
}).strict();

export const DomainAvailabilityInput = z.object({ slug: NonEmptyString }).strict();
