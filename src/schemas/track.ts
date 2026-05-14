import { z } from "zod";
import { NonEmptyString } from "./common.js";

export const TrackLeadInput = z
  .object({
    clickId: NonEmptyString.describe("Click ID cookie value from the visitor's browser"),
    eventName: NonEmptyString.describe("Human-readable label, e.g. 'Signup completed'"),
    eventQuantity: z.number().int().min(1).optional(),
    externalId: NonEmptyString.describe("Stable customer identifier from your system"),
    customerName: z.string().optional(),
    customerEmail: NonEmptyString.email().optional(),
    customerAvatar: NonEmptyString.url().optional(),
    mode: z.enum(["async", "wait", "deferred"]).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const TrackSaleInput = z
  .object({
    externalId: NonEmptyString.describe("Customer external ID set during track_lead"),
    customerId: NonEmptyString.optional(),
    amount: z
      .number()
      .int()
      .min(0)
      .describe("Sale amount in the smallest currency unit (e.g. kopecks)"),
    currency: NonEmptyString.default("RUB"),
    eventName: NonEmptyString.describe("Human-readable label, e.g. 'Purchase'"),
    paymentProcessor: z.enum(["stripe", "shopify", "paddle", "polar", "custom"]).default("custom"),
    invoiceId: NonEmptyString.optional(),
    leadEventName: NonEmptyString.optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();
