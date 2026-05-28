import { createHash } from "node:crypto";
import { env } from "@/lib/env";

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

export const ADMIN_COOKIE_NAME = "bizkit_ai_admin";

export function getAdminPassword() {
  return env.adminPassword;
}

export function getAdminToken(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export function isValidAdminPassword(password: string) {
  const expected = getAdminPassword();
  return Boolean(expected) && password === expected;
}

export function isAdminAuthenticated(cookies: CookieReader) {
  const expected = getAdminPassword();

  if (!expected) {
    return false;
  }

  const cookieValue = cookies.get(ADMIN_COOKIE_NAME)?.value;
  return cookieValue === getAdminToken(expected);
}
