import type { News } from "../../../types";
import type { NewsAction, NewsWithProvider, RowMode, Translate } from "../types";
import { canSubmitForReview } from "./review";
export { blurTarget, onActionKey, stop } from "./events";
export { canSubmitForReview } from "./review";

type ActionArgs = {
  n: NewsWithProvider;
  rowMode: RowMode;
  busy: boolean;
  onOpen: (n: News) => void;
  onInfo: (n: News) => void;
  onResubmit?: (n: News) => void;
  onSubmitForReview?: (n: News) => void;
  onDeleteOne?: (n: News) => void;
  onAskReject?: (n: News) => void;
  t: Translate;
};

export function actionsFor(args: ActionArgs) {
  if (args.rowMode === "mine_pending") return minePendingActions(args);
  if (args.rowMode === "mine_approved") return mineApprovedActions(args);
  if (args.rowMode === "mine_rejected") return mineRejectedActions(args);
  if (args.rowMode === "provider_approved") return providerApprovedActions(args);
  if (args.rowMode === "provider_rejected") return providerRejectedActions(args);
  return [buildOpenAction(args.n, args.busy, args.onOpen, args.t)];
}

export function buildOpenAction(
  n: NewsWithProvider,
  busy: boolean,
  onOpen: (n: News) => void,
  t: Translate,
): NewsAction {
  return action("open", "/icons/edit.svg", t("common.admin.news.table.edit"), busy, () => onOpen(n));
}

export function buildInfoAction(
  n: NewsWithProvider,
  busy: boolean,
  onInfo: (n: News) => void,
  t: Translate,
): NewsAction {
  return action("info", "/icons/info.svg", t("common.admin.news.table.info"), busy, () => onInfo(n));
}

export function buildRejectAction(
  n: NewsWithProvider,
  busy: boolean,
  t: Translate,
  onAskReject?: (n: News) => void,
): NewsAction {
  return leftAction("reject", t("common.admin.news.table.reject"), busy, () => onAskReject?.(n));
}

export function buildDeleteAction(
  n: NewsWithProvider,
  busy: boolean,
  t: Translate,
  onDeleteOne?: (n: News) => void,
): NewsAction {
  return action("delete", "/icons/delete.svg", t("common.admin.news.table.delete"), busy, () => onDeleteOne?.(n));
}

export function buildResubmitAction(
  n: NewsWithProvider,
  busy: boolean,
  t: Translate,
  onResubmit?: (n: News) => void,
): NewsAction {
  return submitAction("resubmit", t("common.admin.news.table.resubmit"), n, busy, t, () => onResubmit?.(n));
}

export function buildSubmitForReviewAction(
  n: NewsWithProvider,
  busy: boolean,
  t: Translate,
  onSubmitForReview?: (n: News) => void,
): NewsAction {
  return submitAction("submit", t("common.admin.news.table.submitForReview"), n, busy, t, () => onSubmitForReview?.(n));
}

function minePendingActions(args: ActionArgs) {
  const actions = [buildOpenAction(args.n, args.busy, args.onOpen, args.t)];
  pushDelete(actions, args);
  return actions;
}

function mineApprovedActions(args: ActionArgs) {
  const actions = infoOpen(args);
  if (args.onSubmitForReview) actions.push(buildSubmitForReviewAction(args.n, args.busy, args.t, args.onSubmitForReview));
  pushDelete(actions, args);
  return actions;
}

function mineRejectedActions(args: ActionArgs) {
  const actions = infoOpen(args);
  if (args.onResubmit) actions.push(buildResubmitAction(args.n, args.busy, args.t, args.onResubmit));
  pushDelete(actions, args);
  return actions;
}

function providerApprovedActions(args: ActionArgs) {
  const actions = openInfo(args);
  if (args.onAskReject) actions.push(buildRejectAction(args.n, args.busy, args.t, args.onAskReject));
  pushDelete(actions, args);
  return actions;
}

function providerRejectedActions(args: ActionArgs) {
  const actions = openInfo(args);
  pushDelete(actions, args);
  return actions;
}

function infoOpen(args: ActionArgs) {
  return [
    buildInfoAction(args.n, args.busy, args.onInfo, args.t),
    buildOpenAction(args.n, args.busy, args.onOpen, args.t),
  ];
}

function openInfo(args: ActionArgs) {
  return [
    buildOpenAction(args.n, args.busy, args.onOpen, args.t),
    buildInfoAction(args.n, args.busy, args.onInfo, args.t),
  ];
}

function pushDelete(actions: NewsAction[], args: ActionArgs) {
  if (args.onDeleteOne) actions.push(buildDeleteAction(args.n, args.busy, args.t, args.onDeleteOne));
}

function action(key: string, icon: string, title: string, disabled: boolean, run: () => void | Promise<void>) {
  return { key, icon, title, disabled, run };
}

function leftAction(key: string, title: string, disabled: boolean, run: () => void | Promise<void>) {
  return { ...action(key, "/icons/arrow_right_alt.svg", title, disabled, run), left: true };
}

function submitAction(key: string, title: string, n: NewsWithProvider, busy: boolean, t: Translate, run: () => void | Promise<void>) {
  const ok = canSubmitForReview(n);
  return { ...leftAction(key, title, busy || !ok, run), tip: ok ? undefined : t("common.admin.news.table.updateFirst") };
}
