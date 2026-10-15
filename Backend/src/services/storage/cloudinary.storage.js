import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { StorageProvider } from "./storage.interface.js";

/**
 * Cloudinary implementation of StorageProvider
 * Implements Open/Closed & Liskov Substitution
 */
export class CloudinaryStorageProvider extends StorageProvider {
  constructor(config = {}) {
    super();
    cloudinary.config({
      cloud_name: config.cloudName || process.env.CLOUDINARY_NAME,
      api_key: config.apiKey || process.env.CLOUDINARY_API_KEY,
      api_secret: config.apiSecret || process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(localFilePath, options = {}) {
    try {
      if (!localFilePath) return null;
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: options.resourceType || "auto",
        ...options,
      });

      // Clean up local temp file after upload
      if (fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch { /* ignore unlink error */ }
      }

      return {
        url: response.url || response.secure_url,
        publicId: response.public_id,
        raw: response,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      if (localFilePath && fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch { /* ignore unlink error */ }
      }
      return null;
    }
  }

  async delete(publicId) {
    try {
      if (!publicId) return false;
      const response = await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
      return response.result === "ok";
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      return false;
    }
  }
}
