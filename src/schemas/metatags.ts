import { z } from "zod";
import { NonEmptyString } from "./common.js";

export const MetatagsGetInput = z
  .object({
    url: NonEmptyString.url().describe("URL to fetch og:title / og:description / og:image for"),
  })
  .strict();
