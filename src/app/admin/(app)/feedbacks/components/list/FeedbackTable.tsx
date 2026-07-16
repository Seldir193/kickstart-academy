import { useTranslation } from "react-i18next";
import FeedbackBulkActions from "../FeedbackBulkActions";
import FeedbackCard from "../FeedbackCard";
import { getFeedbackId } from "../../helpers";
import type { Feedback } from "../../types";
import type { FeedbackListProps } from "./feedbackList.types";
import type { FeedbackSelection } from "./useFeedbackSelection";

type Translate = ReturnType<typeof useTranslation>["t"];

type TableView = {
  props: FeedbackListProps;
  selection: FeedbackSelection;
};

const HEAD_KEYS = ["image", "author", "category", "order", "status", "updated"];

export default function FeedbackTable(view: TableView) {
  return (
    <div className="news-admin__box news-admin__box--scroll3">
      <div className="news-table">
        <div className="news-admin__top-actions">
          <FeedbackToolbar {...view} />
        </div>
        <FeedbackTableScroll {...view} />
      </div>
    </div>
  );
}

function FeedbackTableScroll(view: TableView) {
  return (
    <div className="news-table__scroll">
      <section className="card news-list">
        <div className="news-list__table">
          <FeedbackTableHead />
          <FeedbackRows {...view} />
        </div>
      </section>
    </div>
  );
}

function FeedbackToolbar(view: TableView) {
  return <FeedbackBulkActions {...bulkProps(view)} />;
}

function FeedbackRows({ props, selection }: TableView) {
  return (
    <ul className="list list--bleed feedback-admin__list">
      {props.items.map((item) => (
        <FeedbackRow
          key={getFeedbackId(item)}
          item={item}
          props={props}
          selection={selection}
        />
      ))}
    </ul>
  );
}

function FeedbackRow({
  item,
  props,
  selection,
}: TableView & { item: Feedback }) {
  return (
    <FeedbackCard
      item={item}
      busyItemId={props.busyItemId}
      selectMode={selection.selectMode}
      selected={selection.selectedIds.has(getFeedbackId(item))}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
      onToggle={props.onToggle}
      onSelect={selection.toggleOne}
    />
  );
}

function FeedbackTableHead() {
  const { t } = useTranslation();
  return (
    <div
      className="news-list__head feedback-admin__head-row"
      aria-hidden="true"
    >
      {HEAD_KEYS.map((key) => (
        <HeadCell key={key} label={t(`admin.feedbacks.table.${key}`)} />
      ))}
      <ActionsHeadCell t={t} />
    </div>
  );
}

function HeadCell({ label }: { label: string }) {
  return <div className="news-list__h">{label}</div>;
}

function ActionsHeadCell({ t }: { t: Translate }) {
  return (
    <div className="news-list__h news-list__h--right">
      {t("admin.feedbacks.table.actions")}
    </div>
  );
}

function bulkProps({ props, selection }: TableView) {
  return {
    ...bulkRefs(selection),
    ...bulkState(props, selection),
    ...bulkHandlers(props, selection),
  };
}

function bulkRefs(selection: FeedbackSelection) {
  return {
    toggleRef: selection.toggleRef,
    cancelRef: selection.cancelRef,
    clearRef: selection.clearRef,
  };
}

function bulkState(props: FeedbackListProps, selection: FeedbackSelection) {
  return {
    selectMode: selection.selectMode,
    count: selection.selectedIds.size,
    isAllSelected: selection.isAllSelected,
    disabled: props.loading,
    showClear: selection.selectedIds.size >= 2,
  };
}

function bulkHandlers(props: FeedbackListProps, selection: FeedbackSelection) {
  return {
    onToggleSelectMode: selection.toggleSelectMode,
    onToggleAll: selection.toggleAll,
    onClear: selection.clearSelection,
    onDeactivate: () => runBulk(props, selection, props.onBulkDeactivate),
    onDelete: () => runBulk(props, selection, props.onBulkDelete),
  };
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
