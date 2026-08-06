import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "@/types/auth";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET belum diatur di environment variable");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload, expiresIn: "8h" | "30d") {
  return new SignJWT({ username: payload.username, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getSecretKey());

  if (typeof payload.sub !== "string" || typeof payload.username !== "string") {
    throw new Error("Token sesi tidak valid");
  }

  return {
    sub: payload.sub,
    username: payload.username,
    role: payload.role as SessionPayload["role"],
  };
}
