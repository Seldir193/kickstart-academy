import type { DocItem } from "../../types";
import { badgeTextFrom, iconForType, trimTitle } from "../lib/documentDisplay";

export function DocumentRow({
  item,
  hideTitleText = false,
}: {
  item: DocItem;
  hideTitleText?: boolean;
}) {
  const title = trimTitle(item);
  return (
    <div className="ks-doc-select__row">
      <div className="ks-doc-select__top ks-doc-select__top--single">
        <DocumentTitle
          item={item}
          title={title}
          hideTitleText={hideTitleText}
        />
        <DocumentBadge item={item} />
      </div>
    </div>
  );
}

function DocumentTitle(props: {
  item: DocItem;
  title: string;
  hideTitleText: boolean;
}) {
  return (
    <div className="ks-doc-select__title" title={props.title}>
      <span className="ks-doc-select__typeIcon" aria-hidden="true">
        <img src={iconForType(props.item.type)} alt="" />
      </span>
      {!props.hideTitleText ? (
        <span className="ks-doc-select__titleText">{props.title}</span>
      ) : null}
    </div>
  );
}

function DocumentBadge({ item }: { item: DocItem }) {
  const badge = badgeTextFrom(item);
  return (
    <div className="ks-doc-select__badgeCol">
      {badge ? <span className="ks-doc-select__badge">{badge}</span> : null}
    </div>
  );
}
