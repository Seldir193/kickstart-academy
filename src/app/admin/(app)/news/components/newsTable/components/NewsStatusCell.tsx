import NewsSwitch from "../../NewsSwitch";
import type { Props } from "./NewsTableListProps";
import type { NewsWithProvider, Translate } from "../types";
import { statusClass, statusParts } from "../lib/status";
import { stop } from "../lib/events";

export function NewsStatusCell({ item, props, t, showSwitch, id }: CellProps) {
  const status = statusParts(item, props.rowMode, t);
  return (
    <div className="news-list__cell news-list__cell--status">
      <div className="coach-statusline">
        <StatusBadge item={item} status={status} />
        {switchWrap(item, props, showSwitch, id)}
      </div>
    </div>
  );
}

type CellProps = {
  item: NewsWithProvider;
  props: Props;
  t: Translate;
  showSwitch: boolean;
  id: string;
};

function StatusBadge({
  item,
  status,
}: {
  item: NewsWithProvider;
  status: ReturnType<typeof statusParts>;
}) {
  return (
    <span className={`news-list__status ${statusClass(item)}`}>
      <span className="news-list__status-main">{status.main}</span>
      {status.sub ? (
        <span className="news-list__status-sub">{status.sub}</span>
      ) : null}
    </span>
  );
}

function switchWrap(
  item: NewsWithProvider,
  props: Props,
  showSwitch: boolean,
  id: string,
) {
  if (!showSwitch || !props.onTogglePublished) return null;
  const busy = Boolean(props.publishedBusyId && props.publishedBusyId === id);
  return (
    <span
      className={`news-switch-wrap ${busy ? "is-busy" : ""}`}
      onClick={stop}
      onMouseDown={stop}
      onPointerDown={stop}
    >
      {switchNode(item, props, busy)}
    </span>
  );
}

function switchNode(item: NewsWithProvider, props: Props, busy: boolean) {
  const published = Boolean((item as Record<string, unknown>)?.published);
  return (
    <NewsSwitch
      checked={published}
      busy={busy}
      onToggle={() => togglePublished(item, props, busy, published)}
    />
  );
}

function togglePublished(
  item: NewsWithProvider,
  props: Props,
  busy: boolean,
  published: boolean,
) {
  if (busy) return;
  props.onTogglePublished?.(item, !published);
}
