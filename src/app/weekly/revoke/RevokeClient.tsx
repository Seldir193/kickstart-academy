"use client";

import { useEffect, useState } from "react";
import { submitRevokeByToken, type RevokeResponse } from "./revokeApi";
import "../../styles/weekly-revoke.scss";

type ViewState = "loading" | "success" | "error";

type Props = {
  token: string;
};

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function contactUrl() {
  const wpBase = safeText(process.env.NEXT_PUBLIC_WP_BASE_URL);
  if (wpBase) {
    return `${wpBase.replace(/\/+$/, "")}/?page_id=143`;
  }
  return "http://localhost/wordpress/?page_id=143";
}

function getTitle(state: ViewState) {
  if (state === "loading") return "Vertrag widerrufen";
  if (state === "success") return "Widerruf erfolgreich";
  return "Widerruf nicht möglich";
}

function getBadgeText(state: ViewState) {
  if (state === "loading") return "Bitte warten";
  if (state === "success") return "Erfolgreich";
  return "Hinweis";
}

function labelForMode(mode: string) {
  if (mode === "weekly_refund") return "Abo widerrufen + Rückerstattung";
  if (mode === "one_time_refund")
    return "Einmalzahlung widerrufen + Rückerstattung";
  if (mode === "unpaid_storno") return "Unbezahlte Buchung storniert";
  return mode || "Verarbeitet";
}

export default function RevokeClient({ token }: Props) {
  const [state, setState] = useState<ViewState>("loading");
  const [message, setMessage] = useState("Widerruf wird verarbeitet ...");
  const [mode, setMode] = useState("");
  const [docNo, setDocNo] = useState("");

  useEffect(() => {
    if (!safeText(token)) {
      setState("error");
      setMessage("Der Widerrufslink ist ungültig.");
      return;
    }

    let alive = true;

    async function run() {
      const data: RevokeResponse = await submitRevokeByToken(token);
      if (!alive) return;

      const nextMessage =
        data?.message ||
        data?.error ||
        "Der Widerruf konnte nicht verarbeitet werden.";

      setMode(safeText(data?.mode));
      setDocNo(safeText(data?.creditNoteNo || data?.stornoNo));

      if (data?.ok !== true) {
        setState("error");
        setMessage(nextMessage);
        return;
      }

      setState("success");
      setMessage(nextMessage);
    }

    run();

    return () => {
      alive = false;
    };
  }, [token]);

  const title = getTitle(state);
  const badgeText = getBadgeText(state);
  const contentClass = `weekly-revoke__message weekly-revoke__message--${state}`;

  return (
    <main className="weekly-revoke">
      <div className="weekly-revoke__card">
        <div className="weekly-revoke__badge">{badgeText}</div>

        <h1 className="weekly-revoke__title">{title}</h1>

        <p className={contentClass}>{message}</p>

        {state === "success" && mode ? (
          <div className="weekly-revoke__info">
            <div className="weekly-revoke__info-label">Verarbeitung</div>
            <div className="weekly-revoke__info-value">
              {labelForMode(mode)}
            </div>
          </div>
        ) : null}

        {state === "success" && docNo ? (
          <div className="weekly-revoke__info">
            <div className="weekly-revoke__info-label">
              {mode === "unpaid_storno" ? "Storno-Nr." : "Gutschrift-Nr."}
            </div>
            <div className="weekly-revoke__info-value">{docNo}</div>
          </div>
        ) : null}

        <div className="weekly-revoke__note">
          {state === "success"
            ? "Die Verarbeitung wurde abgeschlossen. Weitere Informationen erhältst du zusätzlich per E-Mail."
            : "Bei Fragen kannst du dich jederzeit an unser Team wenden."}
        </div>

        <div className="weekly-revoke__actions">
          <a
            className="weekly-revoke__button weekly-revoke__button--primary"
            href="https://dortmunder-fussballschule.de"
          >
            Zur Startseite
          </a>

          <a
            className="weekly-revoke__button weekly-revoke__button--secondary"
            href={contactUrl()}
          >
            Kontakt
          </a>
        </div>
      </div>
    </main>
  );
}
