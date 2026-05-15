import { QrGenerateInput } from "../schemas/qr.js";
import { imageContent, jsonContent, type ToolRegistry } from "./_register.js";

interface QrResponse {
  mimeType: string;
  data: string; // base64
}

export function registerQrTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_qr_generate",
    description:
      "Generate a QR-code PNG for an arbitrary URL. Returns the image inline (base64) plus its data URL.",
    inputSchema: QrGenerateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<QrResponse>("/qr", {
        query: {
          url: args.url,
          size: args.size,
          level: args.level,
          fgColor: args.fgColor,
          bgColor: args.bgColor,
          margin: args.margin,
          logo: args.logo,
          hideLogo: args.hideLogo,
        },
        apiKey: ctx.apiKey,
      });

      if (!data || typeof data !== "object" || !("data" in data)) {
        return jsonContent({
          error: "Unexpected response shape from /qr",
          response: data,
        });
      }

      return imageContent(data.mimeType ?? "image/png", data.data);
    },
  });
}
