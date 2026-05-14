import { z } from "zod";
import { IsoDate, NonEmptyString, PaginationInput, SortOrderInput } from "./common.js";

const LinkCore = z.object({
  url: NonEmptyString.url().describe("Destination URL"),
  domain: NonEmptyString.optional().describe("Short link domain (default: workspace default)"),
  key: NonEmptyString.optional().describe("Short link path. Random if omitted"),
  externalId: NonEmptyString.optional(),
  tenantId: NonEmptyString.optional(),
  prefix: NonEmptyString.optional(),
  trackConversion: z.boolean().optional(),
  archived: z.boolean().optional(),
  publicStats: z.boolean().optional(),
  tagIds: z.array(NonEmptyString).optional(),
  tagNames: z.array(NonEmptyString).optional(),
  folderId: NonEmptyString.optional(),
  comments: z.string().optional(),
  expiresAt: IsoDate.optional(),
  expiredUrl: NonEmptyString.url().optional(),
  password: z.string().optional(),
  proxy: z.boolean().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  image: NonEmptyString.url().optional(),
  ios: NonEmptyString.url().optional(),
  android: NonEmptyString.url().optional(),
  geo: z.record(z.string(), NonEmptyString.url()).optional(),
  doIndex: z.boolean().optional(),
  rewrite: z.boolean().optional(),
});

export const LinkCreate = LinkCore.strict();

export const LinkUpsert = LinkCore.extend({
  url: NonEmptyString.url(),
}).strict();

export const LinkUpdate = LinkCore.partial()
  .extend({
    id: NonEmptyString.optional().describe("Link ID (one of id, externalId, or domain+key required)"),
    externalId: NonEmptyString.optional(),
  })
  .strict();

export const LinkIdInput = z
  .object({
    id: NonEmptyString.optional(),
    externalId: NonEmptyString.optional(),
    domain: NonEmptyString.optional(),
    key: NonEmptyString.optional(),
  })
  .strict()
  .refine(
    (v) => Boolean(v.id) || Boolean(v.externalId) || (v.domain && v.key),
    { message: "Provide one of: id, externalId, or both domain+key" },
  );

export const LinkListInput = PaginationInput.extend({
  domain: NonEmptyString.optional(),
  tagId: NonEmptyString.optional(),
  tagIds: z.array(NonEmptyString).optional(),
  tagNames: z.array(NonEmptyString).optional(),
  search: z.string().optional(),
  userId: NonEmptyString.optional(),
  showArchived: z.boolean().optional(),
  withTags: z.boolean().optional(),
  sort: z.enum(["createdAt", "clicks", "lastClicked"]).default("createdAt"),
  sortBy: z.enum(["createdAt", "clicks", "lastClicked"]).optional(),
  sortOrder: SortOrderInput,
}).strict();

export const LinkCountInput = LinkListInput.partial().extend({
  groupBy: z.enum(["domain", "tagId", "userId"]).optional(),
}).strict();

export const LinkBulkCreateInput = z
  .object({
    links: z.array(LinkCreate).min(1).max(100),
  })
  .strict();

export const LinkBulkUpdateInput = z
  .object({
    data: LinkCore.partial(),
    linkIds: z.array(NonEmptyString).min(1).max(100).optional(),
    externalIds: z.array(NonEmptyString).min(1).max(100).optional(),
  })
  .strict()
  .refine(
    (v) => Boolean(v.linkIds?.length) || Boolean(v.externalIds?.length),
    { message: "Provide either linkIds or externalIds" },
  );

export const LinkBulkDeleteInput = z
  .object({
    linkIds: z.array(NonEmptyString).min(1).max(100),
    confirm: z
      .literal(true)
      .describe("Must be set to true to acknowledge the destructive operation"),
  })
  .strict();

export const LinkDeleteInput = LinkIdInput.and(
  z.object({
    confirm: z.literal(true).describe("Must be set to true to acknowledge deletion"),
  }),
);
