import MineApprovedSection from "./MineApprovedSection";
import MinePendingSection from "./MinePendingSection";
import MineRejectedSection from "./MineRejectedSection";
import type { PageHandlersProps } from "./types";

export default function FranchiseLocationMineSections(props: PageHandlersProps) {
  return <><MinePendingSection {...props} /><MineApprovedSection {...props} showSubmit /><MineRejectedSection {...props} /></>;
}
