import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoDB";
import Parcel from "@/models/Parcel";
import { verifySessionCookieFromRequest } from "@/lib/verifySession";

export async function GET(req: Request) {
  try {
    const decoded = await verifySessionCookieFromRequest(req);
    if (!decoded?.email) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();

    const parcels = await Parcel.find({ userId: decoded.email })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ parcels }, { status: 200 });
  } catch (error) {
    console.error("Fetch my parcels error:", error);
    return NextResponse.json({ error: "Failed to fetch user parcels" }, { status: 500 });
  }
}
