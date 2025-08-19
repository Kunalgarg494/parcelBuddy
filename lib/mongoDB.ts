import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("❌ MONGODB_URI is not defined in environment variables");
  }

  await mongoose.connect(uri);

  console.log("✅ MongoDB connected");
};

export default connectDB;
