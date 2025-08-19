// app/api/parcels/[id]/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoDB";
import Parcel from "@/models/Parcel";
import { verifySessionCookieFromRequest } from "@/lib/verifySession";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;  // 👈 await here

    const decoded = await verifySessionCookieFromRequest(req);
    if (!decoded?.email) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();

    const parcel = await Parcel.findOne({ _id: id, userId: decoded.email });
    if (!parcel) {
      return NextResponse.json({ error: "Parcel not found or not authorized" }, { status: 404 });
    }

    await Parcel.deleteOne({ _id: id });

    return NextResponse.json({ message: "Parcel deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting parcel:", error);
    return NextResponse.json({ error: "Failed to delete parcel" }, { status: 500 });
  }
}

