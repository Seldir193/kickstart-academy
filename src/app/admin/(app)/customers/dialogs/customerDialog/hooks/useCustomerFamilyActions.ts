"use client";

import type { Customer } from "../../../types";
import type { FamilyCreateMode, FamilyMember } from "../types";
import {
  baseIdFromFamilyId, childIndexFromFamilyId, isParentFamilyId,
  newUid, normalizeParent, parentFamilyId, pickChildFromExpandedMember,
} from "./customerFamily.helpers";
import { fetchCustomerSelection } from "./customerFamily.loaders";

type Params = {
  form: Customer; setForm: (value: any) => void; baseCustomerId: string | null;
  familyMembers: FamilyMember[]; selfFamilyMembers: FamilyMember[];
  setFamilyCreateMode: (value: FamilyCreateMode) => void;
  setActiveCustomerId: (value: string | null) => void;
  closeDropdowns: () => void; reloadFamily: (id?: string) => Promise<void>;
};

export function useCustomerFamilyActions(params: Params) {
  async function loadCustomer(baseId: string, activeId: string, child: any) {
    try {
      params.setForm(await fetchCustomerSelection(baseId, activeId, child));
      params.closeDropdowns();
      params.setActiveCustomerId(activeId);
      await params.reloadFamily(baseId);
    } catch (error) {
      console.error("loadCustomerById failed", error);
    }
  }

  function handleSelectFamilyMember(id: string) {
    if (!id) return;
    prepareSelection(params, id);
    if (isParentFamilyId(id)) return selectParent(params, id);
    const member = params.familyMembers.find((item) => item._id === id);
    const index = childIndexFromFamilyId(id);
    const child = member ? pickChildFromExpandedMember(member, index) : null;
    void loadCustomer(baseIdFromFamilyId(id), id, child);
  }

  function handleAddSibling() {
    const base = params.baseCustomerId || params.form._id;
    if (!base) return;
    const id = `${base}::child::-1`;
    prepareCreate(params, "newChild", id);
    params.setForm((previous: any) => siblingForm(previous, id));
  }

  function handleAddParent() {
    const base = params.baseCustomerId || params.form._id;
    if (!base) return;
    const parents = Array.isArray((params.form as any)?.parents) ? (params.form as any).parents : [];
    const id = parentFamilyId(base, parents.length);
    prepareCreate(params, "newParent", id);
    params.setForm((previous: any) => parentForm(previous, id));
  }

  return { handleSelectFamilyMember, handleAddSibling, handleAddParent };
}

function prepareSelection(params: Params, id: string) {
  params.setFamilyCreateMode("none");
  params.setActiveCustomerId(id);
  params.closeDropdowns();
}

function selectParent(params: Params, id: string) {
  const member = params.selfFamilyMembers.find((item) => item._id === id);
  const parent = normalizeParent(member?.parent || {});
  params.setForm((previous: any) => ({ ...previous, parent, __familyCreateMode: "none", __activeFamilyId: id }));
}

function prepareCreate(params: Params, mode: FamilyCreateMode, id: string) {
  params.setFamilyCreateMode(mode);
  params.setActiveCustomerId(id);
  params.closeDropdowns();
}

function siblingForm(previous: any, id: string) {
  const uid = newUid();
  return {
    ...previous, __familyCreateMode: "newChild", __activeChildIdx: -1,
    __activeChildUid: uid, __activeFamilyId: id,
    child: { uid, firstName: "", lastName: "", gender: "", birthDate: null, club: "" },
  };
}

function parentForm(previous: any, id: string) {
  return {
    ...previous, __familyCreateMode: "newParent", __activeFamilyId: id,
    parent: { salutation: "", firstName: "", lastName: "", email: "", phone: "", phone2: "" },
  };
}
