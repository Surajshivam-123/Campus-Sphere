import mongoose from "mongoose";
import { config } from "../config/index.js";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(config.mongodb.uri);
    console.log(
      `✅ MongoDB connected! Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
