import { describe, it, expect, vi } from "vitest";
import { StorageProvider } from "../../src/services/storage/storage.interface.js";
import { StorageService } from "../../src/services/storage/storage.service.js";

describe("Storage Abstraction (OCP, LSP, DIP)", () => {
  it("StorageProvider base class methods should throw if not implemented", async () => {
    const provider = new StorageProvider();
    await expect(provider.upload("path.png")).rejects.toThrow("must be implemented");
    await expect(provider.delete("id123")).rejects.toThrow("must be implemented");
  });

  it("StorageService should delegate upload and delete to injected provider", async () => {
    // Mock custom provider (e.g. S3 or Local storage)
    class MockStorageProvider extends StorageProvider {
      async upload(filePath) {
        return { url: `https://mock.storage/${filePath}`, publicId: "mock_123" };
      }
      async delete(publicId) {
        return true;
      }
    }

    const mockProvider = new MockStorageProvider();
    const storage = new StorageService(mockProvider);

    const uploadResult = await storage.uploadFile("avatar.jpg");
    expect(uploadResult.url).toBe("https://mock.storage/avatar.jpg");
    expect(uploadResult.publicId).toBe("mock_123");

    const deleteResult = await storage.deleteFile("mock_123");
    expect(deleteResult).toBe(true);
  });

  it("StorageService should allow hot-swapping providers (DIP)", async () => {
    const storage = new StorageService();
    const customProvider = {
      upload: vi.fn().mockResolvedValue({ url: "https://custom.com/test.png" }),
      delete: vi.fn().mockResolvedValue(true),
    };

    storage.setProvider(customProvider);
    const res = await storage.uploadFile("test.png");

    expect(customProvider.upload).toHaveBeenCalledWith("test.png", {});
    expect(res.url).toBe("https://custom.com/test.png");
  });
});
