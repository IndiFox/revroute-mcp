# Contributing to revroute-mcp

Thanks for taking the time to contribute! This project follows a lightweight, "small changes
move fast" workflow.

## Getting set up

Requirements: Node ≥ 20, pnpm ≥ 9.

```bash
git clone https://github.com/IndiFox/revroute-mcp.git
cd revroute-mcp
pnpm install
cp .env.example .env       # paste your REVROUTE_API_KEY
pnpm dev                   # tsx watch
```

The local stdio loop accepts JSON-RPC on stdin. For interactive testing point the
[MCP Inspector](https://github.com/modelcontextprotocol/inspector) at it:

```bash
npx -y @modelcontextprotocol/inspector node dist/index.js
```

## Before opening a PR

```bash
pnpm typecheck    # must be clean
pnpm test         # all green
pnpm lint         # biome
pnpm build        # tsup
```

A passing CI matrix (Node 20 & 22) is required before merge.

## Adding a new tool

1. Define the zod input schema in `src/schemas/<resource>.ts`. Mark destructive inputs with a
   `confirm: z.literal(true)` field.
2. Add a handler in `src/tools/<resource>.ts` via `reg.define({ name, description, inputSchema, handler, destructive? })`.
3. Use `revroute_<resource>_<action>` for the name (snake_case, prefixed).
4. Map any new HTTP error shape in `src/client/errors.ts` if needed.
5. Add a unit test in `test/tools.<resource>.test.ts` mocking the upstream API with `msw`.

## Reporting issues

Use the templates under [`.github/ISSUE_TEMPLATE`](.github/ISSUE_TEMPLATE) — they collect the
context we need to reproduce quickly.

For security issues, **do not** open a public issue. See [SECURITY.md](SECURITY.md).

## Commit & branch style

- Branches: `feat/short-description`, `fix/short-description`, `docs/...`.
- Commit subjects in [Conventional Commits](https://www.conventionalcommits.org/) style:
  `feat: …`, `fix: …`, `docs: …`, `chore: …`, `refactor: …`, `test: …`.
- Keep PRs focused. Big changes welcome — but split refactors from behaviour changes when
  practical.

## License

By contributing you agree your work is licensed under the [MIT License](LICENSE).
