//src\app\components\OfferCreateDialog.tsx
"use client";

import React from "react";
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

  const coachFileInputId = React.useId();
  const [coachFileName, setCoachFileName] = React.useState("Keine ausgewählt");

  if (!open) return null;

  return (
    <DialogShell
      panelRef={d.panelRef}
      onClose={onClose}
      title={mode === "edit" ? "Edit offer" : "Create offer"}
    >
      <form onSubmit={d.handleSubmit} className="form">
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
          Selecting a course fills <code>type</code> automatically;{" "}
          <code>sub_type</code> is optional.
        </p>

        <div className="grid grid--2">
          <PlaceField
            placeDropdownRef={d.placeDropdownRef}
            placeOpen={d.placeOpen}
            setPlaceOpen={d.setPlaceOpen}
            selectedPlaceLabel="— Select place —"
            selectedPlace={d.selectedPlace}
            places={d.places}
            onPick={d.onPlaceChange}
          />

          <div className="form__group">
            <label className="label">Price (€)</label>
            <input
              type="number"
              className="input"
              min={0}
              step="0.01"
              placeholder="z. B. 129"
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
                <label className="label">Ferien: Von</label>
                <KsDatePicker
                  value={d.form.dateFrom || ""}
                  onChange={(nextIso) =>
                    d.setForm((f) => ({
                      ...f,
                      dateFrom: nextIso,
                    }))
                  }
                  placeholder="tt.mm.jjjj"
                  disabled={false}
                />
              </div>

              <div className="form__group">
                <label className="label">Ferien: Bis</label>
                <KsDatePicker
                  value={d.form.dateTo || ""}
                  onChange={(nextIso) =>
                    d.setForm((f) => ({
                      ...f,
                      dateTo: nextIso,
                    }))
                  }
                  placeholder="tt.mm.jjjj"
                  disabled={false}
                />
              </div>
            </div>
          </>
        ) : null}

        <div className="grid grid--2">
          <div className="form__group">
            <label className="label">Time from</label>
            <KsTimeSelect
              value={d.form.timeFrom}
              onChange={(next) => d.setForm((f) => ({ ...f, timeFrom: next }))}
              stepMinutes={5}
              placeholder="—"
            />
          </div>

          <div className="form__group">
            <label className="label">Time to</label>
            <KsTimeSelect
              value={d.form.timeTo}
              onChange={(next) => d.setForm((f) => ({ ...f, timeTo: next }))}
              stepMinutes={5}
              placeholder="—"
            />
          </div>
        </div>

        <div className="grid grid--2">
          <div className="form__group">
            <label className="label">Age from</label>
            <input
              type="number"
              className="input"
              placeholder="e.g., 6"
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
            <label className="label">Age to</label>
            <input
              type="number"
              className="input"
              placeholder="e.g., 14"
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
          <label className="label">Info text</label>
          <textarea
            className="input input--textarea"
            placeholder="Additional information…"
            value={d.form.info}
            onChange={(e) => d.setForm((f) => ({ ...f, info: e.target.value }))}
          />
        </div>

        <div className="grid grid--2">
          <div className="form__group">
            <label className="label">Coach name</label>
            <input
              className="input"
              placeholder="e.g., Noah Example"
              value={d.form.coachName}
              onChange={(e) =>
                d.setForm((f) => ({ ...f, coachName: e.target.value }))
              }
            />
          </div>

          <div className="form__group">
            <label className="label">Coach E-Mail</label>
            <input
              className="input"
              type="email"
              placeholder="coach@example.com"
              value={d.form.coachEmail}
              onChange={(e) =>
                d.setForm((f) => ({ ...f, coachEmail: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="form__group">
          <label className="label">Coach image</label>

          <div className="upload-row">
            <div className="ks-file">
              <input
                id={coachFileInputId}
                className="ks-file__input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setCoachFileName(file?.name || "Keine ausgewählt");
                  d.handleCoachFileChange(e);
                }}
              />

              <label className="btn ks-file__btn" htmlFor={coachFileInputId}>
                Datei auswählen
              </label>

              <span
                className={
                  "ks-file__name" +
                  (coachFileName === "Keine ausgewählt" ? " is-empty" : "")
                }
                aria-live="polite"
              >
                {coachFileName}
              </span>
            </div>

            {d.uploading && <span className="uploading">Uploading…</span>}
            {d.uploadError && <span className="error">{d.uploadError}</span>}
          </div>

          <div className="preview">
            <img
              src={d.previewUrl || "/assets/img/avatar.png"}
              alt="Coach preview"
              onError={(e) => {
                e.currentTarget.src = "/assets/img/avatar.png";
              }}
            />
          </div>

          <input type="hidden" value={d.form.coachImage} onChange={() => {}} />
        </div>

        <div className="form__group form__group--inline">
          <label className="label">Online active</label>
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

        <div className="form__actions">
          <button
            type="submit"
            disabled={!d.canSubmit}
            className={clsx("btn ", !d.canSubmit && "btn--disabled")}
          >
            {mode === "edit" ? "Save changes" : "Create offer"}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}
