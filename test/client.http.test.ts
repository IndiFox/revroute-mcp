import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse, delay } from "msw";
import { setupServer } from "msw/node";

import { RevrouteClient } from "../src/client/http.js";
import { RevrouteApiError } from "../src/client/errors.js";

const BASE_URL = "https://api.revroute.test";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeClient(overrides: Partial<ConstructorParameters<typeof RevrouteClient>[0]> = {}) {
  return new RevrouteClient({
    apiKey: "revroute_test_secret_1234",
    baseUrl: BASE_URL,
    maxRetries: 2,
    ...overrides,
  });
}

describe("RevrouteClient", () => {
  it("sends the Bearer header and parses JSON responses", async () => {
    let seenAuth: string | null = null;
    server.use(
      http.get(`${BASE_URL}/links/abc`, ({ request }) => {
        seenAuth = request.headers.get("authorization");
        return HttpResponse.json({ id: "abc", url: "https://example.com" });
      }),
    );

    const client = makeClient();
    const result = await client.get<{ id: string }>("/links/abc");
    expect(result.id).toBe("abc");
    expect(seenAuth).toBe("Bearer revroute_test_secret_1234");
  });

  it("retries on 429 honoring Retry-After (seconds)", async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE_URL}/links`, () => {
        calls += 1;
        if (calls === 1) {
          return new HttpResponse(JSON.stringify({ error: { message: "slow down" } }), {
            status: 429,
            headers: { "retry-after": "0", "content-type": "application/json" },
          });
        }
        return HttpResponse.json([{ id: "x" }]);
      }),
    );

    const client = makeClient();
    const start = Date.now();
    const result = await client.get<unknown[]>("/links");
    expect(calls).toBe(2);
    expect(Array.isArray(result)).toBe(true);
    expect(Date.now() - start).toBeLessThan(2000);
  });

  it("does not retry on 4xx (other than 429)", async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE_URL}/links/missing`, () => {
        calls += 1;
        return new HttpResponse(
          JSON.stringify({ error: { code: "not_found", message: "no such link", doc_url: "https://docs/x" } }),
          { status: 404, headers: { "content-type": "application/json" } },
        );
      }),
    );

    const client = makeClient();
    await expect(client.get("/links/missing")).rejects.toMatchObject({
      status: 404,
      message: expect.stringContaining("no such link"),
      docUrl: "https://docs/x",
    });
    expect(calls).toBe(1);
  });

  it("retries on 5xx then surfaces the original error", async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE_URL}/flaky`, async () => {
        calls += 1;
        await delay(0);
        return new HttpResponse(JSON.stringify({ message: "boom" }), {
          status: 503,
          headers: { "content-type": "application/json" },
        });
      }),
    );

    const client = makeClient({ maxRetries: 2 });
    await expect(client.get("/flaky")).rejects.toBeInstanceOf(RevrouteApiError);
    expect(calls).toBe(3);
  }, 30_000);

  it("throws when no API key is configured", async () => {
    const client = new RevrouteClient({ baseUrl: BASE_URL });
    await expect(client.get("/links")).rejects.toMatchObject({ status: 401 });
  });

  it("serializes array query params with repeated keys", async () => {
    let seenUrl = "";
    server.use(
      http.get(`${BASE_URL}/links`, ({ request }) => {
        seenUrl = request.url;
        return HttpResponse.json([]);
      }),
    );
    const client = makeClient();
    await client.get("/links", { query: { tagIds: ["a", "b"], page: 1 } });
    expect(seenUrl).toContain("tagIds=a");
    expect(seenUrl).toContain("tagIds=b");
    expect(seenUrl).toContain("page=1");
  });
});
