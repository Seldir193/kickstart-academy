export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import {
  proxyCustomerDocumentsDownload,
  type DocumentsDownloadCtx,
} from "@/app/api/admin/customers/[id]/documents-download.helpers";

export async function GET(req: NextRequest, ctx: DocumentsDownloadCtx) {
  return proxyCustomerDocumentsDownload(req, ctx, {
    pathSuffix: "documents.zip",
    accept: "application/zip",
    fallbackContentType: "application/zip",
    fallbackDisposition: (id) =>
      `attachment; filename="customer-${id}-documents.zip"`,
    proxyErrorLabel: "Proxy error",
  });
}
