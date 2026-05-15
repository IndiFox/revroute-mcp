# Changelog

All notable changes to this project will be documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Until version `1.0.0`, breaking changes may land in minor releases. Watch this file before
upgrading.

## [Unreleased]

## [0.2.0] - 2026-05-15

### Added
- `.dxt` bundle for one-click install in Claude Desktop, attached to every GitHub Release.
  Users can drag the file into Claude Desktop instead of editing JSON config.
- `scripts/pack-dxt.mjs` + `pnpm dxt:pack` for local DXT building.
- `.github/workflows/release-dxt.yml` builds the `.dxt` on every `v*` tag and uploads it as
  a GitHub Release asset.
- Root-level `manifest.json` (DXT v0.2 schema) with full tool catalog, `user_config` for
  API key / base URL / partner-flag, and embedded icon.
- `icon.png` for Claude Desktop Extensions UI.

### Changed
- `vitest` 2.1 → 4.1; `vite` added as explicit dev dependency at `^6.0.0`.
- `typescript` 5.9 → 6.0 (silenced `baseUrl` deprecation via `ignoreDeprecations: "6.0"` —
  the option is injected by tsup's DTS step, not our config).
- `@biomejs/biome` 1.9 → 2.4 (config migrated to v2 schema; 18 files reformatted under the
  new `organizeImports` assistant).
- `zod` 3.25 → 4.4; JSON Schema generation now uses zod's built-in `z.toJSONSchema()`.
- `commander` 12 → 14.
- GitHub Actions bumped: `actions/checkout`, `actions/setup-node`, `pnpm/action-setup` all to v6.
- `.github/dependabot.yml` ignores major version bumps automatically (security updates still
  arrive via repo-level automated-security-fixes).

### Removed
- Runtime dependency `zod-to-json-schema` (replaced by zod 4's built-in).

## [0.1.0] - 2026-05-14
- First public release on npm.
- Initial implementation of the RevRoute MCP server.
- Stdio and Streamable HTTP transports.
- Tool coverage for Links, Analytics, Domains, Tags, Folders, Customers, Events, Metatags, QR,
  Workspaces, and Track.
- Optional partner-program tools, gated by `REVROUTE_ENABLE_PARTNERS=1`.
