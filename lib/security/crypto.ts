import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;

function toHex(buffer: Buffer): string {
  return buffer.toString("hex");
}

function fromHex(value: string): Buffer | null {
  if (!/^[a-f0-9]+$/i.test(value) || value.length % 2 !== 0) {
    return null;
  }

  return Buffer.from(value, "hex");
}

export function hashPasswordWithScrypt(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  return `scrypt$${toHex(salt)}$${toHex(key)}`;
}

export function verifyPasswordWithScrypt(password: string, encoded: string): boolean {
  const parts = encoded.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }

  const salt = fromHex(parts[1] ?? "");
  const expected = fromHex(parts[2] ?? "");
  if (salt === null || expected === null) {
    return false;
  }

  const derived = scryptSync(password, salt, expected.byteLength);
  if (derived.byteLength !== expected.byteLength) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}
