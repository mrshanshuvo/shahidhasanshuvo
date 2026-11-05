import mongoose from "mongoose";

// Fix Node.js DNS resolution issues on Windows
// try {
//   dns.setServers(["8.8.8.8", "8.8.4.4"]);
// } catch (error) {
//   console.error("Failed to set DNS servers:", error);
// }

// Extend the NodeJS global type to cache the mongoose connection
declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<mongoose.Connection> {
  // Guard is inside the function so it only throws at runtime (on actual DB
  // calls), not at module-load time during Next.js static page collection.
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable in your Vercel project settings (or .env.local for local dev)."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
