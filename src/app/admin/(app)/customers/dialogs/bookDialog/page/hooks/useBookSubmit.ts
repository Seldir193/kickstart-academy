import { useState } from "react";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
import {
  confirmBookingIfPossible,
  createBooking,
  fetchCustomerById,
} from "../../bookDialogApi";
import { holidayFromOf, holidayToOf } from "../lib/offerKind";
import {
  applySelectedChildToFresh,
  clearFreshChild,
  parentPayloadFromMember,
} from "../lib/freshCustomer";
import { normalizeGender, safeText } from "../lib/text";
import type {
  BookDetailsState,
  BookFamilyScope,
  BookOfferScope,
  BookSubmitState,
  TFunc,
} from "../types";

export function useBookSubmit(ctx: SubmitHookContext): BookSubmitState {
  const [saving, setSaving] = useState(false);
  const submit = () => runSubmit({ ...ctx, saving, setSaving });
  return { saving, submit };
}

type SubmitHookContext = {
  customerId: string;
  onClose: () => void;
  onBooked: (freshCustomer: any) => void;
  family: BookFamilyScope;
  offers: BookOfferScope;
  details: BookDetailsState;
  t: TFunc;
};
type SubmitContext = SubmitHookContext & {
  saving: boolean;
  setSaving: (value: boolean) => void;
};

async function runSubmit(ctx: SubmitContext) {
  if (!ctx.offers.selectedOfferId || !ctx.offers.selectedDate) return;
  const uid = safeText(ctx.family.activeChild?.uid);
  if (missingChild(ctx, uid)) return selectChildError(ctx);
  startSaving(ctx);
  try {
    await submitFlow(ctx, uid);
  } catch (error: unknown) {
    handleSubmitError(ctx, error);
  } finally {
    ctx.setSaving(false);
  }
}

function missingChild(ctx: SubmitContext, uid: string) {
  return ctx.family.bookingTarget === "child" && !uid;
}

function selectChildError(ctx: SubmitContext) {
  ctx.offers.setErr(
    toastText(
      ctx.t,
      "common.admin.customers.bookDialog.errors.selectChildMissingUid",
    ),
  );
}

function startSaving(ctx: SubmitContext) {
  ctx.setSaving(true);
  ctx.offers.setErr(null);
}

async function submitFlow(ctx: SubmitContext, uid: string) {
  const payload = await createBooking(
    ctx.customerId,
    ctx.offers.selectedOfferId,
    ctx.offers.selectedDate,
    ctx.family.bookingTarget,
    childPayload(ctx, uid),
    parentPayloadFromMember(ctx.family.selectedParent),
    extraPayload(ctx),
  );
  await confirmBookingIfPossible(payload?.booking?._id);
  await finishSubmit(ctx, uid);
}

async function finishSubmit(ctx: SubmitContext, uid: string) {
  const freshRaw = await fetchCustomerById(ctx.customerId);
  const fresh =
    ctx.family.bookingTarget === "child"
      ? applySelectedChildToFresh(freshRaw, uid)
      : clearFreshChild(freshRaw);
  if (fresh) ctx.onBooked(fresh);
  ctx.onClose();
}

function handleSubmitError(ctx: SubmitContext, error: unknown) {
  ctx.offers.setErr(
    toastErrorMessage(
      ctx.t,
      error,
      "common.admin.customers.bookDialog.errors.bookingFailed",
    ),
  );
}

function childPayload(ctx: SubmitContext, uid: string) {
  return ctx.family.bookingTarget === "child"
    ? {
        uid,
        firstName: safeText(ctx.family.activeChild?.firstName),
        lastName: safeText(ctx.family.activeChild?.lastName),
      }
    : { uid: "", firstName: "", lastName: "" };
}

function extraPayload(ctx: SubmitContext) {
  return {
    scheduleLine: ctx.offers.scheduleLine,
    scheduleLabel: ctx.offers.scheduleLabel,
    holidayLabel: holidayLabel(ctx),
    holidayFrom: holidayFrom(ctx),
    holidayTo: holidayTo(ctx),
    childGender: normalizeGender((ctx.family.activeChild as any)?.gender),
    ...detailPayload(ctx.details),
  };
}

function holidayLabel(ctx: SubmitContext) {
  return ctx.offers.isCamp || ctx.offers.isPowertraining
    ? ctx.offers.holidayLabel
    : "";
}

function holidayFrom(ctx: SubmitContext) {
  return ctx.offers.isCamp || ctx.offers.isPowertraining
    ? safeText(holidayFromOf(ctx.offers.selectedOffer))
    : "";
}

function holidayTo(ctx: SubmitContext) {
  return ctx.offers.isCamp || ctx.offers.isPowertraining
    ? safeText(holidayToOf(ctx.offers.selectedOffer))
    : "";
}

function detailPayload(details: BookDetailsState) {
  return {
    voucher: details.voucher,
    source: details.source,
    mainTShirtSize: details.mainTShirtSize,
    mainGoalkeeperSchool: details.mainGoalkeeperSchool,
    hasSibling: details.hasSibling,
    siblingGender: details.siblingGender,
    siblingBirthDate: details.siblingBirthDate,
    siblingFirstName: details.siblingFirstName,
    siblingLastName: details.siblingLastName,
    siblingTShirtSize: details.siblingTShirtSize,
    siblingGoalkeeperSchool: details.siblingGoalkeeperSchool,
  };
}
