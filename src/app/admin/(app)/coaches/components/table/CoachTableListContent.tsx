"use client";

import { useTranslation } from "react-i18next";
import CoachTableCard from "./CoachTableCard";
import CoachTableEmpty from "./CoachTableEmpty";
import CoachTableTopActions from "./CoachTableTopActions";
import { useCoachTableState } from "./useCoachTableState";
import type { CoachTableListProps } from "./types";

export default function CoachTableListContent(props: CoachTableListProps) {
  const { t } = useTranslation();
  const state = useCoachTableState(props);
  if (!props.items.length) return <CoachTableEmpty t={t} />;
  return <><CoachTableTopActions {...topActionProps(props, state)} /><CoachTableCard {...props} selected={state.selection.selected} rowClick={state.handlers.rowClick} t={t} /></>;
}

function topActionProps(props: CoachTableListProps, state: ReturnType<typeof useCoachTableState>) {
  return { toggleBtnRef: props.toggleBtnRef, cancelBtnRef: state.refs.cancelBtnRef, clearBtnRef: state.refs.clearBtnRef, selectMode: props.selectMode, count: state.count, isAllSelected: state.selection.isAllSelected, disabled: props.items.length === 0, showClear: state.showClear, handlers: state.handlers };
}
