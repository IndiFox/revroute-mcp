import { z } from "zod";
import { NonEmptyString, PaginationInput } from "./common.js";

const FolderCore = z.object({
  name: NonEmptyString,
  accessLevel: z.enum(["read", "write"]).optional(),
});

export const FolderCreateInput = FolderCore.strict();

export const FolderUpdateInput = z
  .object({ id: NonEmptyString, data: FolderCore.partial() })
  .strict();

export const FolderDeleteInput = z
  .object({ id: NonEmptyString, confirm: z.literal(true) })
  .strict();

export const FolderListInput = PaginationInput.extend({
  search: z.string().optional(),
}).strict();
