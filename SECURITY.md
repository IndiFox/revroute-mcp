# Security policy

## Supported versions

Until `1.0.0`, only the latest published `0.x` release receives security fixes. Older `0.x`
versions are not patched — please upgrade.

| Version | Supported          |
| ------- | ------------------ |
| `0.x` (latest) | ✅          |
| `< latest 0.x` | ❌          |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Instead, use GitHub's private vulnerability reporting:

1. Go to https://github.com/IndiFox/revroute-mcp/security/advisories/new
2. Describe the issue, including:
   - Affected version(s)
   - Steps to reproduce or a proof-of-concept
   - Impact (data exposure, RCE, privilege escalation, etc.)
   - Any suggested mitigation

You should receive an acknowledgement within **3 business days**. We aim to ship a fix or
mitigation within **14 days** for high-severity issues. Once a fix is published, we'll credit
you in the release notes unless you prefer to remain anonymous.

## Out of scope

- Vulnerabilities in upstream dependencies that already have a CVE — please report them to
  the dependency owner directly. We'll bump the version as part of routine maintenance.
- Issues that require local access to the user's machine (e.g. reading a `REVROUTE_API_KEY`
  from an attacker-readable env file) — this is by design; protect your env as you would any
  secret.
- Issues in `revroute.ru` itself or its API — please report those to revroute directly.

## Handling of secrets

revroute-mcp never persists `REVROUTE_API_KEY` to disk. It is read from the process
environment at startup (stdio transport) or per-request from `Authorization` headers
(HTTP transport). Debug logs mask the key as `dub_***<last4>`.
