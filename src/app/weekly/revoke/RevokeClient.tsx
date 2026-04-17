"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { toastText } from "@/lib/toast-messages";
import { submitRevokeByToken, type RevokeResponse } from "./revokeApi";
//import "../../styles/weekly-revoke.scss";

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

function getTitle(state: ViewState, t: TFunction) {
  if (state === "loading") return t("common.weeklyRevoke.titleLoading");
  if (state === "success") return t("common.weeklyRevoke.titleSuccess");
  return t("common.weeklyRevoke.titleError");
}

function getBadgeText(state: ViewState, t: TFunction) {
  if (state === "loading") return t("common.weeklyRevoke.badgeLoading");
  if (state === "success") return t("common.weeklyRevoke.badgeSuccess");
  return t("common.weeklyRevoke.badgeError");
}

function labelForMode(mode: string, t: TFunction) {
  if (mode === "weekly_refund")
    return t("common.weeklyRevoke.mode.weeklyRefund");
  if (mode === "one_time_refund")
    return t("common.weeklyRevoke.mode.oneTimeRefund");
  if (mode === "unpaid_storno")
    return t("common.weeklyRevoke.mode.unpaidStorno");
  return mode || t("common.weeklyRevoke.mode.default");
}

export default function RevokeClient({ token }: Props) {
  const { t } = useTranslation();
  const [state, setState] = useState<ViewState>("loading");
  const [message, setMessage] = useState(t("common.weeklyRevoke.processing"));
  const [mode, setMode] = useState("");
  const [docNo, setDocNo] = useState("");

  useEffect(() => {
    if (!safeText(token)) {
      setState("error");
      setMessage(
        toastText(
          t,
          "common.weeklyRevoke.invalidLink",
          "Der Widerrufslink ist ungültig.",
        ),
      );
      return;
    }

    let alive = true;

    async function run() {
      const data: RevokeResponse = await submitRevokeByToken(token);
      if (!alive) return;

      const nextMessage =
        data?.message ||
        data?.error ||
        toastText(
          t,
          "common.weeklyRevoke.processingFailed",
          "Der Widerruf konnte nicht verarbeitet werden.",
        );

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

  const title = getTitle(state, t);
  const badgeText = getBadgeText(state, t);
  const contentClass = `weekly-revoke__message weekly-revoke__message--${state}`;

  return (
    <main className="weekly-revoke">
      <div className="weekly-revoke__card">
        <div className="weekly-revoke__badge">{badgeText}</div>

        <h1 className="weekly-revoke__title">{title}</h1>

        <p className={contentClass}>{message}</p>

        {state === "success" && mode ? (
          <div className="weekly-revoke__info">
            <div className="weekly-revoke__info-label">
              {t("common.weeklyRevoke.processingLabel")}
            </div>
            <div className="weekly-revoke__info-value">
              {labelForMode(mode, t)}
            </div>
          </div>
        ) : null}

        {state === "success" && docNo ? (
          <div className="weekly-revoke__info">
            <div className="weekly-revoke__info-label">
              {mode === "unpaid_storno"
                ? t("common.weeklyRevoke.stornoNo")
                : t("common.weeklyRevoke.creditNoteNo")}
            </div>
            <div className="weekly-revoke__info-value">{docNo}</div>
          </div>
        ) : null}

        <div className="weekly-revoke__note">
          {state === "success"
            ? t("common.weeklyRevoke.successNote")
            : t("common.weeklyRevoke.defaultNote")}
        </div>

        <div className="weekly-revoke__actions">
          <a
            className="weekly-revoke__button weekly-revoke__button--primary"
            href="https://dortmunder-fussballschule.de"
          >
            {t("common.weeklyRevoke.home")}
          </a>

          <a
            className="weekly-revoke__button weekly-revoke__button--secondary"
            href={contactUrl()}
          >
            {t("common.weeklyRevoke.contact")}
          </a>
        </div>
      </div>
    </main>
  );
}
