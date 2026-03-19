//src\app\weekly\contract\ContractClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function errText(code: string) {
  if (code === "TOKEN_EXPIRED")
    return "Der Link ist abgelaufen. Bitte fordere einen neuen Link an.";
  if (code === "TOKEN_NOT_FOUND")
    return "Der Link ist ungültig. Bitte fordere einen neuen Link an.";
  if (code === "SUBSCRIPTION_NOT_ALLOWED")
    return "Du bist noch nicht zugelassen. Bitte warte auf die Freigabe.";
  if (code === "SUBSCRIPTION_ALREADY_CREATED")
    return "Das Abo wurde bereits gestartet. Bitte prüfe deine E-Mails.";
  return code ? `Fehler: ${code}` : "Unbekannter Fehler.";
}

function normalizeDraft(base: ContractDraft) {
  const d: ContractDraft = JSON.parse(JSON.stringify(base));
  d.parent.email = safeText(d.parent.email).toLowerCase();
  d.signatureName = safeText(d.signatureName);
  return d;
}

function validateDraft(d: ContractDraft) {
  const errors: Record<string, string> = {};
  if (!safeText(d.parent.firstName))
    errors.parentFirstName = "Bitte Vornamen angeben.";
  if (!safeText(d.parent.lastName))
    errors.parentLastName = "Bitte Nachnamen angeben.";
  if (!safeText(d.parent.email) || !safeText(d.parent.email).includes("@"))
    errors.parentEmail = "Bitte gültige E-Mail angeben.";
  if (!safeText(d.address.street)) errors.street = "Bitte Straße angeben.";
  if (!safeText(d.address.houseNo))
    errors.houseNo = "Bitte Hausnummer angeben.";
  if (!safeText(d.address.zip)) errors.zip = "Bitte PLZ angeben.";
  if (!safeText(d.address.city)) errors.city = "Bitte Ort angeben.";
  if (!safeText(d.child.firstName))
    errors.childFirstName = "Bitte Kind-Vorname angeben.";
  if (!safeText(d.child.lastName))
    errors.childLastName = "Bitte Kind-Nachname angeben.";
  if (!safeText(d.child.birthDate))
    errors.childBirthDate = "Bitte Geburtsdatum angeben.";
  if (!d.consents.acceptAgb) errors.acceptAgb = "AGB müssen akzeptiert werden.";
  if (!d.consents.acceptPrivacy)
    errors.acceptPrivacy = "Datenschutz muss akzeptiert werden.";
  if (!safeText(d.signatureName))
    errors.signatureName = "Bitte Namen als Unterschrift eintragen.";
  return errors;
}

type Props = { token: string };

