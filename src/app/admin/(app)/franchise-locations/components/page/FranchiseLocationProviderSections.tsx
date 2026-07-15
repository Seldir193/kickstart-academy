import MineApprovedSection from "./MineApprovedSection";
import ProviderApprovedSection from "./ProviderApprovedSection";
import ProviderPendingSection from "./ProviderPendingSection";
import ProviderRejectedSection from "./ProviderRejectedSection";
import type { PageHandlersProps } from "./types";

export default function FranchiseLocationProviderSections(
  props: PageHandlersProps,
) {
  return (
    <>
      <ProviderPendingSection p={props.p} t={props.t} />
      <ProviderApprovedSection {...props} />
      <ProviderRejectedSection {...props} />
      <MineApprovedSection {...props} />
    </>
  );
}
