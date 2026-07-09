import NewsFilters from "../../components/NewsFilters";
import CreateButton from "./CreateButton";
import MineNewsSections from "./MineNewsSections";
import NewsErrorCard from "./NewsErrorCard";
import ProviderNewsSections from "./ProviderNewsSections";
import type { DeleteDialogState, NewsAdminViewModel } from "./types";

export default function NewsAdminMain({ p, d }: Props) {
  return (
    <main className="container">
      <NewsFilters
        q={p.q}
        onChangeQ={p.setQ}
        sort={p.sort}
        onChangeSort={p.setSort}
        actionSlot={<CreateButton busy={p.busy} onOpen={p.onOpenCreate} />}
      />
      <ProviderNewsSections p={p} d={d} />

      {p.anyError ? <NewsErrorCard error={p.anyError} /> : null}
      <MineNewsSections p={p} d={d} />
    </main>
  );
}

type Props = { p: NewsAdminViewModel; d: DeleteDialogState };
