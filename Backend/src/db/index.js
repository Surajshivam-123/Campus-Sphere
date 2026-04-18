import mongoose from "mongoose";
import { config } from "../config/index.js";
import { dbOperationDuration, mongoConnectionState } from "../utils/metrics.js";

// Use MongoDB driver's command monitoring to time every operation accurately.
// This fires at the driver level so it captures ALL operations regardless of
// how Mongoose calls them (find, aggregate, save → insert, etc.)
function attachCommandMonitoring(connection) {
  const timers = new Map();

  connection.on("commandStarted", (event) => {
    timers.set(event.requestId, { op: event.commandName, start: process.hrtime() });
  });

  connection.on("commandSucceeded", (event) => {
    const entry = timers.get(event.requestId);
    if (!entry) return;
    timers.delete(event.requestId);
    const [s, ns] = process.hrtime(entry.start);
    dbOperationDuration.observe(
      { operation: entry.op, collection: event.reply?.cursor?.ns?.split(".")[1] || "unknown" },
      s + ns / 1e9
    );
  });

  connection.on("commandFailed", (event) => {
    timers.delete(event.requestId);
  });
}

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(config.mongodb.uri, {
      monitorCommands: true, // required to enable commandStarted/Succeeded/Failed events
    });

    console.log(
      `✅ MongoDB connected! Host: ${connectionInstance.connection.host}`
    );

    // Attach command monitoring to the underlying driver connection
    attachCommandMonitoring(connectionInstance.connection.getClient());

    // Track connection state
    mongoose.connection.on("connected", () => mongoConnectionState.set(1));
    mongoose.connection.on("disconnected", () => mongoConnectionState.set(0));
    mongoose.connection.on("error", () => mongoConnectionState.set(0));
    mongoConnectionState.set(1);
  } catch (error) {
    mongoConnectionState.set(0);
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
