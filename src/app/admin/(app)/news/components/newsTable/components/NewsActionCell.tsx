import type { RowProps } from "./rowTypes";
import { actionsFor } from "../lib/actions";
import { stop } from "../lib/events";
import { NewsActionTrigger } from "./NewsActionTrigger";

export function NewsActionCell({
  row,
  hideActions,
}: {
  row: RowProps;
  hideActions: boolean;
}) {
  if (hideActions) return hiddenActions();
  const actions = actionsFor(actionArgs(row));
  return (
    <div
      className="news-list__cell news-list__cell--action"
      onClick={stop}
      onMouseDown={stop}
    >
      {actions.map((action) => (
        <NewsActionTrigger key={action.key} action={action} />
      ))}
    </div>
  );
}

function actionArgs(row: RowProps) {
  return {
    n: row.item,
    rowMode: row.props.rowMode,
    busy: row.props.busy,
    onOpen: row.props.onOpen,
    onInfo: row.props.onInfo,
    onResubmit: row.props.onResubmit,
    onSubmitForReview: row.props.onSubmitForReview,
    onDeleteOne: row.props.onDeleteOne,
    onAskReject: row.props.onAskReject,
    t: row.t,
  };
}

function hiddenActions() {
  return (
    <div
      className="news-list__cell news-list__cell--action news-list__actions--hidden"
      aria-hidden="true"
    />
  );
}
