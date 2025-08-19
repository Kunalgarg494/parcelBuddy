import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoDB";
import Notification from "@/models/notification";
import { verifySessionCookieFromRequest } from "@/lib/verifySession";

export async function GET(req: Request) {
  try {
    const decoded = await verifySessionCookieFromRequest(req);
    if (!decoded?.email) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    const notifications = await Notification.find({ userId: decoded.email })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
