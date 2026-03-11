const mongoose = require('mongoose');

// Cache the connection promise on `global` so it survives across
// warm Vercel serverless invocations (module-level vars reset on cold starts,
// but `global` persists for the lifetime of the container).
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  // Already connected — fast path
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Connection in progress — reuse the same promise (prevents duplicate
  // connections when concurrent requests hit a cold container)
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        bufferCommands: false, // fail fast if connection drops
      })
      .then((m) => {
        console.log('MongoDB connected');
        return m;
      })
      .catch((err) => {
        // Reset so the next invocation retries instead of returning
        // a permanently-rejected promise
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
