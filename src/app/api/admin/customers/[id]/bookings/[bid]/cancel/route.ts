export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import {
  postBookingAction,
  type BookingActionCtx,
} from "@/app/api/admin/customers/[id]/bookings/[bid]/action-proxy.helpers";

export async function POST(req: NextRequest, ctx: BookingActionCtx) {
  return postBookingAction(req, ctx, "/cancel", { includeQuery: true });
}
