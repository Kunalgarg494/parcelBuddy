import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoDB";
import Parcel from "@/models/Parcel";
import { verifySessionCookieFromRequest } from "@/lib/verifySession";

export async function POST(req: Request) {
  const decoded = await verifySessionCookieFromRequest(req);
  if (!decoded || !decoded.email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const createdBy = decoded.email;
  try {
    await connectDB();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid or missing JSON body" },
        { status: 400 }
      );
    }

    const {
      name,
      contactNumber,
      gender,
      parcelCost,
      placedItemSite,
      parcelStatus,
      pickupPlace,
      deadline,
      deliveryPersonName,
      hostelBlock,
    } = body;

    // Validate required fields
    if (
      !name ||
      !contactNumber ||
      !gender ||
      !parcelCost ||
      !placedItemSite ||
      !parcelStatus ||
      !deliveryPersonName ||
      !hostelBlock || 
      !decoded.email 
    ) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Set default pickup place if not given
    const finalPickupPlace = pickupPlace || "In front of SJT";

    // If deadline not provided, set it to today at 4 PM
    let finalDeadline: Date;
    if (!deadline) {
      finalDeadline = new Date();
      finalDeadline.setHours(16, 0, 0, 0);
    } else {
      finalDeadline = new Date(deadline);
    }

    const newParcel = await Parcel.create({
      name,
      contactNumber,
      gender,
      parcelCost,
      placedItemSite,
      parcelStatus,
      pickupPlace: finalPickupPlace,
      deadline: finalDeadline,
      deliveryPersonName,
      hostelBlock,
      userId: decoded.email,
    });

    return NextResponse.json(
      { message: "Parcel order placed successfully", parcel: newParcel },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating parcel:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
