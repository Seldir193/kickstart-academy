import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function nuke(res: NextResponse, name: string, httpOnly: boolean) {
  res.cookies.set(name, "", {
    httpOnly,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.headers.set("Cache-Control", "no-store");

  nuke(res, "admin_token", true);
  nuke(res, "admin_ui", false);
  nuke(res, "admin_uid", true);
  nuke(res, "admin_email", true);
  nuke(res, "admin_name", true);
  nuke(res, "providerId", false);
  nuke(res, "adminProviderId", false);
  nuke(res, "aid", false);

  return res;
}

export const GET = POST;
