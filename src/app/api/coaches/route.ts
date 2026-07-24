import { NextRequest, NextResponse } from "next/server";

const BASE = (process.env.NEXT_BACKEND_API_BASE || "").replace(/\/+$/, "");

type CoachRecord = Record<string, any>;

function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "http://localhost");
  res.headers.set("Vary", "Origin");
  res.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

function getPhotoValue(coach: CoachRecord) {
  return (
    coach.photoUrl ||
    coach.imageUrl ||
    coach.image ||
    coach.photo ||
    coach.avatar ||
    coach.profileImage ||
    coach.live?.photoUrl ||
    coach.live?.imageUrl ||
    coach.draft?.photoUrl ||
    coach.draft?.imageUrl ||
    ""
  );
}

function normalizePhotoUrl(value: unknown) {
  const url = String(value || "")
    .trim()
    .replaceAll("\\", "/");

  if (!url) return "";
  if (/^(https?:\/\/|data:image\/)/i.test(url)) return url;
  if (url.startsWith("/uploads/coach/")) return url;
  if (url.startsWith("uploads/coach/")) return `/${url}`;
  if (url.startsWith("/api/uploads/coach/")) return url;
  if (url.startsWith("api/uploads/coach/")) return `/${url}`;

  return url;
}

function normalizeCoach(coach: CoachRecord) {
  const photoUrl = normalizePhotoUrl(getPhotoValue(coach));

  return {
    ...coach,
    photoUrl,
  };
}

function normalizeList(data: any) {
  if (Array.isArray(data)) {
    return data.map(normalizeCoach);
  }

  if (Array.isArray(data?.items)) {
    return {
      ...data,
      items: data.items.map(normalizeCoach),
    };
  }

  return data;
}

function parseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function GET(req: NextRequest) {
  const upstream = await fetch(`${BASE}/coaches${req.nextUrl.search}`, {
    cache: "no-store",
  });

  const text = await upstream.text();
  const data = parseJson(text);
  const body = data ? JSON.stringify(normalizeList(data)) : text;

  return cors(
    new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
      },
    }),
  );
}
