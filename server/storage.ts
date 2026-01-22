import { files, type File, type InsertFile } from "@shared/schema";
import { db } from "./db";
import { eq, isNull, and } from "drizzle-orm";

export interface IStorage {
  getFiles(parentId?: number): Promise<File[]>;
  getFilesByPath(path: string): Promise<File[]>;
  getFileByPath(path: string): Promise<File | undefined>;
  getFileByAccessKey(key: string): Promise<File | undefined>;
  getFile(id: number): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, updates: Partial<InsertFile>): Promise<File>;
  deleteFile(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getFiles(parentId?: number): Promise<File[]> {
    if (parentId) {
      return await db.select().from(files).where(eq(files.parentId, parentId));
    } else {
      return await db.select().from(files).where(isNull(files.parentId));
    }
  }

  async getFilesByPath(path: string): Promise<File[]> {
    return await db.select().from(files).where(eq(files.path, path));
  }

  async getFileByPath(path: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.path, path));
    return file;
  }

  async getFileByAccessKey(key: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.accessKey, key));
    return file;
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const [file] = await db.insert(files).values(insertFile).returning();
    return file;
  }

  async updateFile(id: number, updates: Partial<InsertFile>): Promise<File> {
    const [file] = await db.update(files).set(updates).where(eq(files.id, id)).returning();
    return file;
  }

  async deleteFile(id: number): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }
}

export const storage = new DatabaseStorage();
