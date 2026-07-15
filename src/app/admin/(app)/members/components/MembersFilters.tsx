"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import MembersFilterDropdown from "./filters/MembersFilterDropdown";
import MembersSearchField from "./filters/MembersSearchField";
import {
  roleOptions,
  sortOptions,
  statusOptions,
} from "./filters/membersFilterOptions";
import type { MembersFiltersProps } from "./filters/membersFilters.types";

export default function MembersFilters(props: MembersFiltersProps) {
  const { t } = useTranslation();
  const roles = useMemo(() => roleOptions(t), [t]);
  const statuses = useMemo(() => statusOptions(t), [t]);
  const sorts = useMemo(() => sortOptions(t), [t]);
  return (
    <div className="members-filters">
      <MembersSearchField value={props.q} onChange={props.onChangeQ} t={t} />
      <MembersFilterDropdown
        ariaLabel={t("common.admin.members.filters.role")}
        value={props.role}
        options={roles}
        onChange={props.onChangeRole}
      />
      <MembersFilterDropdown
        ariaLabel={t("common.admin.members.table.status")}
        value={props.status}
        options={statuses}
        onChange={props.onChangeStatus}
      />
      <MembersFilterDropdown
        className="members-filters__dd members-filters__dd--sort"
        ariaLabel={t("common.admin.members.filters.sortOrder")}
        value={props.sort}
        options={sorts}
        onChange={props.onChangeSort}
      />
    </div>
  );
}
