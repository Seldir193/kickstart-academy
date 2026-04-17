//src\app\weekly\contract\ContractClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { toastText } from "@/lib/toast-messages";
import type {
  ContractDraft,
  ContractInitOk,
  ContractSubmitOk,
} from "./contractTypes";
import { fetchContractInit, submitContractAndCheckout } from "./contractApi";
import { weeklyContractHtml, weeklyContractVersion } from "./contractContent";

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function websiteUrl() {
  return (
    safeText(process.env.NEXT_PUBLIC_PUBLIC_WEBSITE_URL) ||
    "https://dortmunder-fussballschule.de"
  );
}

function emptyDraft(): ContractDraft {
  return {
    parent: {
      salutation: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      mobile: "",
    },
    address: { street: "", houseNo: "", zip: "", city: "" },
    child: { firstName: "", lastName: "", birthDate: "" },
    consents: {
      acceptAgb: false,
      acceptPrivacy: false,
      consentPhotoVideo: false,
    },
    signatureName: "",
  };
}

function errText(code: string, t: TFunction) {
  if (code === "TOKEN_EXPIRED")
    return t("common.weeklyContract.error.tokenExpired");
  if (code === "TOKEN_NOT_FOUND")
    return t("common.weeklyContract.error.tokenNotFound");
  if (code === "SUBSCRIPTION_NOT_ALLOWED")
    return t("common.weeklyContract.error.subscriptionNotAllowed");
  if (code === "SUBSCRIPTION_ALREADY_CREATED")
    return t("common.weeklyContract.error.subscriptionAlreadyCreated");
  return code
    ? t("common.weeklyContract.error.withCode", { code })
    : t("common.weeklyContract.error.unknown");
}

function normalizeDraft(base: ContractDraft) {
  const d: ContractDraft = JSON.parse(JSON.stringify(base));
  d.parent.email = safeText(d.parent.email).toLowerCase();
  d.signatureName = safeText(d.signatureName);
  return d;
}

function validateDraft(d: ContractDraft, t: TFunction) {
  const errors: Record<string, string> = {};
  if (!safeText(d.parent.firstName))
    errors.parentFirstName = t(
      "common.weeklyContract.validation.parentFirstName",
    );
  if (!safeText(d.parent.lastName))
    errors.parentLastName = t(
      "common.weeklyContract.validation.parentLastName",
    );
  if (!safeText(d.parent.email) || !safeText(d.parent.email).includes("@"))
    errors.parentEmail = t("common.weeklyContract.validation.parentEmail");
  if (!safeText(d.address.street))
    errors.street = t("common.weeklyContract.validation.street");
  if (!safeText(d.address.houseNo))
    errors.houseNo = t("common.weeklyContract.validation.houseNo");
  if (!safeText(d.address.zip))
    errors.zip = t("common.weeklyContract.validation.zip");
  if (!safeText(d.address.city))
    errors.city = t("common.weeklyContract.validation.city");
  if (!safeText(d.child.firstName))
    errors.childFirstName = t(
      "common.weeklyContract.validation.childFirstName",
    );
  if (!safeText(d.child.lastName))
    errors.childLastName = t("common.weeklyContract.validation.childLastName");
  if (!safeText(d.child.birthDate))
    errors.childBirthDate = t(
      "common.weeklyContract.validation.childBirthDate",
    );
  if (!d.consents.acceptAgb)
    errors.acceptAgb = t("common.weeklyContract.validation.acceptAgb");
  if (!d.consents.acceptPrivacy)
    errors.acceptPrivacy = t("common.weeklyContract.validation.acceptPrivacy");
  if (!safeText(d.signatureName))
    errors.signatureName = t("common.weeklyContract.validation.signatureName");
  return errors;
}

type Props = { token: string };

