import NewsAdminMain from "./NewsAdminMain";
import NewsDialogMounts from "./NewsDialogMounts";
import NewsPreviewHint from "./NewsPreviewHint";
import { useNewsDeleteDialog } from "./useNewsDeleteDialog";
import { useNewsAdminViewModel } from "../useNewsAdminViewModel";

export default function NewsAdminPageContent() {
  const p = useNewsAdminViewModel();
  const d = useNewsDeleteDialog(p);
  return (
    <div className="news-admin ks">
      <NewsAdminMain p={p} d={d} />
      <NewsDialogMounts p={p} d={d} />
      <NewsPreviewHint href={p.previewHref} />
    </div>
  );
}
