"use client";

import { useTranslation } from "react-i18next";
import ProgramFilterBox from "./filtersBar/ProgramFilterBox";
import SearchFilter from "./filtersBar/SearchFilter";
import SortFilterBox from "./filtersBar/SortFilterBox";
import StatusFilterBox from "./filtersBar/StatusFilterBox";
import type { FiltersBarProps } from "./filtersBar/filtersBar.types";

export default function FiltersBar(props: FiltersBarProps) {
  const { t } = useTranslation();
  return <div className="news-admin__filters"><SearchFilter {...props} /><ProgramFilterBox {...props} t={t} /><StatusFilterBox {...props} t={t} /><SortFilterBox {...props} t={t} /></div>;
}
