import { z } from "zod";
import { HexColor, NonEmptyString } from "./common.js";

export const QrGenerateInput = z
  .object({
    url: NonEmptyString.url().describe("URL to encode in the QR image"),
    size: z.number().int().min(64).max(2048).default(600).describe("Pixel size (square)"),
    level: z.enum(["L", "M", "Q", "H"]).default("L").describe("Error correction level"),
    fgColor: HexColor.optional().describe("Foreground color, e.g. #000000"),
    bgColor: HexColor.optional().describe("Background color, e.g. #FFFFFF"),
    margin: z.number().int().min(0).max(40).optional(),
    logo: NonEmptyString.url().optional().describe("Logo URL to embed in the QR center"),
    hideLogo: z.boolean().optional(),
  })
  .strict();
