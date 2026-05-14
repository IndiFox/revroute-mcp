import { z } from "zod";
import { Interval, IsoDate, NonEmptyString } from "./common.js";

export const AnalyticsGroupBy = z.enum([
  "count",
  "timeseries",
  "continents",
  "regions",
  "countries",
  "cities",
  "devices",
  "browsers",
  "os",
  "trigger",
  "referers",
  "referer_urls",
  "top_links",
  "top_urls",
  "tags",
  "utm_sources",
  "utm_mediums",
  "utm_campaigns",
  "utm_terms",
  "utm_contents",
]);

export const AnalyticsEvent = z.enum(["clicks", "leads", "sales", "composite"]);

export const AnalyticsQueryInput = z
  .object({
    groupBy: AnalyticsGroupBy.default("count").describe(
      "Aggregation dimension. 'count' returns totals; 'timeseries' returns per-bucket counts.",
    ),
    event: AnalyticsEvent.default("clicks"),
    interval: Interval.optional(),
    start: IsoDate.optional(),
    end: IsoDate.optional(),
    timezone: NonEmptyString.optional().describe("IANA timezone, e.g. Europe/Moscow"),
    linkId: NonEmptyString.optional(),
    externalId: NonEmptyString.optional(),
    domain: NonEmptyString.optional(),
    key: NonEmptyString.optional(),
    tagId: NonEmptyString.optional(),
    tagIds: z.array(NonEmptyString).optional(),
    folderId: NonEmptyString.optional(),
    country: NonEmptyString.optional(),
    city: NonEmptyString.optional(),
    device: NonEmptyString.optional(),
    browser: NonEmptyString.optional(),
    os: NonEmptyString.optional(),
    referer: NonEmptyString.optional(),
    refererUrl: NonEmptyString.optional(),
    url: NonEmptyString.optional(),
    qr: z.boolean().optional(),
    root: z.boolean().optional(),
    maxItems: z
      .number()
      .int()
      .min(1)
      .max(50_000)
      .default(5000)
      .describe("Hard cap on items returned across auto-paginated requests"),
  })
  .strict()
  .refine((v) => !(v.interval && (v.start || v.end)), {
    message: "Provide either `interval` OR `start`+`end`, not both.",
  });
