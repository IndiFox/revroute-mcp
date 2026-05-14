import { z } from "zod";

export const PaginationInput = z
  .object({
    page: z.number().int().min(1).default(1).describe("1-based page index"),
    pageSize: z.number().int().min(1).max(100).default(50).describe("Items per page (max 100)"),
  })
  .strict();

export const SortOrderInput = z.enum(["asc", "desc"]).default("desc");

export const Interval = z
  .enum(["24h", "7d", "30d", "90d", "ytd", "1y", "all"])
  .describe("Pre-defined time window. Mutually exclusive with start/end.");

export const IsoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?Z?)?$/, {
    message: "Must be an ISO-8601 date or datetime",
  });

export const HexColor = z
  .string()
  .regex(/^#?[0-9a-fA-F]{6}$/, { message: "Must be a 6-char hex color, e.g. #FF6600" });

export const NonEmptyString = z.string().trim().min(1);
