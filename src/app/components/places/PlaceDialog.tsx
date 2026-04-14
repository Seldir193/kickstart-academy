"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastErrorMessage, toastText } from "@/lib/toast-messages";
import dynamic from "next/dynamic";
import type { Place } from "@/types/place";

const MapPreview = dynamic(() => import("./MapPreview"), { ssr: false });

function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

type PlaceForm = {
  _id?: string;
  name: string;
  address: string;
  zip: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
};

export default function PlaceDialog({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial?: Place | undefined;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const blank: PlaceForm = {
    _id: undefined,
    name: "",
    address: "",
    zip: "",
    city: "",
    lat: undefined,
    lng: undefined,
  };

  const [form, setForm] = useState<PlaceForm>(blank);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const f: PlaceForm = initial
      ? {
          _id: initial._id || undefined,
          name: initial.name || "",
          address: initial.address || "",
          zip: initial.zip || "",
          city: initial.city || "",
          lat:
            typeof initial.lat === "number"
              ? initial.lat
              : (initial.lat ?? undefined),
          lng:
            typeof initial.lng === "number"
              ? initial.lng
              : (initial.lng ?? undefined),
        }
      : { ...blank };

    setForm(f);
    setChecking(false);
    setCheckError(null);
    setSaving(false);
    setSaveError(null);
  }, [open, initial]);

  const canSave = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      form.address.trim().length > 0 &&
      form.zip.trim().length > 0 &&
      form.city.trim().length > 0 &&
      !saving
    );
  }, [form, saving]);

  async function handleCheckAddress() {
    setChecking(true);
    setCheckError(null);
    try {
      const q = `${form.address}, ${form.zip} ${form.city}`;
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        q,
      )}&limit=1&addressdetails=0`;
      const r = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });
      const j = await r.json();
      const hit = Array.isArray(j) && j[0];
      if (hit && hit.lat && hit.lon) {
        setForm((f) => ({ ...f, lat: Number(hit.lat), lng: Number(hit.lon) }));
      } else {
        setCheckError(
          toastText(
            t,
            "common.admin.places.dialog.errors.addressNotFound",
            "Address not found. Please refine.",
          ),
        );
      }
    } catch (e: any) {
      setCheckError(
        toastErrorMessage(
          t,
          e,
          "common.admin.places.dialog.errors.addressCheckFailed",
        ),
      );
    } finally {
      setChecking(false);
    }
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);

    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        zip: form.zip.trim(),
        city: form.city.trim(),
        ...(typeof form.lat === "number" ? { lat: form.lat } : {}),
        ...(typeof form.lng === "number" ? { lng: form.lng } : {}),
      };

      let resp: Response;
      if (form._id) {
        resp = await fetch(
          `/api/admin/places/${encodeURIComponent(form._id)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            cache: "no-store",
          },
        );
      } else {
        resp = await fetch(`/api/admin/places`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
        });
      }

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        let j: any = null;
        try {
          j = text ? JSON.parse(text) : null;
        } catch {}
        const msg =
          j?.error ||
          (resp.status === 409
            ? toastText(
                t,
                "common.admin.places.dialog.errors.placeExists",
                "Place already exists (same name/ZIP/city).",
              )
            : toastText(
                t,
                "common.admin.places.dialog.errors.saveFailedWithStatus",
                `Save failed (${resp.status})`,
              ));
        throw new Error(msg);
      }

      onSaved();
    } catch (e: any) {
      setSaveError(
        toastErrorMessage(t, e, "common.admin.places.dialog.errors.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="dialog-backdrop place-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={
        form._id
          ? t("common.admin.places.dialog.editTitle", {
              defaultValue: "Edit place",
            })
          : t("common.admin.places.dialog.createTitle", {
              defaultValue: "Create place",
            })
      }
    >
      <button
        type="button"
        className="dialog-backdrop-hit"
        aria-label={t("common.admin.places.dialog.close", {
          defaultValue: "Close",
        })}
        onClick={onClose}
      />

      <div className="dialog place-dialog__dialog">
        <div className="dialog-head place-dialog__head">
          <div className="place-dialog__head-main">
            <h2 className="dialog-title">
              {form._id
                ? t("common.admin.places.dialog.editTitle", {
                    defaultValue: "Edit place",
                  })
                : t("common.admin.places.dialog.createTitle", {
                    defaultValue: "Create place",
                  })}
            </h2>
          </div>

          <div className="dialog-head__actions">
            <button
              type="button"
              className="dialog-close"
              aria-label={t("common.admin.places.dialog.close", {
                defaultValue: "Close",
              })}
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

        <div className="dialog-body place-dialog__body">
          <div className="place-dialog__grid">
            <section className="dialog-section place-dialog__section">
              <div className="dialog-section__head">
                <h3 className="dialog-section__title">
                  {t("common.admin.places.dialog.locationDetails", {
                    defaultValue: "Location details",
                  })}
                </h3>
              </div>

              <div className="dialog-section__body place-dialog__section-body">
                <div className="field">
                  <label className="dialog-label">
                    {t("common.admin.places.dialog.nameLabel", {
                      defaultValue: "Club / Place name",
                    })}
                  </label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder={t(
                      "common.admin.places.dialog.namePlaceholder",
                      {
                        defaultValue: "e.g., SV Example",
                      },
                    )}
                  />
                </div>

                <div className="field">
                  <label className="dialog-label">
                    {t("common.admin.places.dialog.addressLabel", {
                      defaultValue: "Address",
                    })}
                  </label>
                  <input
                    className="input"
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                    placeholder={t(
                      "common.admin.places.dialog.addressPlaceholder",
                      {
                        defaultValue: "Street and number",
                      },
                    )}
                  />
                </div>

                <div className="place-dialog__row place-dialog__row--zip-city">
                  <div className="field">
                    <label className="dialog-label">
                      {t("common.admin.places.dialog.zipLabel", {
                        defaultValue: "ZIP",
                      })}
                    </label>
                    <input
                      className="input"
                      value={form.zip}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, zip: e.target.value }))
                      }
                      placeholder={t(
                        "common.admin.places.dialog.zipPlaceholder",
                        {
                          defaultValue: "e.g., 47167",
                        },
                      )}
                    />
                  </div>

                  <div className="field">
                    <label className="dialog-label">
                      {" "}
                      {t("common.admin.places.dialog.cityLabel", {
                        defaultValue: "City",
                      })}
                    </label>
                    <input
                      className="input"
                      value={form.city}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, city: e.target.value }))
                      }
                      placeholder={t(
                        "common.admin.places.dialog.cityPlaceholder",
                        {
                          defaultValue: "e.g., Duisburg",
                        },
                      )}
                    />
                  </div>
                </div>

                <div className="form__actions place-dialog__actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={onClose}
                    disabled={saving || checking}
                  >
                    {t("common.admin.places.dialog.close", {
                      defaultValue: "Close",
                    })}
                  </button>

                  <button
                    type="button"
                    className={clsx(
                      "btn",
                      (checking || saving) && "btn-disabled",
                    )}
                    onClick={handleCheckAddress}
                    disabled={checking || saving}
                  >
                    {checking
                      ? t("common.admin.places.dialog.checking", {
                          defaultValue: "Checking…",
                        })
                      : t("common.admin.places.dialog.checkAddress", {
                          defaultValue: "Check address",
                        })}
                  </button>

                  <button
                    type="button"
                    className={clsx(
                      "btn",
                      (!canSave || saving) && "btn-disabled",
                    )}
                    onClick={handleSave}
                    disabled={!canSave || saving}
                  >
                    {form._id
                      ? saving
                        ? t("common.admin.places.dialog.saving", {
                            defaultValue: "Saving…",
                          })
                        : t("common.admin.places.dialog.saveChanges", {
                            defaultValue: "Save changes",
                          })
                      : saving
                        ? t("common.admin.places.dialog.saving", {
                            defaultValue: "Saving…",
                          })
                        : t("common.admin.places.dialog.savePlace", {
                            defaultValue: "Save place",
                          })}
                  </button>
                </div>

                {checkError ? (
                  <p className="error place-dialog__message">{checkError}</p>
                ) : null}

                {saveError ? (
                  <p className="error place-dialog__message">{saveError}</p>
                ) : null}
              </div>
            </section>

            <section className="dialog-section place-dialog__section">
              <div className="dialog-section__head">
                <h3 className="dialog-section__title">
                  {t("common.admin.places.dialog.mapPreview", {
                    defaultValue: "Map preview",
                  })}
                </h3>
              </div>

              <div className="dialog-section__body place-dialog__section-body">
                <MapPreview
                  lat={typeof form.lat === "number" ? form.lat : undefined}
                  lng={typeof form.lng === "number" ? form.lng : undefined}
                  address={`${form.address}, ${form.zip} ${form.city}`}
                />

                {typeof form.lat === "number" ||
                typeof form.lng === "number" ? (
                  <div className="place-dialog__coords text-sm text-gray-700">
                    {typeof form.lat === "number"
                      ? `lat: ${form.lat.toFixed(6)}`
                      : null}{" "}
                    {typeof form.lng === "number"
                      ? `lng: ${form.lng.toFixed(6)}`
                      : null}
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
