import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoDB";
import Parcel from "@/models/Parcel";
import { verifySessionCookieFromRequest } from "@/lib/verifySession";
import Notification from "@/models/notification";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const decoded = await verifySessionCookieFromRequest(req);

    if (!decoded?.email) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { action } = body; 

    // find parcel
    const parcel = await Parcel.findById(id);
    if (!parcel) {
      return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
    }

    // =======================
    // 1. Accept Delivery (non-owner)
    // =======================
    if (action === "accept") {
      if (parcel.userId === decoded.email) {
        return NextResponse.json(
          { error: "Owner cannot deliver their own parcel" },
          { status: 400 }
        );
      }

      parcel.deliveryStatus = "in_progress";
      parcel.deliveryPersonId = decoded.email;
      await parcel.save();

      // notify parcel owner
      await Notification.create({
        userId: parcel.userId,
        message: `Congrats! ${decoded.email} has accepted your parcel.`,
        relatedParcelId: parcel._id.toString(),
        senderEmail: decoded.email,
      });

      // notify delivery person
      await Notification.create({
        userId: decoded.email,
        message: `You need to contact ${parcel.name} (${parcel.contactNumber}) to know the placedItemSite and delivery details.`,
        relatedParcelId: parcel._id.toString(),
        senderEmail: parcel.userId,
      });

      return NextResponse.json(
        { message: "Delivery started", parcel },
        { status: 200 }
      );
    }

    // =======================
    // 2. Cancel Delivery (owner only)
    // =======================
    if (action === "cancel") {
      if (parcel.userId !== decoded.email) {
        return NextResponse.json(
          { error: "Only owner can cancel delivery" },
          { status: 403 }
        );
      }
      if (parcel.deliveryStatus !== "in_progress") {
        return NextResponse.json(
          { error: "Delivery is not in progress" },
          { status: 400 }
        );
      }

      // Notify delivery person
      await Notification.create({
        userId: parcel.deliveryPersonId,
        message: `The owner (${parcel.userId}) has cancelled your acceptance of the parcel. Thank you for your time!`,
        relatedParcelId: parcel._id.toString(),
        senderEmail: parcel.userId,
      });

      parcel.deliveryStatus = "pending";
      await parcel.save();

      return NextResponse.json(
        { message: "Delivery cancelled and set back to pending", parcel },
        { status: 200 }
      );
    }

    // =======================
    // 3. Complete Delivery (owner only)
    // =======================
    if (action === "complete") {
      if (parcel.userId !== decoded.email) {
        return NextResponse.json(
          { error: "Only owner can complete delivery" },
          { status: 403 }
        );
      }
      if (parcel.deliveryStatus !== "in_progress") {
        return NextResponse.json(
          { error: "Delivery is not in progress" },
          { status: 400 }
        );
      }

      // Notify delivery person
      await Notification.create({
       userId: parcel.deliveryPersonId,
        message: `Thank you for your delivery of parcel (${parcel._id}). We appreciate your help!`,
        relatedParcelId: parcel._id.toString(),
        senderEmail: parcel.userId,
      });

      parcel.deliveryStatus = "delivered";
      await parcel.save();

      return NextResponse.json(
        { message: "Parcel marked as delivered", parcel },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating parcel:", error);
    return NextResponse.json(
      { error: "Failed to update delivery" },
      { status: 500 }
    );
  }
}

