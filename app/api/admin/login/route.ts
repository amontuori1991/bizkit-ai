import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminToken, isValidAdminPassword } from "@/lib/admin";
import { isAdminPasswordConfigured } from "@/lib/env";

type LoginBody = {
  password?: string;
};

export async function POST(request: Request) {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD non configurata. Controlla /admin/setup." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const password = body.password?.trim() ?? "";

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Password non valida." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, getAdminToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ success: true });
}
