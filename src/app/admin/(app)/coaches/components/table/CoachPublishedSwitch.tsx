import type React from "react";
import type { TFunction } from "i18next";
import type { Coach } from "../../types";
import { onActionKey, stopEvent } from "./coachTableEvents";
import type { CoachRowMeta } from "./types";

type Props = {
  meta: CoachRowMeta;
  t: TFunction;
  onTogglePublished?: (
    c: Coach,
    nextPublished: boolean,
  ) => void | Promise<void>;
};

export default function CoachPublishedSwitch(props: Props) {
  if (!props.meta.approved || !props.onTogglePublished) return null;
  return (
    <span
      className={wrapClass(props.meta)}
      onClick={stopEvent}
      onMouseDown={stopEvent}
      onPointerDown={stopEvent}
    >
      <SwitchButton {...props} />
    </span>
  );
}

function wrapClass({ isSwitchBusy }: CoachRowMeta) {
  return `coach-switch-wrap ${isSwitchBusy ? "is-busy" : ""}`;
}

function SwitchButton(props: Props) {
  return (
    <span
      className={switchClass(props.meta)}
      role="switch"
      aria-checked={props.meta.published}
      aria-disabled={ariaDisabled(props.meta.isSwitchBusy)}
      tabIndex={0}
      onClick={(e) => switchClick(e, props)}
      onKeyDown={(e) => switchKey(e, props)}
      title={switchTitle(props)}
    >
      {renderSwitchTrack()}
    </span>
  );
}

function renderSwitchTrack() {
  return (
    <span className="coach-switch__track">
      <span className="coach-switch__thumb" />
    </span>
  );
}

function switchClass({ published }: CoachRowMeta) {
  return `coach-switch ${published ? "is-on" : ""}`;
}

function ariaDisabled(disabled: boolean) {
  return disabled ? true : undefined;
}

function switchClick(e: React.SyntheticEvent, props: Props) {
  stopEvent(e);
  if (!props.meta.isSwitchBusy)
    props.onTogglePublished?.(props.meta.raw, !props.meta.published);
}

function switchKey(e: React.KeyboardEvent, props: Props) {
  onActionKey(
    e,
    () => props.onTogglePublished?.(props.meta.raw, !props.meta.published),
    props.meta.isSwitchBusy,
  );
}

function switchTitle({ meta, t }: Props) {
  return meta.published
    ? t("common.admin.coaches.table.online")
    : t("common.admin.coaches.table.offline");
}
