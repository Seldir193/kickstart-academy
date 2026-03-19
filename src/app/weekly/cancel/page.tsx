//src\app\weekly\cancel\page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
//import "./weekly-cancel.css";

type ViewState = "loading" | "success" | "error";

type CancelResponse = {
  ok?: boolean;
  code?: string;
  message?: string;
  error?: string;
  cancelEffectiveAt?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE").format(date);
}

export default function WeeklyCancelPage() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ViewState>("loading");
  const [message, setMessage] = useState("Kündigung wird verarbeitet ...");
  const [endDate, setEndDate] = useState("");

  const token = useMemo(() => {
    return String(searchParams.get("token") || "").trim();
  }, [searchParams]);

  useEffect(() => {
    if (!token) return handleMissingToken();

    async function run() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/payments/stripe/cancel-subscription",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          },
        );

        const data: CancelResponse = await response.json();
        handleResponse(response.ok, data);
      } catch {
        setState("error");
        setMessage("Serverfehler bei der Kündigung.");
      }
    }

    run();
  }, [token]);

  function handleMissingToken() {
    setState("error");
    setMessage("Der Kündigungslink ist ungültig.");
  }

  function handleResponse(ok: boolean, data: CancelResponse) {
    const nextMessage =
      data?.message ||
      data?.error ||
      "Die Kündigung konnte nicht verarbeitet werden.";

    setEndDate(formatDate(data?.cancelEffectiveAt));

    if (!ok || !data?.ok) {
      setState("error");
      setMessage(nextMessage);
      return;
    }

    setState("success");
    setMessage(nextMessage);
  }

  const title = getTitle(state);
  const badgeText = getBadgeText(state);
  const contentClass = `weekly-cancel__message weekly-cancel__message--${state}`;

  return (
    <main className="weekly-cancel">
      <div className="weekly-cancel__card">
        <div className="weekly-cancel__badge">{badgeText}</div>

        <h1 className="weekly-cancel__title">{title}</h1>

        <p className={contentClass}>{message}</p>

        {endDate ? (
          <div className="weekly-cancel__info">
            <div className="weekly-cancel__info-label">Vertragsende</div>
            <div className="weekly-cancel__info-value">{endDate}</div>
          </div>
        ) : null}

        <div className="weekly-cancel__note">
          {state === "success"
            ? "Die Kündigung wurde gespeichert. Deine Bestätigung erhältst du zusätzlich per E-Mail."
            : "Bei Fragen kannst du dich jederzeit an unser Team wenden."}
        </div>

        <div className="weekly-cancel__actions">
          <a
            className="weekly-cancel__button weekly-cancel__button--primary"
            href="https://www.dortmunder-fussball-schule.de"
          >
            Zur Startseite
          </a>

          <a
            className="weekly-cancel__button weekly-cancel__button--secondary"
            href="http://localhost/wordpress/?page_id=143"
          >
            Kontakt
          </a>
        </div>
      </div>
    </main>
  );
}

function getTitle(state: ViewState) {
  if (state === "loading") return "Abo kündigen";
  if (state === "success") return "Kündigung erfolgreich";
  return "Kündigung nicht möglich";
}

function getBadgeText(state: ViewState) {
  if (state === "loading") return "Bitte warten";
  if (state === "success") return "Erfolgreich";
  return "Hinweis";
}
