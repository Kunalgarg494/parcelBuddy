import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoDB";
import User from "@/models/user";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { uid, name, email, photoURL } = await req.json();
    if (!uid || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({ uid, name, email, photoURL });
    }

    return NextResponse.json({ message: "User stored successfully", user });
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json({ error: "Failed to store user" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    // Get `uid` from URL search params
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "Missing uid parameter" },
        { status: 400 }
      );
    }

    // Find user by UID
    const user = await User.findOne({ uid });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("User GET API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
