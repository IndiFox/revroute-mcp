import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { RevrouteClient } from "../src/client/http.js";
import { ToolRegistry } from "../src/tools/_register.js";
import { registerLinkTools } from "../src/tools/links.js";
import { registerWorkspaceTools } from "../src/tools/workspaces.js";
import { createLogger } from "../src/util/logger.js";

const BASE_URL = "https://app.revroute.test/api";
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Recorded from a real revroute response on 2026-05-14. Used to verify the tool layer
// passes the data through verbatim and our Link interface stays in sync with reality.
const realLink = {
  id: "link_1KQA9HKX0FT3DBSC2ATREGFHD",
  domain: "link.revroute.ru",
  key: "7UspWDf",
  url: "https://google.com",
  shortLink: "https://link.revroute.ru/7UspWDf",
  archived: false,
  expiresAt: null,
  expiredUrl: null,
  disabledAt: null,
  password: null,
  trackConversion: false,
  proxy: false,
  title: "Google",
  description: "Search the world's information.",
  image: null,
  video: null,
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_term: null,
  utm_content: null,
  rewrite: false,
  linkRetentionCleanupDisabledAt: null,
  doIndex: false,
  ios: null,
  android: null,
  geo: null,
  testVariants: null,
  testStartedAt: null,
  testCompletedAt: null,
  userId: "user_1KKQ3MN8JFQVNBFE1BZEHV5A3",
  projectId: "ws_1KJJ4809MQENPPXR7KF1MZ4KS",
  folderId: null,
  externalId: null,
  tenantId: null,
  publicStats: false,
  clicks: 1,
  leads: 0,
  conversions: 0,
  sales: 0,
  saleAmount: 0,
  lastClicked: "2026-04-28T14:58:17.000Z",
  createdAt: "2026-04-28T14:57:57.666Z",
  updatedAt: "2026-04-28T14:57:57.666Z",
  comments: null,
  programId: null,
  partnerId: null,
  tags: [],
  identifier: null,
  tagId: null,
  webhookIds: [],
  qrCode: "https://api.revroute.ru/qr?url=https://link.revroute.ru/7UspWDf?qr=1",
  workspaceId: "ws_1KJJ4809MQENPPXR7KF1MZ4KS",
};

function setup() {
  const client = new RevrouteClient({ apiKey: "revroute_test_1234", baseUrl: BASE_URL });
  const reg = new ToolRegistry();
  registerLinkTools(reg);
  registerWorkspaceTools(reg);
  return { client, reg };
}

function parsed(r: CallToolResult): any {
  const first = r.content[0];
  if (!first || first.type !== "text") return null;
  return JSON.parse(first.text);
}

describe("real-shape compatibility", () => {
  it("link_list passes through all revroute-specific fields untouched", async () => {
    server.use(http.get(`${BASE_URL}/links`, () => HttpResponse.json([realLink])));
    const { client, reg } = setup();
    const tool = reg.list().find((t) => t.name === "revroute_link_list")!;
    const out = parsed(
      await tool.handler({ page: 1, pageSize: 50, sort: "createdAt", sortOrder: "desc" } as any, {
        client,
        logger: createLogger({ debug: false }),
      }),
    );
    const link = out.data[0];
    // revroute-specific fields verified against a live API response
    expect(link.disabledAt).toBeNull();
    expect(link.video).toBeNull();
    expect(link.utm_source).toBeNull();
    expect(link.testVariants).toBeNull();
    expect(link.conversions).toBe(0);
    expect(link.programId).toBeNull();
    expect(link.partnerId).toBeNull();
    expect(link.webhookIds).toEqual([]);
    expect(link.tags).toEqual([]);
    expect(link.identifier).toBeNull();
    // QR code points to the separate api.revroute.ru host
    expect(link.qrCode).toMatch(/^https:\/\/api\.revroute\.ru\/qr\?/);
  });

  it("link_create returns the full revroute shape", async () => {
    server.use(http.post(`${BASE_URL}/links`, () => HttpResponse.json(realLink)));
    const { client, reg } = setup();
    const tool = reg.list().find((t) => t.name === "revroute_link_create")!;
    const out = parsed(
      await tool.handler({ url: "https://google.com" } as any, {
        client,
        logger: createLogger({ debug: false }),
      }),
    );
    expect(out.id).toBe("link_1KQA9HKX0FT3DBSC2ATREGFHD");
    expect(out.workspaceId).toBe("ws_1KJJ4809MQENPPXR7KF1MZ4KS");
    expect(out.shortLink).toContain("link.revroute.ru");
  });

  it("workspace_get with slug hits /workspaces/{slug}", async () => {
    let urlSeen = "";
    server.use(
      http.get(`${BASE_URL}/workspaces/acme`, ({ request }) => {
        urlSeen = request.url;
        return HttpResponse.json({ id: "ws_acme", name: "Acme", slug: "acme", plan: "pro" });
      }),
    );
    const { client, reg } = setup();
    const tool = reg.list().find((t) => t.name === "revroute_workspace_get")!;
    const out = parsed(
      await tool.handler({ slug: "acme" } as any, {
        client,
        logger: createLogger({ debug: false }),
      }),
    );
    expect(urlSeen).toContain("/workspaces/acme");
    expect(out.slug).toBe("acme");
  });

  it("workspace_get without slug lists all workspaces", async () => {
    server.use(
      http.get(`${BASE_URL}/workspaces`, () =>
        HttpResponse.json([{ id: "ws_a", name: "A", slug: "a" }]),
      ),
    );
    const { client, reg } = setup();
    const tool = reg.list().find((t) => t.name === "revroute_workspace_get")!;
    const out = parsed(
      await tool.handler({} as any, { client, logger: createLogger({ debug: false }) }),
    );
    expect(Array.isArray(out)).toBe(true);
    expect(out[0].slug).toBe("a");
  });
});
