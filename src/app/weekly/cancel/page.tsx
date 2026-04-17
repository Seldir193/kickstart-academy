//src\app\weekly\cancel\page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useTranslation } from "react-i18next";
import { toastText } from "@/lib/toast-messages";
import type { TFunction } from "i18next";
import { formatDateOnly } from "@/app/lib/date-format";

type ViewState = "loading" | "success" | "error";

type CancelResponse = {
  ok?: boolean;
  code?: string;
  message?: string;
  error?: string;
  cancelEffectiveAt?: string | null;
};

export default function WeeklyCancelPage() {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ViewState>("loading");
  const [message, setMessage] = useState(t("common.weeklyCancel.processing"));
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
        setMessage(
          toastText(
            t,
            "common.weeklyCancel.serverError",
            "Serverfehler bei der Kündigung.",
          ),
        );
      }
    }

    run();
  }, [token]);

  function handleMissingToken() {
    setState("error");
    setMessage(
      toastText(
        t,
        "common.weeklyCancel.invalidLink",
        "Der Kündigungslink ist ungültig.",
      ),
    );
  }

  function handleResponse(ok: boolean, data: CancelResponse) {
    const nextMessage =
      data?.message ||
      data?.error ||
      toastText(
        t,
        "common.weeklyCancel.processingFailed",
        "Die Kündigung konnte nicht verarbeitet werden.",
      );

    setEndDate(formatDateOnly(data?.cancelEffectiveAt, i18n.language));

    if (!ok || !data?.ok) {
      setState("error");
      setMessage(nextMessage);
      return;
    }

    setState("success");
    setMessage(nextMessage);
  }

  const title = getTitle(state, t);
  const badgeText = getBadgeText(state, t);
  const contentClass = `weekly-cancel__message weekly-cancel__message--${state}`;

  return (
    <main className="weekly-cancel">
      <div className="weekly-cancel__card">
        <div className="weekly-cancel__badge">{badgeText}</div>

        <h1 className="weekly-cancel__title">{title}</h1>

        <p className={contentClass}>{message}</p>

        {endDate ? (
          <div className="weekly-cancel__info">
            <div className="weekly-cancel__info-label">
              {t("common.weeklyCancel.contractEnd")}
            </div>
            <div className="weekly-cancel__info-value">{endDate}</div>
          </div>
        ) : null}

        <div className="weekly-cancel__note">
          {state === "success"
            ? t("common.weeklyCancel.successNote")
            : t("common.weeklyCancel.defaultNote")}
        </div>

        <div className="weekly-cancel__actions">
          <a
            className="weekly-cancel__button weekly-cancel__button--primary"
            href="https://www.dortmunder-fussball-schule.de"
          >
            {t("common.weeklyCancel.home")}
          </a>

          <a
            className="weekly-cancel__button weekly-cancel__button--secondary"
            href="http://localhost/wordpress/?page_id=143"
          >
            {t("common.weeklyCancel.contact")}
          </a>
        </div>
      </div>
    </main>
  );
}

function getTitle(state: ViewState, t: TFunction) {
  if (state === "loading") return t("common.weeklyCancel.titleLoading");
  if (state === "success") return t("common.weeklyCancel.titleSuccess");
  return t("common.weeklyCancel.titleError");
}

function getBadgeText(state: ViewState, t: TFunction) {
  if (state === "loading") return t("common.weeklyCancel.badgeLoading");
  if (state === "success") return t("common.weeklyCancel.badgeSuccess");
  return t("common.weeklyCancel.badgeError");
}
