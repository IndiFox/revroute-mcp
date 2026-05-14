import { z } from "zod";
import { AnalyticsEvent } from "./analytics.js";
import { Interval, IsoDate, NonEmptyString, PaginationInput } from "./common.js";

export const EventListInput = PaginationInput.extend({
  event: AnalyticsEvent.default("clicks"),
  interval: Interval.optional(),
  start: IsoDate.optional(),
  end: IsoDate.optional(),
  timezone: NonEmptyString.optional(),
  linkId: NonEmptyString.optional(),
  externalId: NonEmptyString.optional(),
  domain: NonEmptyString.optional(),
  key: NonEmptyString.optional(),
  tagId: NonEmptyString.optional(),
  tagIds: z.array(NonEmptyString).optional(),
  folderId: NonEmptyString.optional(),
  customerId: NonEmptyString.optional(),
  country: NonEmptyString.optional(),
  city: NonEmptyString.optional(),
  device: NonEmptyString.optional(),
  browser: NonEmptyString.optional(),
  os: NonEmptyString.optional(),
  referer: NonEmptyString.optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.enum(["timestamp"]).default("timestamp"),
}).strict();
