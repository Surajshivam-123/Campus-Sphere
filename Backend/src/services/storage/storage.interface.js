/**
 * StorageProvider (Interface / Abstract Base Class)
 * Adheres to:
 * - Open/Closed Principle (OCP): New storage backends (S3, GCS, Local) extend this class without modifying consumers.
 * - Liskov Substitution Principle (LSP): Subclasses must honor the upload/delete contract.
 */
export class StorageProvider {
  /**
   * Upload a local file to storage
   * @param {string} localFilePath - Path to local file
   * @param {object} options - Upload options
   * @returns {Promise<{ url: string, publicId: string } | null>}
   */
  async upload(localFilePath, options = {}) {
    throw new Error("Method 'upload' must be implemented by StorageProvider subclass");
  }

  /**
   * Delete a file from storage
   * @param {string} publicId - Unique file identifier
   * @returns {Promise<boolean>}
   */
  async delete(publicId) {
    throw new Error("Method 'delete' must be implemented by StorageProvider subclass");
  }
}
