import { z } from "zod";
import { fileMetadataSchema } from "./schema";

export const api = {
  files: {
    metadata: {
      method: "GET" as const,
      path: "/api/files/:path", // Use standard param instead of wildcard string
      responses: {
        200: fileMetadataSchema,
        403: z.object({ message: z.string() }),
        404: z.object({ message: z.string() })
      }
    }
  }
};

// Helper to build URLs
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
