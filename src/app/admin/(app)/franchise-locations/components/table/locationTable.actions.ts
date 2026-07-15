import type { FranchiseLocation } from "../../types";
import { canSubmitUpdate } from "../../franchise_locations.utils";
import type { Action, RowMode, TFn } from "./locationTable.types";

type ActionArgs = {
  it: FranchiseLocation;
  rowMode: RowMode;
  busy: boolean;
  onOpen: (it: FranchiseLocation) => void;
  onInfo?: (it: FranchiseLocation) => void;
  onResubmit?: (it: FranchiseLocation) => void;
  onSubmitForReview?: (it: FranchiseLocation) => void;
  onDeleteOne?: (it: FranchiseLocation) => void;
  onAskReject?: (it: FranchiseLocation) => void;
  t: TFn;
};

function action(
  key: string,
  icon: string,
  title: string,
  disabled: boolean,
  run: () => void | Promise<void>,
): Action {
  return { key, icon, title, disabled, run };
}

export function buildOpenAction(
  it: FranchiseLocation,
  busy: boolean,
  onOpen: (it: FranchiseLocation) => void,
  t: TFn,
): Action {
  return action(
    "open",
    "/icons/edit.svg",
    t("common.admin.franchiseLocations.actions.edit"),
    busy,
    () => onOpen(it),
  );
}

export function buildInfoAction(
  it: FranchiseLocation,
  busy: boolean,
  onInfo: (it: FranchiseLocation) => void,
  t: TFn,
): Action {
  return action(
    "info",
    "/icons/info.svg",
    t("common.admin.franchiseLocations.actions.info"),
    busy,
    () => onInfo(it),
  );
}

export function buildDeleteAction(
  it: FranchiseLocation,
  busy: boolean,
  onDelete: (it: FranchiseLocation) => void,
  t: TFn,
): Action {
  return action(
    "delete",
    "/icons/delete.svg",
    t("common.admin.franchiseLocations.actions.delete"),
    busy,
    () => onDelete(it),
  );
}

export function buildRejectAction(
  it: FranchiseLocation,
  busy: boolean,
  onReject: (it: FranchiseLocation) => void,
  t: TFn,
): Action {
  return {
    ...action(
      "reject",
      "/icons/arrow_right_alt.svg",
      t("common.admin.franchiseLocations.actions.reject"),
      busy,
      () => onReject(it),
    ),
    left: true,
  };
}

function submitState(it: FranchiseLocation, busy: boolean, t: TFn) {
  const allowed = canSubmitUpdate(it);
  const tip = allowed
    ? undefined
    : t("common.admin.franchiseLocations.actions.updateFirst");
  return { disabled: busy || !allowed, tip };
}

function reviewAction(
  key: string,
  titleKey: string,
  it: FranchiseLocation,
  busy: boolean,
  run: () => void,
  t: TFn,
): Action {
  const state = submitState(it, busy, t);
  const base = action(
    key,
    "/icons/arrow_right_alt.svg",
    t(titleKey),
    state.disabled,
    run,
  );
  return { ...base, left: true, tip: state.tip };
}

export function buildResubmitAction(
  it: FranchiseLocation,
  busy: boolean,
  onResubmit: (it: FranchiseLocation) => void,
  t: TFn,
): Action {
  const key = "common.admin.franchiseLocations.actions.resubmit";
  return reviewAction("resubmit", key, it, busy, () => onResubmit(it), t);
}

export function buildSubmitForReviewAction(
  it: FranchiseLocation,
  busy: boolean,
  onSubmit: (it: FranchiseLocation) => void,
  t: TFn,
): Action {
  const key = "common.admin.franchiseLocations.actions.submitForReview";
  return reviewAction("submit", key, it, busy, () => onSubmit(it), t);
}

function optionalAction(
  callback: ((it: FranchiseLocation) => void) | undefined,
  build: (callback: (it: FranchiseLocation) => void) => Action,
) {
  return callback ? build(callback) : null;
}

function compact(actions: Array<Action | null>) {
  return actions.filter((item): item is Action => item !== null);
}

function minePending(args: ActionArgs) {
  const { it, busy, onOpen, onDeleteOne, t } = args;
  return compact([
    buildOpenAction(it, busy, onOpen, t),
    optionalAction(onDeleteOne, (cb) => buildDeleteAction(it, busy, cb, t)),
  ]);
}

function mineApproved(args: ActionArgs) {
  const { it, busy, onOpen, onInfo, onSubmitForReview, onDeleteOne, t } = args;
  return compact([
    buildOpenAction(it, busy, onOpen, t),
    optionalAction(onInfo, (cb) => buildInfoAction(it, busy, cb, t)),
    optionalAction(onSubmitForReview, (cb) =>
      buildSubmitForReviewAction(it, busy, cb, t),
    ),
    optionalAction(onDeleteOne, (cb) => buildDeleteAction(it, busy, cb, t)),
  ]);
}

function mineRejected(args: ActionArgs) {
  const { it, busy, onOpen, onInfo, onResubmit, onDeleteOne, t } = args;
  return compact([
    buildOpenAction(it, busy, onOpen, t),
    optionalAction(onInfo, (cb) => buildInfoAction(it, busy, cb, t)),
    optionalAction(onResubmit, (cb) => buildResubmitAction(it, busy, cb, t)),
    optionalAction(onDeleteOne, (cb) => buildDeleteAction(it, busy, cb, t)),
  ]);
}

function providerPending(args: ActionArgs) {
  const { it, busy, onInfo, onAskReject, onDeleteOne, t } = args;
  return compact([
    optionalAction(onInfo, (cb) => buildInfoAction(it, busy, cb, t)),
    optionalAction(onAskReject, (cb) => buildRejectAction(it, busy, cb, t)),
    optionalAction(onDeleteOne, (cb) => buildDeleteAction(it, busy, cb, t)),
  ]);
}

function providerApproved(args: ActionArgs) {
  const { it, busy, onOpen, onInfo, onAskReject, onDeleteOne, t } = args;
  return compact([
    optionalAction(onInfo, (cb) => buildInfoAction(it, busy, cb, t)),
    buildOpenAction(it, busy, onOpen, t),
    optionalAction(onAskReject, (cb) => buildRejectAction(it, busy, cb, t)),
    optionalAction(onDeleteOne, (cb) => buildDeleteAction(it, busy, cb, t)),
  ]);
}

function providerRejected(args: ActionArgs) {
  const { it, busy, onOpen, onInfo, onDeleteOne, t } = args;
  return compact([
    optionalAction(onInfo, (cb) => buildInfoAction(it, busy, cb, t)),
    buildOpenAction(it, busy, onOpen, t),
    optionalAction(onDeleteOne, (cb) => buildDeleteAction(it, busy, cb, t)),
  ]);
}

const actionBuilders: Record<RowMode, (args: ActionArgs) => Action[]> = {
  mine_pending: minePending,
  mine_approved: mineApproved,
  mine_rejected: mineRejected,
  provider_pending: providerPending,
  provider_approved: providerApproved,
  provider_rejected: providerRejected,
};

export function actionsFor(args: ActionArgs) {
  return actionBuilders[args.rowMode](args);
}
