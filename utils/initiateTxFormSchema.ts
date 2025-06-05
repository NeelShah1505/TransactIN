import { z } from "zod";

// Define the schema for transaction form validation
export const formSchemaTransaction = z.object({
  receiver: z.string().min(1, { message: "Receiver address is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  token: z.string().min(1, { message: "Token address is required" }).optional(),
});

// Define the schema for loading token details validation
export const formSchemaLoadToken = z.object({
  token: z.string().min(1, { message: "Token address is required" }),
});

// Define TypeScript types for the schemas
export type FormSchemaTransaction = z.infer<typeof formSchemaTransaction>;
export type FormSchemaLoadToken = z.infer<typeof formSchemaLoadToken>;
