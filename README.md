<p align="center">
  <a href="https://revroute.ru">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/wordmark-dark.svg">
      <img src="assets/wordmark-light.svg" alt="revroute" height="56">
    </picture>
  </a>
</p>

<h1 align="center">revroute-mcp</h1>

<p align="center">
  <strong>The official Model Context Protocol (MCP) server for <a href="https://revroute.ru">revroute.ru</a>.</strong>
  <br/>
  Give any LLM full control over your short links, analytics, custom domains, and affiliate / referral program.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/revroute-mcp"><img src="https://img.shields.io/npm/v/revroute-mcp.svg" alt="npm"></a>
  <a href="https://github.com/IndiFox/revroute-mcp/actions/workflows/ci.yml"><img src="https://github.com/IndiFox/revroute-mcp/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
</p>

---

## What you can do with it

Plug `revroute-mcp` into Claude Desktop, Claude Code, Cursor, or any MCP-aware client, and your
AI assistant can manage **every part** of your revroute workspace through natural language:

### 🔗 Short links & domains
- Create, list, search, update, archive, and delete short links one-by-one or in batches of up to 100
- Bulk import campaigns, upsert by URL, look up by id / externalId / domain+key
- Manage custom domains, check availability, configure placeholder & expired-URL fallbacks
- Organize links with **tags** and **folders**

### 📊 Analytics & conversion tracking
- Aggregate clicks, leads, sales, and revenue across any time window
- Group by country, city, device, browser, OS, referer, UTM source / medium / campaign / term / content, top links, top URLs
- Stream raw events for fine-grained analysis
- Generate QR codes for any link (returned inline as base64 PNG)
- Fire `track_lead` / `track_sale` events to attribute conversions back to a click

### 🤝 Affiliate & referral / partner program
- Browse and manage **partners** (invite, approve, ban, reject, update details)
- Track **commissions** by partner, customer, or invoice — change status (approve, mark fraud, refund)
- Define **bounties** (one-off rewards, performance- or submission-based) with date windows and reward amounts
- List and initiate **payouts**, filtered by partner, status, or invoice
- Inspect partner social profile, lifetime-value metrics, conversion rates, and earnings-per-click

### 👥 Customers
- CRUD customer records, look up by external id from your own CRM, search by email

### 🛠 Two transports
- **stdio** — zero-config for Claude Desktop / Claude Code / Cursor via `npx`
- **Streamable HTTP** — for remote / hosted MCP scenarios with per-request `Authorization: Bearer` auth

> **Status:** v0.1 (pre-1.0). Breaking changes may land in minor versions until 1.0.0. See
> [CHANGELOG.md](CHANGELOG.md).

## Quickstart

### 1. Get an API key

Sign in to revroute.ru → workspace settings → API keys → create a key with the scopes you need.

### 2. Wire it up

