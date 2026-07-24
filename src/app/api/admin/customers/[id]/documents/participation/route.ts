export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { forwardBookingDocument } from "@/app/api/admin/customers/[id]/documents/document-forward.helpers";

export async function GET(req: NextRequest, ctx: any) {
  return forwardBookingDocument(
    req,
    ctx,
    "participation",
    "Teilnahmebestaetigung.pdf",
  );
}
export async function POST(req: NextRequest, ctx: any) {
  return forwardBookingDocument(
    req,
    ctx,
    "participation",
    "Teilnahmebestaetigung.pdf",
  );
}
