import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

import { getSecurityEnv } from "@/lib/security/env";

type CookieBag = {
  set: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      sameSite: "lax";
      secure: boolean;
      path: string;
      maxAge: number;
    }
  ) => void;
};

type SessionPayload = {
  sub: "owner";
  username: string;
  iat: number;
  exp: number;
  nonce: string;
};

export type FirmusSession = {
  userId: "owner";
  username: string;
  expiresAt: number;
};

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf-8").toString("base64url");
}

function decodeBase64Url(value: string): string | null {
  try {
    return Buffer.from(value, "base64url").toString("utf-8");
  } catch {
    return null;
  }
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf-8");
  const rightBuffer = Buffer.from(right, "utf-8");

  if (leftBuffer.byteLength !== rightBuffer.byteLength) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function buildPayload(username: string): SessionPayload {
  const env = getSecurityEnv();
  const issuedAt = Math.floor(Date.now() / 1000);

  return {
    sub: "owner",
    username,
    iat: issuedAt,
    exp: issuedAt + env.sessionTtlSeconds,
    nonce: randomUUID(),
  };
}

export function createSessionToken(username: string): string {
  const env = getSecurityEnv();
  const payload = buildPayload(username);
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload, env.sessionSecret);
  return `${encodedPayload}.${signature}`;
}

function parsePayload(token: string): SessionPayload | null {
  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  const env = getSecurityEnv();
  const expectedSignature = sign(encodedPayload, env.sessionSecret);
  if (!safeEqual(encodedSignature, expectedSignature)) {
    return null;
  }

  const rawPayload = decodeBase64Url(encodedPayload);
  if (!rawPayload) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawPayload) as Partial<SessionPayload>;
    if (
      parsed.sub !== "owner" ||
      typeof parsed.username !== "string" ||
      typeof parsed.iat !== "number" ||
      typeof parsed.exp !== "number" ||
      typeof parsed.nonce !== "string"
    ) {
      return null;
    }

    if (parsed.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      sub: "owner",
      username: parsed.username,
      iat: parsed.iat,
      exp: parsed.exp,
      nonce: parsed.nonce,
    };
  } catch {
    return null;
  }
}

export function readSessionFromToken(token: string | null | undefined): FirmusSession | null {
  if (!token) {
    return null;
  }

  const payload = parsePayload(token);
  if (!payload) {
    return null;
  }

  return {
    userId: "owner",
    username: payload.username,
    expiresAt: payload.exp,
  };
}

export function readSessionFromRequest(request: NextRequest): FirmusSession | null {
  const env = getSecurityEnv();
  const token = request.cookies.get(env.sessionCookieName)?.value;
  return readSessionFromToken(token);
}

export function writeSessionCookie(cookieBag: CookieBag, token: string): void {
  const env = getSecurityEnv();
  cookieBag.set(env.sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.secureCookie,
    path: "/",
    maxAge: env.sessionTtlSeconds,
  });
}

export function clearSessionCookie(cookieBag: CookieBag): void {
  const env = getSecurityEnv();
  cookieBag.set(env.sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.secureCookie,
    path: "/",
    maxAge: 0,
  });
}
