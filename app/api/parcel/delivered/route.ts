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

    // ✅ Fetch contributions (delivered by this user)
    const deliveredParcels = await Parcel.find({
      deliveryPersonId: decoded.email,
      deliveryStatus: "delivered",
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ parcels: deliveredParcels }, { status: 200 });
  } catch (error) {
    console.error("Fetch delivered parcels error:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivered parcels" },
      { status: 500 }
    );
  }
}
