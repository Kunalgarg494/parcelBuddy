import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoDB";
import Feedback from "@/models/feedback";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId, feedback } = await req.json();
    if (!userId || !feedback) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const fb = await Feedback.create({ userId, feedback });
    return NextResponse.json({ message: "Feedback stored successfully", feedback: fb });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json({ error: "Failed to store feedback" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Feedback fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch feedbacks" }, { status: 500 });
  }
}
