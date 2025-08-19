import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri: string = process.env.MONGODB_URI || "mongodb://localhost:27017/parcelBuddy";
const dbName = process.env.MONGODB_DB || "parcelBuddy";

// TypeScript safety check
if (!uri) {
  throw new Error("❌ Please define the MONGODB_URI environment variable inside .env.local");
}

export async function GET() {
  try {
    const client = new MongoClient(uri); // ✅ TypeScript now knows uri is a string
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("test");

    // Insert sample document
    await collection.insertOne({ name: "Kunal", time: new Date() });

    // Fetch documents to verify
    const data = await collection.find({}).toArray();

    await client.close();

    return NextResponse.json({
      message: "✅ Connected and inserted successfully!",
      data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "❌ Database connection failed" },
      { status: 500 }
    );
  }
}
