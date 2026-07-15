import { useTranslation } from "react-i18next";
import FeedbackBulkActions from "../FeedbackBulkActions";
import FeedbackCard from "../FeedbackCard";
import { getFeedbackId } from "../../helpers";
import type { FeedbackListProps } from "./feedbackList.types";
import type { FeedbackSelection } from "./useFeedbackSelection";

export default function FeedbackTable({
  props,
  selection,
}: {
  props: FeedbackListProps;
  selection: FeedbackSelection;
}) {
  return (
    <div className="news-admin__box news-admin__box--scroll3">
      <div className="news-table">
        <div className="news-admin__top-actions">
          <FeedbackToolbar props={props} selection={selection} />
        </div>
        <div className="news-table__scroll">
          <section className="card news-list">
            <div className="news-list__table">
              <FeedbackTableHead />
              <FeedbackRows props={props} selection={selection} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FeedbackToolbar({
  props,
  selection,
}: {
  props: FeedbackListProps;
  selection: FeedbackSelection;
}) {
  return (
    <FeedbackBulkActions
      toggleRef={selection.toggleRef}
      cancelRef={selection.cancelRef}
      clearRef={selection.clearRef}
      selectMode={selection.selectMode}
      count={selection.selectedIds.size}
      isAllSelected={selection.isAllSelected}
      disabled={props.loading}
      showClear={selection.selectedIds.size >= 2}
      onToggleSelectMode={selection.toggleSelectMode}
      onToggleAll={selection.toggleAll}
      onClear={selection.clearSelection}
      onDeactivate={() => runBulk(props, selection, props.onBulkDeactivate)}
      onDelete={() => runBulk(props, selection, props.onBulkDelete)}
    />
  );
}

function FeedbackRows({
  props,
  selection,
}: {
  props: FeedbackListProps;
  selection: FeedbackSelection;
}) {
  return (
    <ul className="list list--bleed feedback-admin__list">
      {props.items.map((item) => {
        const id = getFeedbackId(item);
        return (
          <FeedbackCard
            key={id}
            item={item}
            busyItemId={props.busyItemId}
            selectMode={selection.selectMode}
            selected={selection.selectedIds.has(id)}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
            onToggle={props.onToggle}
            onSelect={selection.toggleOne}
          />
        );
      })}
    </ul>
  );
}

function FeedbackTableHead() {
  const { t } = useTranslation();
  const keys = ["image", "author", "category", "order", "status", "updated"];
  return (
    <div
      className="news-list__head feedback-admin__head-row"
      aria-hidden="true"
    >
      {keys.map((key) => (
        <div key={key} className="news-list__h">
          {t(`admin.feedbacks.table.${key}`)}
        </div>
      ))}
      <div className="news-list__h news-list__h--right">
        {t("admin.feedbacks.table.actions")}
      </div>
    </div>
  );
}

async function runBulk(
  props: FeedbackListProps,
  selection: FeedbackSelection,
  action: FeedbackListProps["onBulkDelete"],
) {
  const selected = props.items.filter((item) =>
    selection.selectedIds.has(getFeedbackId(item)),
  );
  if (!selected.length) return;
  await action(selected);
  selection.toggleSelectMode();
}
