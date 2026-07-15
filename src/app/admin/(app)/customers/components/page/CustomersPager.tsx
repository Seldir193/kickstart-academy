import type { CustomersPageModel } from "./types";

type Props = { model: CustomersPageModel; t: (key: string) => string };

export default function CustomersPager({ model, t }: Props) {
  return (
    <div className="pager pager--arrows">
      <PagerButton
        label={t("admin.customers.page.pagination.previous")}
        disabled={model.filters.page <= 1}
        onClick={model.pagination.goPrev}
        left
      />
      <div className="pager__count" aria-live="polite" aria-atomic="true">
        {model.filters.page} / {model.pagination.pages}
      </div>
      <PagerButton
        label={t("admin.customers.page.pagination.next")}
        disabled={model.filters.page >= model.pagination.pages}
        onClick={model.pagination.goNext}
      />
    </div>
  );
}

function PagerButton({
  label,
  disabled,
  onClick,
  left = false,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  left?: boolean;
}) {
  return (
    <button
      type="button"
      className="btn"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      <img
        src="/icons/arrow_right_alt.svg"
        alt=""
        aria-hidden="true"
        className={`icon-img${left ? " icon-img--left" : ""}`}
      />
    </button>
  );
}
