import type { FamilyMember } from "../../types";
import { safeText } from "./text";

export function applySelectedChildToFresh(fresh: any, uid: string) {
  const normalizedUid = safeText(uid);
  if (!fresh) return fresh;
  if (!normalizedUid) return clearFreshChild(fresh);
  return selectedFreshChild(fresh, normalizedUid) ? withFreshChild(fresh, selectedFreshChild(fresh, normalizedUid)) : clearFreshChild(fresh);
}

export function clearFreshChild(fresh: any) {
  if (!fresh) return fresh;
  return { ...fresh, child: emptyFreshChild(), __activeChildUid: "" };
}

export function parentPayloadFromMember(member: FamilyMember | null) {
  if (!member) return null;
  return { salutation: safeText(member.parent?.salutation), firstName: safeText(member.parent?.firstName), lastName: safeText(member.parent?.lastName), email: safeText(member.parent?.email), phone: safeText((member.parent as any)?.phone), phone2: safeText((member.parent as any)?.phone2) };
}

function selectedFreshChild(fresh: any, uid: string) {
  const children = Array.isArray(fresh.children) ? fresh.children : [];
  const legacy = fresh.child || null;
  return children.find((child: any) => safeText(child?.uid) === uid) || (safeText(legacy?.uid) === uid ? legacy : null);
}

function withFreshChild(fresh: any, hit: any) {
  return { ...fresh, child: { uid: safeText(hit?.uid), firstName: safeText(hit?.firstName), lastName: safeText(hit?.lastName), gender: safeText(hit?.gender), birthDate: hit?.birthDate ?? null, club: safeText(hit?.club) }, __activeChildUid: safeText(hit?.uid) };
}

function emptyFreshChild() {
  return { uid: "", firstName: "", lastName: "", gender: "", birthDate: null, club: "" };
}