**Claude Desktop** (`~/.config/Claude/claude_desktop_config.json` or
`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "revroute": {
      "command": "npx",
      "args": ["-y", "revroute-mcp"],
      "env": {
        "REVROUTE_API_KEY": "<your-revroute-api-key>",
        "REVROUTE_ENABLE_PARTNERS": "1"
      }
    }
  }
}
```

> Set `REVROUTE_ENABLE_PARTNERS=1` only if you actively run a partner / affiliate program —
> otherwise the 10 partner tools stay hidden and `tools/list` stays lean.

**Claude Code:**

```bash
claude mcp add revroute \
  --env REVROUTE_API_KEY=<your-revroute-api-key> \
  --env REVROUTE_ENABLE_PARTNERS=1 \
  -- npx -y revroute-mcp
```

**Cursor:** same JSON as Claude Desktop, in `.cursor/mcp.json` (project) or `~/.cursor/mcp.json`
(global).

See [`examples/`](examples/) for ready-to-copy snippets.

### 3. Try it

```
You: create a short link to https://example.com tagged "launch"
Claude: [calls revroute_link_create] → https://rev.ru/abc123

You: which partners brought us the most revenue last month?
Claude: [calls revroute_partner_list sorted by netRevenue] → top 5 partners by sales

You: what's the click-to-conversion rate broken down by country, last 30 days?
Claude: [calls revroute_analytics_query groupBy="countries"] → table
```

## Environment

| Variable                    | Required | Default                       | Description                                                |
| --------------------------- | -------- | ----------------------------- | ---------------------------------------------------------- |
| `REVROUTE_API_KEY`          | yes¹     | —                             | Workspace API key. ¹Not needed if running HTTP transport.  |
| `REVROUTE_API_BASE_URL`     | no       | `https://app.revroute.ru/api` | Override for staging / on-premise.                         |
| `REVROUTE_ENABLE_PARTNERS`  | no       | `0`                           | Set to `1` to expose the 10 partner-program tools.         |
| `REVROUTE_DEBUG`            | no       | `0`                           | Verbose request tracing to stderr (headers masked).        |
| `REVROUTE_HTTP_HOST`        | no       | `127.0.0.1`                   | HTTP transport bind host.                                  |
| `REVROUTE_HTTP_PORT`        | no       | `8787`                        | HTTP transport port.                                       |
| `REVROUTE_CORS_ORIGIN`      | no       | `*`                           | Comma-separated origin allowlist for the HTTP transport.   |

## Transports

### stdio (default)

```
npx -y revroute-mcp
```

For Claude Desktop / Claude Code / Cursor / any MCP client that spawns a subprocess.

### Streamable HTTP

```
revroute-mcp --transport http --port 8787 --host 0.0.0.0
```

The HTTP transport authenticates per request — the MCP client must include
`Authorization: Bearer <revroute_api_key>` on every call. No env-side key is required.

Sessions live in memory and time out after 30 minutes of inactivity. CORS defaults to `*`;
tighten with `--cors-origin https://your.app`.

OAuth / Dynamic Client Registration is on the roadmap for `v0.3`.

## Tool catalog

Every tool name is prefixed with `revroute_` to avoid collisions when multiple short-link MCP
servers are connected at once. Tools marked **destructive** require an explicit
`confirm: true` argument and are tagged `[DESTRUCTIVE]` in `tools/list`.

### Links (10)

- `revroute_link_create` — create a short link
- `revroute_link_upsert` — create or update by URL
- `revroute_link_list` — paginated listing with filters
- `revroute_link_get` — fetch by id, externalId, or domain+key
- `revroute_link_update` — partial update
- `revroute_link_delete` — **destructive**
- `revroute_link_bulk_create` — up to 100 in one call
- `revroute_link_bulk_update` — up to 100 in one call
- `revroute_link_bulk_delete` — **destructive**, up to 100
- `revroute_link_count` — count with optional grouping

### Analytics (1 unified tool)

- `revroute_analytics_query` — aggregate across the workspace. The `groupBy` parameter
  controls the dimension: `count`, `timeseries`, `countries`, `cities`, `devices`, `browsers`,
  `os`, `referers`, `top_links`, `top_urls`, `utm_*`, etc. Use either an `interval`
  (`24h`/`7d`/`30d`/`90d`/`ytd`/`1y`/`all`) **or** explicit `start`+`end`.

### Domains (5)

- `revroute_domain_create`, `_list`, `_update`, `_delete` (**destructive**),
  `_check_availability`

### Tags (4)

- `revroute_tag_create`, `_list`, `_update`, `_delete` (**destructive**)

### Folders (4)

- `revroute_folder_create`, `_list`, `_update`, `_delete` (**destructive**)

### Customers (5)

- `revroute_customer_create`, `_list`, `_get`, `_update`, `_delete` (**destructive**)

### Events (1)

- `revroute_event_list` — paginated raw event stream with filters

### Misc

- `revroute_metatags_get` — og:title / og:description / og:image for a URL
- `revroute_qr_generate` — returns inline base64 PNG
- `revroute_workspace_get` — current workspace info
- `revroute_track_lead` — **destructive** (billable, real-data only)
- `revroute_track_sale` — **destructive** (billable, real-data only)
- `revroute_ping` — health check

### Partner / affiliate / referral program (opt-in via `REVROUTE_ENABLE_PARTNERS=1`)

10 additional tools for the full affiliate / referral / partner side of revroute. Hidden by
default to keep `tools/list` lean for workspaces that don't run a program.

- `revroute_partner_create`, `_list`, `_get`, `_update` — invite, list, retrieve, update
  partners (approve / ban / reject / change details). Returns rich shape: lifetime metrics
  (totalClicks, totalLeads, totalConversions, totalSales, totalSaleAmount, netRevenue,
  earningsPerClick, averageLifetimeValue, conversion rates), social profile, embedded links.
- `revroute_commission_list` / `_update` — track commissions by partner, customer, status, or
  type; change status (approve, mark fraud, refund) and adjust amounts.
- `revroute_bounty_list` / `_bounty_create` — one-off rewards (performance- or
  submission-based), with date windows and reward amounts.
- `revroute_payout_list` / `_payout_create` (**destructive — billable**) — list and initiate
  payouts to partners; filter by partner, status, invoice.

## Manual smoke test (post-install)

Run through these six checks once after installing or upgrading:

1. **List tools:** `npx -y @modelcontextprotocol/inspector npx -y revroute-mcp` →
   `tools/list` returns ~36 tools (or ~46 with partners enabled).
2. **Create a link:** call `revroute_link_create` with `{ "url": "https://example.com" }` —
   expect a `shortLink` in the response.
3. **List links:** call `revroute_link_list` — expect your test link in `data`.
4. **Analytics:** call `revroute_analytics_query` with `{ "groupBy": "count", "interval": "7d" }` —
   expect a numeric object.
5. **Delete the test link:** call `revroute_link_delete` with `{ "id": "...", "confirm": true }` —
   expect a 200.
6. **Bad key:** unset `REVROUTE_API_KEY`, call any tool — expect a clear `-32001` error.

## Development

```
pnpm install
pnpm dev       # tsx watch
pnpm typecheck
pnpm test
pnpm build
```

Tests use [Vitest](https://vitest.dev) and [MSW](https://mswjs.io) to mock the upstream API.

## License

MIT — see [LICENSE](LICENSE).