export default function ContractClient({ token }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fatal, setFatal] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [init, setInit] = useState<ContractInitOk | null>(null);
  const [draft, setDraft] = useState<ContractDraft>(emptyDraft());
  const [hasRead, setHasRead] = useState(false);

  const canStart = useMemo(() => safeText(token).length > 10, [token]);
  const contractRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = contractRef.current;
    if (!el) return;

    const check = () => {
      const scrollable = el.scrollHeight > el.clientHeight + 8;
      if (!scrollable) setHasRead(true);
    };

    const id = window.setTimeout(check, 0);
    return () => window.clearTimeout(id);
  }, [loading, init]);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!canStart) {
        setFatal("TOKEN_NOT_FOUND");
        setLoading(false);
        return;
      }

      const out = await fetchContractInit(token);
      if (!alive) return;

      if (!out || out.ok !== true) {
        setFatal(String((out as any)?.code || "SERVER"));
        setLoading(false);
        return;
      }

      setInit(out);

      const next = emptyDraft();
      next.parent.salutation = safeText(out.parent?.salutation);
      next.parent.firstName = safeText(out.parent?.firstName);
      next.parent.lastName = safeText(out.parent?.lastName);
      next.parent.email = safeText(out.parent?.email);
      next.parent.phone = safeText(out.parent?.phone);
      next.address.street = safeText(out.address?.street);
      next.address.houseNo = safeText(out.address?.houseNo);
      next.address.zip = safeText(out.address?.zip);
      next.address.city = safeText(out.address?.city);
      next.child.firstName = safeText(out.child?.firstName);
      next.child.lastName = safeText(out.child?.lastName);
      next.child.birthDate = safeText(out.child?.birthDate);

      setDraft(next);
      setLoading(false);
    }

    run();
    return () => {
      alive = false;
    };
  }, [token, canStart]);

  function setField(path: string, value: string | boolean) {
    setDraft((prev) => {
      const next: ContractDraft = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let cur: any = next;
      for (let i = 0; i < parts.length - 1; i += 1) cur = cur[parts[i]];
      cur[parts[parts.length - 1]] = value as any;
      return next;
    });
  }

  function onContractScroll(e: React.UIEvent<HTMLDivElement>) {
    if (hasRead) return;
    const el = e.currentTarget;
    const done = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (done) setHasRead(true);
  }

  function openPreview() {
    const url = `/weekly/contract-preview?token=${encodeURIComponent(token)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openDoc(k: "agb" | "privacy" | "photo") {
    const url = `/weekly/docs?d=${encodeURIComponent(k)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function onSubmit() {
    if (submitting) return;

    if (!hasRead) {
      setFatal(
        toastText(
          t,
          "common.weeklyContract.readRequired",
          "Bitte lies den Vertrag vollständig (bis zum Ende scrollen).",
        ),
      );
      return;
    }

    const norm = normalizeDraft(draft);
    const v = validateDraft(norm, t);
    setErrors(v);
    if (Object.keys(v).length) return;

    setSubmitting(true);
    const returnTo = `${window.location.origin}/book/success`;

    const out = await submitContractAndCheckout({
      token,
      draft: norm,
      returnTo,
      contractDoc: {
        version: weeklyContractVersion,
        contentHtml: weeklyContractHtml,
      },
    } as any);

    setSubmitting(false);

    if (!out || out.ok !== true) {
      const code = String((out as any)?.code || "SERVER");
      setFatal(code);
      return;
    }

    const ok = out as ContractSubmitOk;
    window.location.replace(ok.url);
  }

  if (loading) {
    return (
      <main className="weekly-contract-page">
        <section className="weekly-contract-card">
          <div className="weekly-contract-loadingRow">
            <span className="weekly-contract-spinner" aria-hidden="true" />
            <span className="weekly-contract-loadingText">
              {t("common.weeklyContract.loading")}
            </span>
          </div>
        </section>
      </main>
    );
  }

  if (fatal) {
    const isKnownCode =
      fatal === "TOKEN_EXPIRED" ||
      fatal === "TOKEN_NOT_FOUND" ||
      fatal === "SUBSCRIPTION_NOT_ALLOWED" ||
      fatal === "SUBSCRIPTION_ALREADY_CREATED";

    return (
      <main className="weekly-contract-page">
        <section className="weekly-contract-card">
          <h1 className="weekly-contract-title">
            {t("common.weeklyContract.title")}
          </h1>
          <p className="weekly-contract-error">
            {isKnownCode ? errText(fatal, t) : fatal}
          </p>
          <div className="weekly-contract-actions">
            <a className="weekly-contract-primary" href={websiteUrl()}>
              {t("common.weeklyContract.toWebsite")}
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="weekly-contract-page">
      <section className="weekly-contract-card">
        <h1 className="weekly-contract-title">
          {t("common.weeklyContract.titleMain")}
        </h1>

        <div className="weekly-contract-summary">
          <div className="weekly-contract-summaryRow">
            <span className="weekly-contract-label">
              {t("common.weeklyContract.summary.program")}
            </span>
            <span className="weekly-contract-value">
              {init?.offerTitle || ""}
            </span>
          </div>
          <div className="weekly-contract-summaryRow">
            <span className="weekly-contract-label">
              {t("common.weeklyContract.summary.location")}
            </span>
            <span className="weekly-contract-value">
              {init?.location || ""}
            </span>
          </div>
          <div className="weekly-contract-summaryRow">
            <span className="weekly-contract-label">
              {t("common.weeklyContract.summary.start")}
            </span>
            <span className="weekly-contract-value">
              {init?.startDate || ""}
            </span>
          </div>
          <div className="weekly-contract-summaryRow">
            <span className="weekly-contract-label">
              {t("common.weeklyContract.summary.time")}
            </span>
            <span className="weekly-contract-value">
              {[init?.dayLabel, init?.timeLabel].filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>

        <div className="weekly-contract-grid">
          <div className="weekly-contract-block">
            <h2 className="weekly-contract-subtitle">
              {t("common.weeklyContract.childSection")}
            </h2>

            <div className="weekly-contract-row">
              <label className="weekly-contract-field">
                <span>{t("common.weeklyContract.fields.firstName")}</span>
                <input
                  value={draft.child.firstName}
                  onChange={(e) => setField("child.firstName", e.target.value)}
                />
                {errors.childFirstName ? (
                  <em>{errors.childFirstName}</em>
                ) : null}
              </label>

              <label className="weekly-contract-field">
                <span>{t("common.weeklyContract.fields.lastName")}</span>
                <input
                  value={draft.child.lastName}
                  onChange={(e) => setField("child.lastName", e.target.value)}
                />
                {errors.childLastName ? <em>{errors.childLastName}</em> : null}
              </label>
            </div>

            <label className="weekly-contract-field">
              <span>{t("common.weeklyContract.fields.birthDate")}</span>
              <input
                type="date"
                value={draft.child.birthDate}
                onChange={(e) => setField("child.birthDate", e.target.value)}
              />
              {errors.childBirthDate ? <em>{errors.childBirthDate}</em> : null}
            </label>
          </div>

          <div className="weekly-contract-block">
            <h2 className="weekly-contract-subtitle">
              {t("common.weeklyContract.parentSection")}
            </h2>

            <div className="weekly-contract-row">
              <label className="weekly-contract-field">
                <span>{t("common.weeklyContract.fields.salutation")}</span>
                <input
                  value={draft.parent.salutation}
                  onChange={(e) =>
                    setField("parent.salutation", e.target.value)
                  }
                />
              </label>

              <label className="weekly-contract-field">
                <span>{t("common.weeklyContract.fields.phone")}</span>
                <input
                  value={draft.parent.phone}
                  onChange={(e) => setField("parent.phone", e.target.value)}
                />
              </label>
            </div>

            <div className="weekly-contract-row">
              <label className="weekly-contract-field">
                <span>{t("common.weeklyContract.fields.firstName")}</span>
                <input
                  value={draft.parent.firstName}
                  onChange={(e) => setField("parent.firstName", e.target.value)}
                />
                {errors.parentFirstName ? (
                  <em>{errors.parentFirstName}</em>
                ) : null}
              </label>

              <label className="weekly-contract-field">
                <span>{t("common.weeklyContract.fields.lastName")}</span>
                <input
                  value={draft.parent.lastName}
                  onChange={(e) => setField("parent.lastName", e.target.value)}
                />
                {errors.parentLastName ? (
                  <em>{errors.parentLastName}</em>
                ) : null}
              </label>
            </div>

            <label className="weekly-contract-field">
              <span>{t("common.weeklyContract.fields.email")}</span>
              <input
                value={draft.parent.email}
                onChange={(e) => setField("parent.email", e.target.value)}
              />
              {errors.parentEmail ? <em>{errors.parentEmail}</em> : null}
            </label>

            <div className="weekly-contract-row">
              <label className="weekly-contract-field">
                <span>{t("common.weeklyContract.fields.street")}</span>
                <input
                  value={draft.address.street}
                  onChange={(e) => setField("address.street", e.target.value)}
                />
                {errors.street ? <em>{errors.street}</em> : null}
              </label>

              <label className="weekly-contract-field">
                <span>{t("common.weeklyContract.fields.houseNo")}</span>
                <input
                  value={draft.address.houseNo}
                  onChange={(e) => setField("address.houseNo", e.target.value)}
                />
                {errors.houseNo ? <em>{errors.houseNo}</em> : null}
              </label>
            </div>

            <div className="weekly-contract-row">
              <label className="weekly-contract-field">
                <span>{t("common.weeklyContract.fields.zip")}</span>
                <input
                  value={draft.address.zip}
                  onChange={(e) => setField("address.zip", e.target.value)}
                />
                {errors.zip ? <em>{errors.zip}</em> : null}
              </label>

              <label className="weekly-contract-field">
                <span>{t("common.weeklyContract.fields.city")}</span>
                <input
                  value={draft.address.city}
                  onChange={(e) => setField("address.city", e.target.value)}
                />
                {errors.city ? <em>{errors.city}</em> : null}
              </label>
            </div>
          </div>
        </div>

        <div className="weekly-contract-docActions">
          <button
            className="weekly-contract-secondaryBtn"
            type="button"
            onClick={openPreview}
          >
            {t("common.weeklyContract.previewPdf")}
          </button>
          <span className="weekly-contract-docHint">
            {t("common.weeklyContract.readHint")}
          </span>
        </div>

        <div className="weekly-contract-contractTextWrap">
          <div
            ref={contractRef}
            className="weekly-contract-contractText"
            onScroll={onContractScroll}
            aria-label={t("common.weeklyContract.contractTextAria")}
            dangerouslySetInnerHTML={{ __html: weeklyContractHtml }}
          />
          <div className="weekly-contract-readState">
            {hasRead
              ? t("common.weeklyContract.readDone")
              : t("common.weeklyContract.readPending")}
          </div>
        </div>

        <div className="weekly-contract-consents">
          <h2 className="weekly-contract-subtitle">
            {t("common.weeklyContract.consentsTitle")}
          </h2>

          <div className="weekly-contract-checkRow">
            <label className="weekly-contract-check">
              <input
                type="checkbox"
                checked={draft.consents.acceptAgb}
                onChange={(e) =>
                  setField("consents.acceptAgb", e.target.checked)
                }
              />
              <span>{t("common.weeklyContract.consents.acceptAgb")}</span>
            </label>
            <button
              type="button"
              className="weekly-contract-docLink"
              onClick={() => openDoc("agb")}
            >
              {t("common.weeklyContract.showDoc")}
            </button>
          </div>
          {errors.acceptAgb ? (
            <em className="weekly-contract-checkErr">{errors.acceptAgb}</em>
          ) : null}

          <div className="weekly-contract-checkRow">
            <label className="weekly-contract-check">
              <input
                type="checkbox"
                checked={draft.consents.acceptPrivacy}
                onChange={(e) =>
                  setField("consents.acceptPrivacy", e.target.checked)
                }
              />
              <span>{t("common.weeklyContract.consents.acceptPrivacy")}</span>
            </label>
            <button
              type="button"
              className="weekly-contract-docLink"
              onClick={() => openDoc("privacy")}
            >
              {t("common.weeklyContract.showDoc")}
            </button>
          </div>
          {errors.acceptPrivacy ? (
            <em className="weekly-contract-checkErr">{errors.acceptPrivacy}</em>
          ) : null}

          <div className="weekly-contract-checkRow">
            <label className="weekly-contract-check">
              <input
                type="checkbox"
                checked={draft.consents.consentPhotoVideo}
                onChange={(e) =>
                  setField("consents.consentPhotoVideo", e.target.checked)
                }
              />
              <span>{t("common.weeklyContract.consents.photoVideo")}</span>
            </label>
            <button
              type="button"
              className="weekly-contract-docLink"
              onClick={() => openDoc("photo")}
            >
              {t("common.weeklyContract.showDoc")}
            </button>
          </div>

          <div className="weekly-contract-sign">
            <label className="weekly-contract-field">
              <span>{t("common.weeklyContract.signatureLabel")}</span>
              <input
                value={draft.signatureName}
                onChange={(e) => setField("signatureName", e.target.value)}
                placeholder={t("common.weeklyContract.signaturePlaceholder")}
              />
              {errors.signatureName ? <em>{errors.signatureName}</em> : null}
            </label>

            <button
              className="weekly-contract-primaryBtn"
              type="button"
              onClick={onSubmit}
              disabled={submitting || !hasRead}
            >
              {submitting
                ? t("common.weeklyContract.pleaseWait")
                : t("common.weeklyContract.submit")}
            </button>

            <p className="weekly-contract-note">
              {t("common.weeklyContract.paymentHint")}
            </p>

            {!hasRead ? (
              <p className="weekly-contract-note weekly-contract-noteWarn">
                {t("common.weeklyContract.readBeforeSubmit")}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
