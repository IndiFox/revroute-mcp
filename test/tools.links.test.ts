import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { RevrouteClient } from "../src/client/http.js";
import { ToolRegistry } from "../src/tools/_register.js";
import { registerLinkTools } from "../src/tools/links.js";
import { createLogger } from "../src/util/logger.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = "https://api.revroute.test";
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function setup() {
  const client = new RevrouteClient({ apiKey: "dub_test_1234", baseUrl: BASE_URL });
  const reg = new ToolRegistry();
  registerLinkTools(reg);
  return { client, reg };
}

function parseToolResult(r: CallToolResult): unknown {
  const first = r.content[0];
  if (!first || first.type !== "text") return null;
  return JSON.parse(first.text);
}

describe("link tools", () => {
  it("create -> POST /links with body and returns shortLink", async () => {
    let bodyCaptured: unknown;
    server.use(
      http.post(`${BASE_URL}/links`, async ({ request }) => {
        bodyCaptured = await request.json();
        return HttpResponse.json({
          id: "lnk_1",
          url: "https://example.com",
          shortLink: "https://rev.ru/x",
        });
      }),
    );
    const { client, reg } = setup();
    const create = reg.list().find((t) => t.name === "revroute_link_create");
    const result = await create!.handler({ url: "https://example.com" } as any, {
      client,
      logger: createLogger({ debug: false }),
    });
    expect((bodyCaptured as any).url).toBe("https://example.com");
    expect((parseToolResult(result) as any).shortLink).toBe("https://rev.ru/x");
  });

  it("list -> GET /links and includes pagination hint when full page returned", async () => {
    server.use(
      http.get(`${BASE_URL}/links`, () =>
        HttpResponse.json(Array.from({ length: 50 }, (_, i) => ({ id: `lnk_${i}` }))),
      ),
    );
    const { client, reg } = setup();
    const list = reg.list().find((t) => t.name === "revroute_link_list");
    const result = await list!.handler({ page: 1, pageSize: 50, sort: "createdAt", sortOrder: "desc" } as any, {
      client,
      logger: createLogger({ debug: false }),
    });
    const parsed = parseToolResult(result) as any;
    expect(parsed.data).toHaveLength(50);
    expect(parsed.pagination.hasMore).toBe(true);
    expect(parsed._hint).toContain("page=2");
  });

  it("bulk_delete requires confirm: true", async () => {
    const { reg } = setup();
    const bulkDel = reg.list().find((t) => t.name === "revroute_link_bulk_delete");
    expect(() => bulkDel!.inputSchema.parse({ linkIds: ["a", "b"] })).toThrow();
    expect(bulkDel!.inputSchema.parse({ linkIds: ["a", "b"], confirm: true })).toBeTruthy();
  });
});
