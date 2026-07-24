import { proxyRevenueRequest } from "@/app/api/admin/revenue/proxy.helpers";

export async function GET(req: Request) {
  return proxyRevenueRequest(req, "/admin/revenue", "Revenue proxy failed");
}
