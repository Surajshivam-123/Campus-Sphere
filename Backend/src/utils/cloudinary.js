import { storageService } from "../services/storage/storage.service.js";

/**
 * Backward-compatible wrapper delegating to StorageService (SOLID DIP & OCP)
 */
const uploadOnCloudinary = async (localfilePath) => {
  return storageService.uploadFile(localfilePath);
};

const deleteFromCloudinary = async (public_id) => {
  return storageService.deleteFile(public_id);
};

export { uploadOnCloudinary, deleteFromCloudinary };
