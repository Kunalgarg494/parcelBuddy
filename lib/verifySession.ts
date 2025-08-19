// lib/verifySession.ts
import admin from "./firebaseAdmin";

export async function verifySessionCookieFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.split(";").find((c) => c.trim().startsWith("session="));
  if (!match) return null;
  const sessionCookie = match.split("=")[1];
  try {
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    return decoded;
  } catch (err) {
    return null;
  }
}
