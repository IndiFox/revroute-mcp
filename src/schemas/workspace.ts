import { z } from "zod";
import { NonEmptyString } from "./common.js";

export const WorkspaceGetInput = z
  .object({
    slug: NonEmptyString.optional().describe(
      "Workspace slug (e.g. `acme`). If omitted, returns the list of workspaces the API key has access to.",
    ),
    idOrSlug: NonEmptyString.optional().describe(
      "Workspace ID (e.g. `ws_xxx`) or slug. Alias for `slug` — either field works.",
    ),
  })
  .strict();
