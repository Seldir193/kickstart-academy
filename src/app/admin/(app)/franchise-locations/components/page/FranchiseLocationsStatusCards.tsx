import type { PageState, TFn } from "./types";

export default function FranchiseLocationsStatusCards(props: {
  p: PageState;
  t: TFn;
}) {
  const { p, t } = props;
  return (
    <>
      {p.loading ? <div className="card">{t("common.admin.franchiseLocations.loading")}</div> : null}
      {p.err ? <div className="card text-red-600">{p.err}</div> : null}
    </>
  );
}
