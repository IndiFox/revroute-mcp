import {
  CustomerCreateInput,
  CustomerDeleteInput,
  CustomerGetInput,
  CustomerListInput,
  CustomerUpdateInput,
} from "../schemas/customer.js";
import type { Customer } from "../types/revroute.js";
import { jsonContent, type ToolRegistry } from "./_register.js";

function customerPath(args: { id?: string; externalId?: string }): string {
  if (args.id) return `/customers/${encodeURIComponent(args.id)}`;
  return `/customers/external/${encodeURIComponent(args.externalId ?? "")}`;
}

export function registerCustomerTools(reg: ToolRegistry): void {
  reg.define({
    name: "revroute_customer_create",
    description: "Create a customer record linked to an externalId from your system.",
    inputSchema: CustomerCreateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.post<Customer>("/customers", args, { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_customer_list",
    description: "List customers in the workspace. Filter by email or search query.",
    inputSchema: CustomerListInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Customer[]>("/customers", {
        query: { ...args },
        apiKey: ctx.apiKey,
      });
      return jsonContent({ data, pagination: { page: args.page, pageSize: args.pageSize } });
    },
  });

  reg.define({
    name: "revroute_customer_get",
    description: "Retrieve a customer by id OR externalId.",
    inputSchema: CustomerGetInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.get<Customer>(customerPath(args), { apiKey: ctx.apiKey });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_customer_update",
    description: "Update fields on an existing customer.",
    inputSchema: CustomerUpdateInput,
    handler: async (args, ctx) => {
      const data = await ctx.client.patch<Customer>(customerPath(args), args.data, {
        apiKey: ctx.apiKey,
      });
      return jsonContent(data);
    },
  });

  reg.define({
    name: "revroute_customer_delete",
    description: "Delete a customer record. Requires confirm: true.",
    inputSchema: CustomerDeleteInput,
    destructive: true,
    handler: async (args, ctx) => {
      const data = await ctx.client.delete<{ id: string }>(customerPath(args), {
        apiKey: ctx.apiKey,
      });
      return jsonContent(data);
    },
  });
}
