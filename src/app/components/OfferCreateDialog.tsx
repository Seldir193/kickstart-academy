//src\app\components\OfferCreateDialog.tsx
"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import KsDatePicker from "@/app/admin/(app)/invoices/components/KsDatePicker";
import KsTimeSelect from "@/app/admin/(app)/invoices/components/KsTimeSelect";

import type { CreateOfferPayload } from "./offer-create-dialog/types";
import type {
  OfferDialogInitial,
  OfferDialogMode,
} from "./offer-create-dialog/types";

import { clsx } from "./offer-create-dialog/utils";
import { useOfferCreateDialog } from "./offer-create-dialog/useOfferCreateDialog";

import {
  CategoryField,
  CourseField,
  DialogShell,
  HolidayWeekField,
  PlaceField,
} from "./offer-create-dialog/sections";

export default function OfferCreateDialog({
  open,
  mode = "create",
  initial,
  onClose,
  onCreate,
  onSave,
}: {
  open: boolean;
  mode?: OfferDialogMode;
  initial?: OfferDialogInitial;
  onClose: () => void;
  onCreate?: (payload: CreateOfferPayload) => Promise<void> | void;
  onSave?: (id: string, payload: CreateOfferPayload) => Promise<void> | void;
}) {
  const d = useOfferCreateDialog({
    open,
    mode,
    initial,
    onClose,
    onCreate,
    onSave,
  });

  const { t } = useTranslation();
  const coachFileInputId = React.useId();
  const emptyFileLabel = t("common.offerDialog.file.noneSelected");
  const [coachFileName, setCoachFileName] = React.useState(emptyFileLabel);

  if (!open) return null;

  return (
    <DialogShell
      panelRef={d.panelRef}
      onClose={onClose}
      title={
        mode === "edit"
          ? t("common.offerDialog.title.edit")
          : t("common.offerDialog.title.create")
      }
    >
      <form onSubmit={d.handleSubmit} className="form offer-create-dialog">
        <div className="grid grid--2">
          <CategoryField
            categoryDropdownRef={d.categoryDropdownRef}
            categoryOpen={d.categoryOpen}
            setCategoryOpen={d.setCategoryOpen}
            categoryUI={d.categoryUI}
            onPick={d.handleCategoryChange}
          />

          <CourseField
            courseDropdownRef={d.courseDropdownRef}
            courseOpen={d.courseOpen}
            setCourseOpen={d.setCourseOpen}
            selectedCourseLabel={d.selectedCourseLabel}
            courseUI={d.courseUI}
            groupedCourses={d.groupedCourses}
            onPick={d.handleCourseChange}
          />
        </div>

        <p className="help offer-create-dialog__help">
          {t("common.offerDialog.help.courseAutoFill")}
        </p>

        <div className="grid grid--2">
          <PlaceField
            placeDropdownRef={d.placeDropdownRef}
            placeOpen={d.placeOpen}
            setPlaceOpen={d.setPlaceOpen}
            selectedPlaceLabel={t("common.offerDialog.place.select")}
            selectedPlace={d.selectedPlace}
            places={d.places}
            onPick={d.onPlaceChange}
          />

          <div className="form__group">
            <label className="label">
              {t("common.offerDialog.fields.price")}
            </label>
            <input
              type="number"
              className="input"
              min={0}
              step="0.01"
              placeholder={t("common.offerDialog.placeholders.price")}
              value={d.form.price}
              onChange={(e) =>
                d.setForm((f) => ({
                  ...f,
                  price: e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
            />
          </div>
        </div>

        {d.isHolidayOffer ? (
          <>
            <HolidayWeekField
              holidayDropdownRef={d.holidayDropdownRef}
              holidayOpen={d.holidayOpen}
              setHolidayOpen={d.setHolidayOpen}
              holidayPreset={d.holidayPreset}
              holidayCustom={d.holidayCustom}
              onPickPreset={d.handleHolidayPresetChange}
              onChangeCustom={d.onHolidayCustomChange}
            />

            <div className="grid grid--2 offer-create-dialog">
              <div className="form__group">
                <label className="label">
                  {t("common.offerDialog.fields.holidayFrom")}
                </label>
                <KsDatePicker
                  value={d.form.dateFrom || ""}
                  onChange={(nextIso) =>
                    d.setForm((f) => ({
                      ...f,
                      dateFrom: nextIso,
                    }))
                  }
                  placeholder={t("common.offerDialog.placeholders.date")}
                  disabled={false}
                />
              </div>

              <div className="form__group">
                <label className="label">
                  {t("common.offerDialog.fields.holidayTo")}
                </label>
                <KsDatePicker
                  value={d.form.dateTo || ""}
                  onChange={(nextIso) =>
                    d.setForm((f) => ({
                      ...f,
                      dateTo: nextIso,
                    }))
                  }
                  placeholder={t("common.offerDialog.placeholders.date")}
                  disabled={false}
                />
              </div>
            </div>
          </>
        ) : null}

        <div className="grid grid--2">
          <div className="form__group">
            <label className="label">
              {t("common.offerDialog.fields.timeFrom")}
            </label>
            <KsTimeSelect
              value={d.form.timeFrom}
              onChange={(next) => d.setForm((f) => ({ ...f, timeFrom: next }))}
              stepMinutes={5}
              placeholder={t("common.offerDialog.placeholders.time")}
            />
          </div>

          <div className="form__group">
            <label className="label">
              {t("common.offerDialog.fields.timeTo")}
            </label>
            <KsTimeSelect
              value={d.form.timeTo}
              onChange={(next) => d.setForm((f) => ({ ...f, timeTo: next }))}
              stepMinutes={5}
              placeholder={t("common.offerDialog.placeholders.time")}
            />
          </div>
        </div>

        <div className="grid grid--2">
          <div className="form__group">
            <label className="label">
              {t("common.offerDialog.fields.ageFrom")}
            </label>
            <input
              type="number"
              className="input"
              placeholder={t("common.offerDialog.placeholders.ageFrom")}
              min={0}
              value={d.form.ageFrom}
              onChange={(e) =>
                d.setForm((f) => ({
                  ...f,
                  ageFrom: e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="form__group">
            <label className="label">
              {t("common.offerDialog.fields.ageTo")}
            </label>
            <input
              type="number"
              className="input"
              placeholder={t("common.offerDialog.placeholders.ageTo")}
              min={0}
              value={d.form.ageTo}
              onChange={(e) =>
                d.setForm((f) => ({
                  ...f,
                  ageTo: e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
            />
          </div>
        </div>

        <div className="form__group">
          <label className="label">{t("common.offerDialog.fields.info")}</label>
          <textarea
            className="input input--textarea"
            placeholder={t("common.offerDialog.placeholders.info")}
            value={d.form.info}
            onChange={(e) => d.setForm((f) => ({ ...f, info: e.target.value }))}
          />
        </div>

        <div className="grid grid--2">
          <div className="form__group">
            <label className="label">
              {t("common.offerDialog.fields.coachName")}
            </label>
            <input
              className="input"
              placeholder={t("common.offerDialog.placeholders.coachName")}
              value={d.form.coachName}
              onChange={(e) =>
                d.setForm((f) => ({ ...f, coachName: e.target.value }))
              }
            />
          </div>

          <div className="form__group">
            <label className="label">
              {t("common.offerDialog.fields.coachEmail")}
            </label>
            <input
              className="input"
              type="email"
              placeholder={t("common.offerDialog.placeholders.coachEmail")}
              value={d.form.coachEmail}
              onChange={(e) =>
                d.setForm((f) => ({ ...f, coachEmail: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="form__group">
          <label className="label">
            {t("common.offerDialog.fields.coachImage")}
          </label>

          <div className="upload-row">
            <div className="ks-file">
              <input
                id={coachFileInputId}
                className="ks-file__input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setCoachFileName(file?.name || emptyFileLabel);
                  d.handleCoachFileChange(e);
                }}
              />

              <label className="btn ks-file__btn" htmlFor={coachFileInputId}>
                {t("common.offerDialog.file.choose")}
              </label>

              <span
                className={
                  "ks-file__name" +
                  (coachFileName === emptyFileLabel ? " is-empty" : "")
                }
                aria-live="polite"
              >
                {coachFileName}
              </span>
            </div>

            {d.uploading && (
              <span className="uploading">
                {t("common.offerDialog.file.uploading")}
              </span>
            )}
            {d.uploadError && <span className="error">{d.uploadError}</span>}
          </div>

          <div className="preview">
            <img
              src={d.previewUrl || "/assets/img/avatar.png"}
              alt={t("common.offerDialog.file.previewAlt")}
              onError={(e) => {
                e.currentTarget.src = "/assets/img/avatar.png";
              }}
            />
          </div>

          <input type="hidden" value={d.form.coachImage} onChange={() => {}} />
        </div>

        <div className="form__group form__group--inline">
          <label className="label">
            {t("common.offerDialog.fields.onlineActive")}
          </label>
          <button
            type="button"
            className={clsx("switch", d.form.onlineActive && "switch--on")}
            onClick={() =>
              d.setForm((f) => ({ ...f, onlineActive: !f.onlineActive }))
            }
            aria-pressed={d.form.onlineActive}
          >
            <span className="switch__thumb" />
          </button>
        </div>

        <div className="form__actions offer-create-dialog__actions">
          <button
            type="submit"
            disabled={!d.canSubmit}
            className={clsx("btn", !d.canSubmit && "btn--disabled")}
          >
            {mode === "edit"
              ? t("common.offerDialog.actions.save")
              : t("common.offerDialog.actions.create")}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}
