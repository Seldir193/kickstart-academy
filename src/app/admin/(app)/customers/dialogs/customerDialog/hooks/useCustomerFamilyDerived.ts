"use client";

import { useMemo } from "react";
import type { TFunction } from "i18next";
import type { Customer } from "../../../types";
import { formatChildLabel } from "../formatters";
import type { FamilyMember } from "../types";
import {
  buildVisibleSelfMembers,
  isSelfFamilyMember,
  pickMember,
  safeText,
  selfLabelFromForm,
  selfLabelFromMember,
} from "./customerFamily.helpers";

export function useCustomerFamilyDerived(
  members: FamilyMember[],
  form: Customer,
  baseId: string | null,
  activeCustomerId: string | null,
  t: TFunction,
) {
  const childFamilyMembers = useMemo(
    () => members.filter((member) => !isSelfFamilyMember(member)),
    [members],
  );
  const selfFamilyMembers = useMemo(
    () => buildVisibleSelfMembers(members, form, baseId),
    [members, form, baseId],
  );
  const activeFamilyId =
    safeText((form as any)?.__activeFamilyId) ||
    activeCustomerId ||
    baseId ||
    "";
  const selectedFamilyMember = useMemo(
    () => pickMember(members, activeFamilyId),
    [members, activeFamilyId],
  );
  const selectedChildLabel = useMemo(
    () => childLabel(childFamilyMembers, activeFamilyId, t),
    [childFamilyMembers, activeFamilyId, t],
  );
  const selectedSelfLabel = useMemo(
    () => selfLabel(selfFamilyMembers, activeFamilyId, form),
    [selfFamilyMembers, activeFamilyId, form],
  );
  return {
    childFamilyMembers,
    selfFamilyMembers,
    activeFamilyId,
    selectedFamilyMember,
    selectedChildLabel,
    selectedSelfLabel,
  };
}

function childLabel(members: FamilyMember[], activeId: string, t: TFunction) {
  const member = members.find((item) => item._id === activeId);
  return member ? formatChildLabel(member, t) : "";
}

function selfLabel(members: FamilyMember[], activeId: string, form: Customer) {
  const member = members.find((item) => item._id === activeId);
  if (member) return selfLabelFromMember(member);
  return (
    selfLabelFromForm(form) ||
    (members[0] ? selfLabelFromMember(members[0]) : "")
  );
}
