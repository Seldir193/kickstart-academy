import { countLabel, viewLabelProvider } from "../../page.helpers";
import PendingProviderSection from "./PendingProviderSection";
import { provPendingPagination } from "./pagination";
import type { PageState, TFn } from "./types";

export default function ProviderPendingSection(props: {
  p: PageState;
  t: TFn;
}) {
  const { p, t } = props;
  return (
    <PendingProviderSection
      title={viewLabelProvider("provider_pending", t)}
      meta={countLabel(p.provPendingAllCount, "provider_pending", t)}
      p={p}
      pagination={provPendingPagination(p)}
    />
  );
}
