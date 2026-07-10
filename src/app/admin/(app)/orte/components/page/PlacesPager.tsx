"use client";

import type { TFunction } from "i18next";
import type { useOrtePageState } from "./useOrtePageState";

type Props = {
  model: ReturnType<typeof useOrtePageState>;
  t: TFunction;
};

export default function PlacesPager({ model, t }: Props) {
  return (
    <div className="pager pager--arrows mt-3">
      <PagerButton direction="previous" disabled={model.list.loading || model.page <= 1} onClick={model.previousPage} t={t} />
      <div className="pager__count" aria-live="polite" aria-atomic="true">
        {model.page} / {model.list.pageCount}
      </div>
      <PagerButton direction="next" disabled={model.list.loading || model.page >= model.list.pageCount} onClick={model.nextPage} t={t} />
    </div>
  );
}

type ButtonProps = {
  direction: "previous" | "next";
  disabled: boolean;
  onClick: () => void;
  t: TFunction;
};

function PagerButton({ direction, disabled, onClick, t }: ButtonProps) {
  return (
    <button type="button" className="btn" aria-label={pagerLabel(direction, t)} disabled={disabled} onClick={onClick}>
      <img src="/icons/arrow_right_alt.svg" alt="" aria-hidden="true" className={pagerIconClass(direction)} />
    </button>
  );
}

function pagerIconClass(direction: ButtonProps["direction"]) {
  return "icon-img" + (direction === "previous" ? " icon-img--left" : "");
}

function pagerLabel(direction: ButtonProps["direction"], t: TFunction) {
  const key = `common.admin.places.pagination.${direction}`;
  const defaultValue = direction === "previous" ? "Previous page" : "Next page";
  return t(key, { defaultValue });
}
