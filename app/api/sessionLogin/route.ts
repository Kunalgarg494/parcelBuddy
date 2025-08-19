// app/api/sessionLogin/route.ts
import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

const COOKIE_NAME = "session";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

    // Verify idToken first (optional but recommended)
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email || "";
    const allowedDomain = "@vitstudent.ac.in"; // same rule as client
    if (!email.endsWith(allowedDomain)) {
      return NextResponse.json({ error: "Only VIT accounts are allowed" }, { status: 403 });
    }

    // create session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // ms
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ message: "Session created" }, { status: 200 });
    res.cookies.set({
      name: COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: expiresIn / 1000,
    });
    return res;
  } catch (err) {
    console.error("Session login error:", err);
    return NextResponse.json({ error: "Could not create session" }, { status: 500 });
  }
}
