import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    env: {
      NODE_ENV: "test",
      MONGODB_URI: "mongodb://127.0.0.1:27017/test_campus_sphere",
      PORT: "4000",
      ACCESS_TOKEN_SECRET: "test_access_token_secret_which_is_long_enough_123456",
      ACCESS_TOKEN_EXPIRY: "1d",
      REFRESH_TOKEN_SECRET: "test_refresh_token_secret_which_is_long_enough_123456",
      REFRESH_TOKEN_EXPIRY: "7d",
      CLOUDINARY_NAME: "test_cloud",
      CLOUDINARY_API_KEY: "test_key",
      CLOUDINARY_API_SECRET: "test_secret",
      FRONTEND_ORIGIN: "http://localhost:5173",
      REDIS_URL: "redis://localhost:6379",
    },
  },
});
