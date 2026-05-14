# revroute-mcp

[![npm](https://img.shields.io/npm/v/revroute-mcp.svg)](https://www.npmjs.com/package/revroute-mcp)
[![CI](https://github.com/IndiFox/revroute-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/IndiFox/revroute-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Model Context Protocol (MCP) server for **[revroute.ru](https://revroute.ru)** — short links,
analytics, custom domains, tags, customers, and conversion tracking. Compatible with the dub.co
API surface; revroute is the Russian-hosted equivalent.

Drop it into Claude Desktop, Claude Code, Cursor, or any MCP-aware client, and your model can
create short links, read analytics, manage domains, and trigger conversion events on your behalf.

> **Status:** v0.1 (pre-1.0). Breaking changes may land in minor versions until 1.0.0. See
> [CHANGELOG.md](CHANGELOG.md).

## Quickstart

### 1. Get an API key

Sign in to revroute.ru → workspace settings → API keys → create a key with the scopes you need.
The key looks like `dub_xxxxxxxxxxxx` (legacy prefix inherited from the underlying dub.co
codebase; revroute may migrate to `revroute_` prefix in the future — both are accepted).

### 2. Wire it up

**Claude Desktop** (`~/.config/Claude/claude_desktop_config.json` or
`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "revroute": {
      "command": "npx",
      "args": ["-y", "revroute-mcp"],
      "env": { "REVROUTE_API_KEY": "dub_xxxxx" }
    }
  }
}
```

**Claude Code:**

```bash
claude mcp add revroute --env REVROUTE_API_KEY=dub_xxxxx -- npx -y revroute-mcp
```

**Cursor:** same JSON as Claude Desktop, in `.cursor/mcp.json` (project) or `~/.cursor/mcp.json`
(global).

See [`examples/`](examples/) for ready-to-copy snippets.

### 3. Try it

```
You: create a short link to https://example.com tagged "launch"
Claude: [calls revroute_link_create] → https://rev.ru/abc123
```

## Environment

| Variable                    | Required | Default                   | Description                                                |
| --------------------------- | -------- | ------------------------- | ---------------------------------------------------------- |
| `REVROUTE_API_KEY`          | yes¹     | —                         | Workspace API key. ¹Not needed if running HTTP transport.  |
| `REVROUTE_API_BASE_URL`     | no       | `https://app.revroute.ru/api` | Override for staging / on-premise.                         |
| `REVROUTE_ENABLE_PARTNERS`  | no       | `0`                       | Set to `1` to expose partner-program tools.                |
| `REVROUTE_DEBUG`            | no       | `0`                       | Verbose request tracing to stderr (headers masked).        |
| `REVROUTE_HTTP_HOST`        | no       | `127.0.0.1`               | HTTP transport bind host.                                  |
| `REVROUTE_HTTP_PORT`        | no       | `8787`                    | HTTP transport port.                                       |
| `REVROUTE_CORS_ORIGIN`      | no       | `*`                       | Comma-separated origin allowlist for the HTTP transport.   |

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

### Partner program (opt-in via `REVROUTE_ENABLE_PARTNERS=1`)

Programs, Partners, Commissions, Bounties, Payouts. 12 additional tools that handle the
affiliate / referral side of revroute. Hidden by default to keep `tools/list` lean for users
who don't run a partner program.

## Manual smoke test (post-install)

Run through these six checks once after installing or upgrading:

1. **List tools:** `npx -y @modelcontextprotocol/inspector npx -y revroute-mcp` →
   `tools/list` returns ~35 tools (or ~47 with partners).
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

## API compatibility

revroute.ru mirrors the public dub.co API 1:1 by design — endpoints, request shapes, and error
formats are intended to be drop-in compatible. This MCP server is built against that contract.
Until revroute publishes its own full OpenAPI spec, internal types are derived from the dub.co
SDK and flagged `TODO(revroute-spec)` for verification.

This project is **independent**: it is not affiliated with [Dub Inc.](https://dub.co); the dub
trademark and dub.co API design belong to its respective owners.

## License

MIT — see [LICENSE](LICENSE).
