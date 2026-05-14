import { describe, expect, it } from "vitest";

import {
  LinkBulkDeleteInput,
  LinkCreate,
  LinkIdInput,
  LinkListInput,
} from "../src/schemas/link.js";
import { AnalyticsQueryInput } from "../src/schemas/analytics.js";

describe("LinkCreate", () => {
  it("accepts a minimal payload", () => {
    expect(LinkCreate.parse({ url: "https://example.com/abc" }).url).toBe(
      "https://example.com/abc",
    );
  });

  it("rejects an invalid URL", () => {
    expect(() => LinkCreate.parse({ url: "not-a-url" })).toThrow();
  });

  it("rejects unknown fields (strict)", () => {
    expect(() => LinkCreate.parse({ url: "https://x.test", surprise: 1 })).toThrow();
  });
});

describe("LinkIdInput", () => {
  it("accepts id alone", () => {
    expect(LinkIdInput.parse({ id: "lnk_1" }).id).toBe("lnk_1");
  });

  it("accepts externalId alone", () => {
    expect(LinkIdInput.parse({ externalId: "user_42" }).externalId).toBe("user_42");
  });

  it("accepts domain+key together", () => {
    expect(LinkIdInput.parse({ domain: "rev.ru", key: "promo" }).key).toBe("promo");
  });

  it("rejects when domain is provided without key", () => {
    expect(() => LinkIdInput.parse({ domain: "rev.ru" })).toThrow();
  });
});

describe("LinkBulkDeleteInput", () => {
  it("requires confirm: true", () => {
    expect(() => LinkBulkDeleteInput.parse({ linkIds: ["a"] })).toThrow();
    expect(() => LinkBulkDeleteInput.parse({ linkIds: ["a"], confirm: false })).toThrow();
    expect(LinkBulkDeleteInput.parse({ linkIds: ["a"], confirm: true }).confirm).toBe(true);
  });

  it("caps the batch at 100", () => {
    const linkIds = Array.from({ length: 101 }, (_, i) => `id_${i}`);
    expect(() => LinkBulkDeleteInput.parse({ linkIds, confirm: true })).toThrow();
  });
});

describe("LinkListInput", () => {
  it("defaults page and pageSize", () => {
    const parsed = LinkListInput.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(50);
    expect(parsed.sortOrder).toBe("desc");
  });
});

describe("AnalyticsQueryInput", () => {
  it("defaults groupBy and maxItems", () => {
    const parsed = AnalyticsQueryInput.parse({});
    expect(parsed.groupBy).toBe("count");
    expect(parsed.maxItems).toBe(5000);
  });

  it("rejects interval combined with start/end", () => {
    expect(() =>
      AnalyticsQueryInput.parse({ interval: "7d", start: "2026-01-01" }),
    ).toThrow();
  });

  it("rejects unknown groupBy values", () => {
    expect(() => AnalyticsQueryInput.parse({ groupBy: "moon_phases" })).toThrow();
  });
});
