import { z } from "zod";

// Configuration Schemas
export const keyConfigSchema = z.record(z.string(), z.string()); // { "filename": "accessKey" }

export const allowedConfigSchema = z.object({
  allowedHosts: z.array(z.string()),
  devMode: z.boolean()
});

export type KeyConfig = z.infer<typeof keyConfigSchema>;
export type AllowedConfig = z.infer<typeof allowedConfigSchema>;

// API Response Schemas
export const fileMetadataSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.literal("file"),
  parentId: z.null(),
  path: z.string(),
  size: z.string(),
  accessKey: z.string(),
  createdAt: z.string()
});

export type FileMetadata = z.infer<typeof fileMetadataSchema>;

// Minimal Zod schema for validation (if needed for API inputs)
export const fileRequestSchema = z.object({
  path: z.string()
});
