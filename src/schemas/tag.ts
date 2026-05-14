import { z } from "zod";
import { HexColor, NonEmptyString, PaginationInput, SortOrderInput } from "./common.js";

const TagColor = z.enum(["red", "yellow", "green", "blue", "purple", "pink", "brown"]).or(HexColor);

const TagCore = z.object({
  name: NonEmptyString,
  color: TagColor.optional(),
});

export const TagCreateInput = TagCore.strict();

export const TagUpdateInput = z.object({ id: NonEmptyString, data: TagCore.partial() }).strict();

export const TagDeleteInput = z.object({ id: NonEmptyString, confirm: z.literal(true) }).strict();

export const TagListInput = PaginationInput.extend({
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "name"]).optional(),
  sortOrder: SortOrderInput,
}).strict();
