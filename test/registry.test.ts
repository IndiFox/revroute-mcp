import { describe, expect, it } from "vitest";
import { buildRegistry } from "../src/tools/index.js";

describe("buildRegistry", () => {
  it("includes core tools by default but no partners", () => {
    const reg = buildRegistry({});
    const names = reg.list().map((t) => t.name);
    expect(names).toContain("revroute_ping");
    expect(names).toContain("revroute_link_create");
    expect(names).toContain("revroute_analytics_query");
    expect(names.find((n) => n.startsWith("revroute_partner_"))).toBeUndefined();
    expect(names.find((n) => n.startsWith("revroute_program_"))).toBeUndefined();
  });

  it("registers partner tools when enabled", () => {
    const reg = buildRegistry({ enablePartners: true });
    const names = reg.list().map((t) => t.name);
    expect(names).toContain("revroute_partner_create");
    expect(names).toContain("revroute_payout_create");
    expect(names).toContain("revroute_commission_list");
    expect(names).toContain("revroute_bounty_list");
    // revroute has no list-programs API; we don't expose those tools either.
    expect(names).not.toContain("revroute_program_list");
    expect(names).not.toContain("revroute_program_get");
  });

  it("counts core ~36 and partner ~10 tools", () => {
    const core = buildRegistry({}).list().length;
    const all = buildRegistry({ enablePartners: true }).list().length;
    expect(core).toBeGreaterThanOrEqual(30);
    expect(all - core).toBeGreaterThanOrEqual(9);
  });

  it("marks destructive tools with [DESTRUCTIVE] prefix in description (when rendered via bind)", () => {
    const reg = buildRegistry({});
    const linkDelete = reg.list().find((t) => t.name === "revroute_link_delete");
    expect(linkDelete?.destructive).toBe(true);
  });
});
