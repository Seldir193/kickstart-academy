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

type Translate = ReturnType<typeof useTranslation>["t"];

export default function MembersFilters(props: MembersFiltersProps) {
  const { t } = useTranslation();
  const roles = useMemo(() => roleOptions(t), [t]);
  const statuses = useMemo(() => statusOptions(t), [t]);
  const sorts = useMemo(() => sortOptions(t), [t]);
  return (
    <div className="members-filters">
      <MembersSearchField value={props.q} onChange={props.onChangeQ} t={t} />
      <RoleDropdown {...props} options={roles} t={t} />
      <StatusDropdown {...props} options={statuses} t={t} />
      <SortDropdown {...props} options={sorts} t={t} />
    </div>
  );
}

function RoleDropdown(
  props: MembersFiltersProps & {
    options: ReturnType<typeof roleOptions>;
    t: Translate;
  },
) {
  return (
    <MembersFilterDropdown
      ariaLabel={props.t("common.admin.members.filters.role")}
      value={props.role}
      options={props.options}
      onChange={props.onChangeRole}
    />
  );
}

function StatusDropdown(
  props: MembersFiltersProps & {
    options: ReturnType<typeof statusOptions>;
    t: Translate;
  },
) {
  return (
    <MembersFilterDropdown
      ariaLabel={props.t("common.admin.members.table.status")}
      value={props.status}
      options={props.options}
      onChange={props.onChangeStatus}
    />
  );
}

function SortDropdown(
  props: MembersFiltersProps & {
    options: ReturnType<typeof sortOptions>;
    t: Translate;
  },
) {
  return (
    <MembersFilterDropdown
      className="members-filters__dd members-filters__dd--sort"
      ariaLabel={props.t("common.admin.members.filters.sortOrder")}
      value={props.sort}
      options={props.options}
      onChange={props.onChangeSort}
    />
  );
}
