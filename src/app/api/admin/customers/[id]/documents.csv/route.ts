export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import {
  proxyCustomerDocumentsDownload,
  type DocumentsDownloadCtx,
} from "@/app/api/admin/customers/[id]/documents-download.helpers";

export async function GET(req: NextRequest, ctx: DocumentsDownloadCtx) {
  return proxyCustomerDocumentsDownload(req, ctx, {
    pathSuffix: "documents.csv",
    accept: "text/csv",
    fallbackContentType: "text/csv; charset=utf-8",
    fallbackDisposition: () => 'attachment; filename="documents.csv"',
    proxyErrorLabel: "Proxy failed",
  });
}