export default function ContractClient({ token }: Props) {
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
      setFatal("Bitte lies den Vertrag vollständig (bis zum Ende scrollen).");
      return;
    }

    const norm = normalizeDraft(draft);
    const v = validateDraft(norm);
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
              Vertrag wird geladen…
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
          <h1 className="weekly-contract-title">Vertrag</h1>
          <p className="weekly-contract-error">
            {isKnownCode ? errText(fatal) : fatal}
          </p>
          <div className="weekly-contract-actions">
            <a className="weekly-contract-primary" href={websiteUrl()}>
              Zur Website
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
          DFS – Vertrag digital unterschreiben
        </h1>

        <div className="weekly-contract-summary">
          <div className="weekly-contract-summaryRow">
            <span className="weekly-contract-label">Programm</span>
            <span className="weekly-contract-value">
              {init?.offerTitle || ""}
            </span>
          </div>
          <div className="weekly-contract-summaryRow">
            <span className="weekly-contract-label">Ort</span>
            <span className="weekly-contract-value">
              {init?.location || ""}
            </span>
          </div>
          <div className="weekly-contract-summaryRow">
            <span className="weekly-contract-label">Start</span>
            <span className="weekly-contract-value">
              {init?.startDate || ""}
            </span>
          </div>
          <div className="weekly-contract-summaryRow">
            <span className="weekly-contract-label">Zeit</span>
            <span className="weekly-contract-value">
              {[init?.dayLabel, init?.timeLabel].filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>

        <div className="weekly-contract-grid">
          <div className="weekly-contract-block">
            <h2 className="weekly-contract-subtitle">Angaben zum Kind</h2>

            <div className="weekly-contract-row">
              <label className="weekly-contract-field">
                <span>Vorname</span>
                <input
                  value={draft.child.firstName}
                  onChange={(e) => setField("child.firstName", e.target.value)}
                />
                {errors.childFirstName ? (
                  <em>{errors.childFirstName}</em>
                ) : null}
              </label>

              <label className="weekly-contract-field">
                <span>Nachname</span>
                <input
                  value={draft.child.lastName}
                  onChange={(e) => setField("child.lastName", e.target.value)}
                />
                {errors.childLastName ? <em>{errors.childLastName}</em> : null}
              </label>
            </div>

            <label className="weekly-contract-field">
              <span>Geburtsdatum</span>
              <input
                type="date"
                value={draft.child.birthDate}
                onChange={(e) => setField("child.birthDate", e.target.value)}
              />
              {errors.childBirthDate ? <em>{errors.childBirthDate}</em> : null}
            </label>
          </div>

          <div className="weekly-contract-block">
            <h2 className="weekly-contract-subtitle">Angaben zu Eltern</h2>

            <div className="weekly-contract-row">
              <label className="weekly-contract-field">
                <span>Anrede</span>
                <input
                  value={draft.parent.salutation}
                  onChange={(e) =>
                    setField("parent.salutation", e.target.value)
                  }
                />
              </label>

              <label className="weekly-contract-field">
                <span>Telefon</span>
                <input
                  value={draft.parent.phone}
                  onChange={(e) => setField("parent.phone", e.target.value)}
                />
              </label>
            </div>

            <div className="weekly-contract-row">
              <label className="weekly-contract-field">
                <span>Vorname</span>
                <input
                  value={draft.parent.firstName}
                  onChange={(e) => setField("parent.firstName", e.target.value)}
                />
                {errors.parentFirstName ? (
                  <em>{errors.parentFirstName}</em>
                ) : null}
              </label>

              <label className="weekly-contract-field">
                <span>Nachname</span>
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
              <span>E-Mail</span>
              <input
                value={draft.parent.email}
                onChange={(e) => setField("parent.email", e.target.value)}
              />
              {errors.parentEmail ? <em>{errors.parentEmail}</em> : null}
            </label>

            <div className="weekly-contract-row">
              <label className="weekly-contract-field">
                <span>Straße</span>
                <input
                  value={draft.address.street}
                  onChange={(e) => setField("address.street", e.target.value)}
                />
                {errors.street ? <em>{errors.street}</em> : null}
              </label>

              <label className="weekly-contract-field">
                <span>Hausnr.</span>
                <input
                  value={draft.address.houseNo}
                  onChange={(e) => setField("address.houseNo", e.target.value)}
                />
                {errors.houseNo ? <em>{errors.houseNo}</em> : null}
              </label>
            </div>

            <div className="weekly-contract-row">
              <label className="weekly-contract-field">
                <span>PLZ</span>
                <input
                  value={draft.address.zip}
                  onChange={(e) => setField("address.zip", e.target.value)}
                />
                {errors.zip ? <em>{errors.zip}</em> : null}
              </label>

              <label className="weekly-contract-field">
                <span>Ort</span>
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
            Vertrag als PDF ansehen
          </button>
          <span className="weekly-contract-docHint">
            Bitte lies den Vertrag vollständig. Danach kannst du unterschreiben.
          </span>
        </div>

        <div className="weekly-contract-contractTextWrap">
          <div
            ref={contractRef}
            className="weekly-contract-contractText"
            onScroll={onContractScroll}
            aria-label="Vertragstext"
            dangerouslySetInnerHTML={{ __html: weeklyContractHtml }}
          />
          <div className="weekly-contract-readState">
            {hasRead ? "Gelesen ✓" : "Bitte bis zum Ende scrollen"}
          </div>
        </div>

        <div className="weekly-contract-consents">
          <h2 className="weekly-contract-subtitle">Einwilligungen</h2>

          <div className="weekly-contract-checkRow">
            <label className="weekly-contract-check">
              <input
                type="checkbox"
                checked={draft.consents.acceptAgb}
                onChange={(e) =>
                  setField("consents.acceptAgb", e.target.checked)
                }
              />
              <span>Ich akzeptiere die Teilnahmebedingungen (AGB).</span>
            </label>
            <button
              type="button"
              className="weekly-contract-docLink"
              onClick={() => openDoc("agb")}
            >
              Anzeigen
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
              <span>Ich akzeptiere die Datenschutzhinweise.</span>
            </label>
            <button
              type="button"
              className="weekly-contract-docLink"
              onClick={() => openDoc("privacy")}
            >
              Anzeigen
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
              <span>
                Ich erteile die Einwilligung zur Veröffentlichung von Foto/Video
                (optional).
              </span>
            </label>
            <button
              type="button"
              className="weekly-contract-docLink"
              onClick={() => openDoc("photo")}
            >
              Anzeigen
            </button>
          </div>

          <div className="weekly-contract-sign">
            <label className="weekly-contract-field">
              <span>Unterschrift (Name eintippen)</span>
              <input
                value={draft.signatureName}
                onChange={(e) => setField("signatureName", e.target.value)}
                placeholder="Vorname Nachname"
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
                ? "Bitte warten…"
                : "Vertrag unterschreiben & Abo starten"}
            </button>

            <p className="weekly-contract-note">
              Nach dem Unterschreiben wirst du zur sicheren Zahlung (SEPA oder
              Karte) bei Stripe weitergeleitet.
            </p>

            {!hasRead ? (
              <p className="weekly-contract-note weekly-contract-noteWarn">
                Bitte lies den Vertrag vollständig (bis zum Ende scrollen),
                bevor du unterschreibst.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
