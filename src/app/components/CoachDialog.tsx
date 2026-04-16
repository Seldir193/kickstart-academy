//src\app\components\CoachDialog.tsx
"use client";

import React from "react";
import { useTranslation } from "react-i18next";

type Coach = {
  slug: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  position?: string;
  degree?: string;
  since?: string;
  dfbLicense?: string;
  mfsLicense?: string;
  favClub?: string;
  favCoach?: string;
  favTrick?: string;
  photoUrl?: string;
};

export default function CoachDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: Partial<Coach>;
  onClose: () => void;
  onSubmit: (values: Partial<Coach>) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [values, setValues] = React.useState<Partial<Coach>>(initial || {});
  const [uploading, setUploading] = React.useState(false);
  const [fileName, setFileName] = React.useState<string>("");

  React.useEffect(() => {
    if (open) {
      setValues(initial || {});
      setUploading(false);
      setFileName("");
    }
  }, [initial, open]);

  function set<K extends keyof Coach>(k: K, v: Coach[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  const title =
    mode === "create"
      ? t("common.admin.coaches.dialog.createTitle")
      : t("common.admin.coaches.dialog.editTitle");

  function isValidPhotoUrl(u?: string): boolean {
    if (!u) return false;
    return (
      /^data:image\//.test(u) || /^https?:\/\//.test(u) || u.startsWith("/")
    );
  }

  if (!open) return null;

  async function handleSave() {
    await onSubmit(values);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert(t("common.admin.coaches.dialog.imageFileAlert"));
      return;
    }
    setFileName(file.name);
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      set("photoUrl", dataUrl as unknown as string);
    } catch {
      alert(t("common.admin.coaches.dialog.imageReadAlert"));
    } finally {
      setUploading(false);
    }
  }

  function readFileAsDataURL(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () =>
        reject(new Error(t("common.admin.coaches.dialog.readError")));
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(file);
    });
  }

  function clearPhoto() {
    set("photoUrl", "");
    setFileName("");
  }

  function formatFileName(name: string) {
    if (!name) return "";
    const dot = name.lastIndexOf(".");
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : "";
    if (base.length <= 6) return name;
    return `${base.slice(0, 3)}....${ext || ""}`;
  }

  return (
    <div className="dialog-backdrop coach-dialog" onClick={onClose}>
      <div
        className="dialog coach-dialog__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-head coach-dialog__head">
          <div className="coach-dialog__head-left">
            <h3 className="dialog-title coach-dialog__title">{title}</h3>
          </div>

          <div className="coach-dialog__head-right">
            <div className="dialog-head__actions">
              <button
                type="button"
                className="dialog-close modal__close"
                aria-label={t("common.close")}
                onClick={onClose}
              >
                <img
                  src="/icons/close.svg"
                  alt=""
                  aria-hidden="true"
                  className="icon-img"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="dialog-body coach-dialog__body">
          <div className="coach-form">
            <label className="coach-form__field">
              <div className="label">
                {t("common.admin.coaches.dialog.firstName")}
              </div>
              <input
                className="input"
                value={values.firstName || ""}
                onChange={(e) => set("firstName", e.target.value)}
              />
            </label>

            <label className="coach-form__field">
              <div className="label">
                {t("common.admin.coaches.dialog.lastName")}
              </div>
              <input
                className="input"
                value={values.lastName || ""}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </label>

            <label className="coach-form__field coach-form__full">
              <div className="label">
                {t("common.admin.coaches.dialog.nameOverride")}
              </div>
              <input
                className="input"
                value={values.name || ""}
                onChange={(e) => set("name", e.target.value)}
              />
            </label>

            <label className="coach-form__field">
              <div className="label">
                {t("common.admin.coaches.dialog.position")}
              </div>
              <input
                className="input"
                value={
                  values.position ||
                  t("common.admin.coaches.dialog.defaultPosition")
                }
                onChange={(e) => set("position", e.target.value)}
              />
            </label>

            <label className="coach-form__field">
              <div className="label">
                {t("common.admin.coaches.dialog.since")}
              </div>
              <input
                className="input"
                value={values.since || ""}
                onChange={(e) => set("since", e.target.value)}
              />
            </label>

            <label className="coach-form__field coach-form__full">
              <div className="label">
                {t("common.admin.coaches.dialog.degree")}
              </div>
              <input
                className="input"
                value={values.degree || ""}
                onChange={(e) => set("degree", e.target.value)}
              />
            </label>

            <label className="coach-form__field">
              <div className="label">
                {t("common.admin.coaches.dialog.dfbLicense")}
              </div>
              <input
                className="input"
                value={values.dfbLicense || ""}
                onChange={(e) => set("dfbLicense", e.target.value)}
              />
            </label>

            <label className="coach-form__field">
              <div className="label">
                {t("common.admin.coaches.dialog.dfsLicense")}
              </div>
              <input
                className="input"
                value={values.mfsLicense || ""}
                onChange={(e) => set("mfsLicense", e.target.value)}
              />
            </label>

            <label className="coach-form__field">
              <div className="label">
                {t("common.admin.coaches.dialog.favoriteClub")}
              </div>
              <input
                className="input"
                value={values.favClub || ""}
                onChange={(e) => set("favClub", e.target.value)}
              />
            </label>

            <label className="coach-form__field">
              <div className="label">
                {t("common.admin.coaches.dialog.favoriteCoach")}
              </div>
              <input
                className="input"
                value={values.favCoach || ""}
                onChange={(e) => set("favCoach", e.target.value)}
              />
            </label>

            <label className="coach-form__field coach-form__full">
              <div className="label">
                {t("common.admin.coaches.dialog.favoriteTrick")}
              </div>
              <input
                className="input"
                value={values.favTrick || ""}
                onChange={(e) => set("favTrick", e.target.value)}
              />
            </label>

            <div className="coach-form__full coach-dialog__photo">
              <img
                src={
                  isValidPhotoUrl(values.photoUrl)
                    ? (values.photoUrl as string)
                    : "/assets/img/avatar.png"
                }
                alt={t("common.admin.coaches.dialog.photoAlt")}
                className="coach-table__avatar"
                onError={(e) => {
                  const fallback = "/assets/img/avatar.png";
                  if (e.currentTarget.src.endsWith(fallback)) return;
                  e.currentTarget.src = fallback;
                }}
              />

              <div className="coach-dialog__uploadRow">
                <label className="btn">
                  {t("common.admin.coaches.dialog.chooseFile")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>

                <span className="coach-dialog__fileName">
                  {fileName
                    ? formatFileName(fileName)
                    : t("common.admin.coaches.dialog.chooseImage")}
                </span>
              </div>

              <div className="coach-dialog__removeRow">
                <button
                  type="button"
                  className="btn"
                  onClick={clearPhoto}
                  disabled={!values.photoUrl || uploading}
                >
                  {t("common.admin.coaches.dialog.removeImage")}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="dialog-footer coach-dialog__footer">
          <button className="btn" onClick={handleSave} disabled={uploading}>
            {uploading
              ? t("common.admin.coaches.dialog.uploading")
              : t("common.admin.coaches.dialog.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
