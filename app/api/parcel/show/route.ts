import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoDB";
import Parcel from "@/models/Parcel";

export async function GET() {
  try {
    await connectDB();
    const parcels = await Parcel.find().sort({ createdAt: -1 }); 
    return NextResponse.json({ parcels }, { status: 200 });
  } catch (error) {
    console.error("Error fetching parcels:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
