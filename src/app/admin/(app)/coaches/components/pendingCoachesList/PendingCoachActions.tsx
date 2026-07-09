import PendingCoachActionButton from "./PendingCoachActionButton";
import type { PendingCoachActionProps } from "./types";

type ActionItem = {
  label: string;
  danger?: boolean;
  onClick: () => void;
};

function runWhenEnabled(disabled: boolean, action: () => void) {
  return disabled ? null : action();
}

function getActionItems(p: PendingCoachActionProps): ActionItem[] {
  const { c, t } = p;

  return [
    { label: t("common.admin.coaches.pending.open"), onClick: () => p.onOpen(c) },
    { label: t("common.admin.coaches.pending.approve"), onClick: () => p.onApprove(c) },
    { label: t("common.admin.coaches.pending.reject"), danger: true, onClick: () => p.onReject(c) },
  ];
}

function renderAction(action: ActionItem, disabled: boolean) {
  return (
    <PendingCoachActionButton
      key={action.label}
      {...action}
      disabled={disabled}
      onClick={() => runWhenEnabled(disabled, action.onClick)}
    />
  );
}

export default function PendingCoachActions(p: PendingCoachActionProps) {
  const actions = getActionItems(p);

  return <div className="pending-coaches__actions">{actions.map((action) => renderAction(action, p.disabled))}</div>;
}
