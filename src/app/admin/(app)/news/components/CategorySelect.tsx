"use client";

import { useTranslation } from "react-i18next";
import type { Category } from "../types";
import { CATEGORIES } from "../constants";

type Props = {
  value: Category | undefined;
  open: boolean;
  onToggle: () => void;
  onPick: (c: Category) => void;
};

export default function CategorySelect({
  value,
  open,
  onToggle,
  onPick,
}: Props) {
  const { t } = useTranslation();
  const current = value || "News";

  function categoryLabel(category: string) {
    if (category === "General" || category === "Allgemein") {
      return t("common.admin.news.categories.general");
    }
    if (category === "Partner Club" || category === "Partnerverein") {
      return t("common.admin.news.categories.partnerClub");
    }
    if (category === "Projects" || category === "Projekte") {
      return t("common.admin.news.categories.projects");
    }
    return t("common.admin.news.categories.news");
  }
  return (
    <div className={"ks-selectbox" + (open ? " ks-selectbox--open" : "")}>
      <button
        type="button"
        className="ks-selectbox__trigger"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.admin.news.categorySelect.ariaLabel")}
      >
        <span className="ks-selectbox__label">{categoryLabel(current)}</span>
        <span className="ks-selectbox__chevron" aria-hidden="true" />
      </button>

      {open ? (
        <div
          className="ks-selectbox__panel"
          role="listbox"
          aria-label={t("common.admin.news.categorySelect.optionsAriaLabel")}
        >
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={
                "ks-selectbox__option" +
                (current === c ? " ks-selectbox__option--active" : "")
              }
              onClick={() => onPick(c)}
            >
              {categoryLabel(c)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
