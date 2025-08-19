import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

const COOKIE_NAME = "session";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const session = cookie
      .split(";")
      .find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
    const sessionCookie = session ? session.split("=")[1] : null;

    if (sessionCookie) {
      try {
        const decoded = await admin
          .auth()
          .verifySessionCookie(sessionCookie, true);
        await admin.auth().revokeRefreshTokens(decoded.sub);
      } catch (e) {
        // ignore
      }
    }

    const res = NextResponse.json({ message: "Logged out" });
    res.cookies.delete({ name: COOKIE_NAME, path: "/" });
    return res;
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
