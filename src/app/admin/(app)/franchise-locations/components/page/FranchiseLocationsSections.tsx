import FranchiseLocationMineSections from "./FranchiseLocationMineSections";
import FranchiseLocationProviderSections from "./FranchiseLocationProviderSections";
import type { DeleteHandlers, PageState, TFn } from "./types";

export default function FranchiseLocationsSections(props: {
  p: PageState;
  t: TFn;
  handlers: DeleteHandlers;
}) {
  const { p, t, handlers } = props;
  if (p.loading || p.err) return null;
  if (p.superAdmin) {
    return (
      <FranchiseLocationProviderSections p={p} t={t} handlers={handlers} />
    );
  }
  return <FranchiseLocationMineSections p={p} t={t} handlers={handlers} />;
}
