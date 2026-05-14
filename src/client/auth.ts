// API key handling for revroute.ru.
// Accepted prefixes are based on the keys revroute currently issues; new prefixes may
// be added here without breaking existing keys.
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
