import { createHmac, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { env } from "./config";

const COOKIE_NAME = "event_voter_token";

export async function getOrCreateVoterToken() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const token = randomBytes(32).toString("base64url");
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180
  });
  return token;
}

export function createVoterHash(eventId: string, token: string) {
  const secret = env.VOTER_HASH_SECRET;
  if (!secret) throw new Error("Missing VOTER_HASH_SECRET.");
  return createHmac("sha256", secret).update(`${eventId}:${token}`).digest("hex");
}
