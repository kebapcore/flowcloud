import { z } from "zod";

// Configuration Schemas
export const allowedConfigSchema = z.object({
  allowedHosts: z.array(z.string()),
  devMode: z.boolean()
});

export type AllowedConfig = z.infer<typeof allowedConfigSchema>;

// Minimal Zod schema for validation (if needed for API inputs)
export const fileRequestSchema = z.object({
  path: z.string()
});
