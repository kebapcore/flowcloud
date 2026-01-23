import { fileMetadataSchema, type FileMetadata } from "@shared/schema";

export interface IStorage {
  // We don't strictly need DB methods for this file-based project,
  // but we'll keep the interface structure.
  getFiles(): Promise<FileMetadata[]>;
}

export class MemStorage implements IStorage {
  async getFiles(): Promise<FileMetadata[]> {
    return [];
  }
}

export const storage = new MemStorage();
