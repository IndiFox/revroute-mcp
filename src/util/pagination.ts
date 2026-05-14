import type { RevrouteClient } from "../client/http.js";

export interface PaginatedFetchOptions {
  path: string;
  query?: Record<string, string | number | boolean | string[] | undefined | null>;
  apiKey?: string;
  maxItems?: number;
  pageSize?: number;
}

// Iteratively fetches paginated results from revroute until either `maxItems` is reached or
// the upstream returns fewer items than `pageSize`. Used by analytics auto-paginate.
// Other resources should return raw pagination metadata so the caller (LLM) can decide.
export async function fetchAllPages<T>(
  client: RevrouteClient,
  opts: PaginatedFetchOptions,
): Promise<{ data: T[]; pages: number; truncated: boolean }> {
  const max = opts.maxItems ?? 5000;
  const pageSize = opts.pageSize ?? 100;
  const all: T[] = [];
  let page = 1;
  let truncated = false;

  while (all.length < max) {
    const query = { ...opts.query, page, pageSize };
    const chunk = await client.get<T[]>(opts.path, { query, apiKey: opts.apiKey });
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    const room = max - all.length;
    if (chunk.length > room) {
      all.push(...chunk.slice(0, room));
      truncated = true;
      break;
    }
    all.push(...chunk);
    if (chunk.length < pageSize) break;
    page += 1;
  }

  return { data: all, pages: page, truncated };
}
