import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";

export function signValue(value: string) {
  return createHmac("sha256", env.jwtSecret).update(value).digest("base64url");
}

export function verifySignature(value: string, signature: string) {
  const actual = Buffer.from(signValue(value));
  const expected = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
