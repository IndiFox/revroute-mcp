// API key handling for revroute.ru.
// TODO(revroute-spec): confirm key prefix once revroute publishes its API reference.
// Currently dub-derived: secret keys begin with `dub_`, publishable keys with `dub_pk_`.
const KNOWN_PREFIXES = ["dub_", "revroute_"];

export interface ApiKeyMeta {
  raw: string;
  masked: string;
  isPublishable: boolean;
}

export function parseApiKey(raw: string): ApiKeyMeta {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new Error("API key is empty");
  }
  return {
    raw: trimmed,
    masked: maskSecret(trimmed),
    isPublishable: /_pk_/i.test(trimmed),
  };
}

export function isPlausibleApiKey(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 10) return false;
  return KNOWN_PREFIXES.some((p) => trimmed.toLowerCase().startsWith(p));
}

export function maskSecret(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 8) return "***";
  const last4 = trimmed.slice(-4);
  const prefix = trimmed.split("_").slice(0, -1).join("_");
  if (prefix.length > 0 && prefix.length < trimmed.length) {
    return `${prefix}_***${last4}`;
  }
  return `***${last4}`;
}
