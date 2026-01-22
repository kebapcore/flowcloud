import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'file' | 'folder'
  parentId: integer("parent_id"), // null for root
  path: text("path").notNull().default("/"), // Virtual path like /neck-hurt
  size: text("size").notNull(),
  accessKey: text("access_key"), // 20-character key for public access
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFileSchema = createInsertSchema(files).omit({ id: true, createdAt: true });

export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;

export type CreateFileRequest = InsertFile;
export type FileResponse = File;

export type AuthRequest = { accessKey: string };
export type AuthResponse = { success: boolean };
