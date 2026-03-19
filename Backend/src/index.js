import { config } from "./config/index.js";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Google DNS

import { app } from "./app.js";
import { connectDB } from "./db/index.js";

connectDB()
  .then(() => {
    app.listen(config.server.port, () => {
      console.log(`✅ Server is running on http://localhost:${config.server.port}`);
      console.log(`📝 Environment: ${config.server.env}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });