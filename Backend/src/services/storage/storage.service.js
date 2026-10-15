import { CloudinaryStorageProvider } from "./cloudinary.storage.js";

/**
 * StorageService - High-level module for file uploads
 * Adheres to Dependency Inversion Principle (DIP):
 * High-level business logic depends on the StorageProvider abstraction,
 * which can be injected at runtime or swapped for testing / S3 / local storage.
 */
export class StorageService {
  /**
   * @param {import("./storage.interface.js").StorageProvider} provider
   */
  constructor(provider = new CloudinaryStorageProvider()) {
    this.provider = provider;
  }

  setProvider(provider) {
    this.provider = provider;
  }

  async uploadFile(filePath, options = {}) {
    return this.provider.upload(filePath, options);
  }

  async deleteFile(publicId) {
    return this.provider.delete(publicId);
  }
}

export const storageService = new StorageService();
