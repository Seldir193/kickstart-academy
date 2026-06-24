"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { KsDatePicker } from "./components/KsDatePicker";

import {
  initialForm,
  type FormState,
  type Offer,
  type PtMetaItem,
} from "./bookTypes";
import {
  calcAge,
  deriveCoach,
  buildRangeText,
  getOfferPriceText,
  getOfferScheduleLabel,
  getOfferScheduleLine,
  getOfferTimeLine,
  isNonTrialProgram,
  isWeeklyCourse,
  isHolidayProgram,
  isPowertraining,
} from "./bookUtils";

import { ChildSection } from "./components/ChildSection";
import { CampOptionsSection } from "./components/CampOptionsSection";
import { BillingSection } from "./components/BillingSection";
import { AgbRow } from "./components/AgbRow";
import { BookActions } from "./components/BookActions";

function toIsoDate(day?: string, month?: string, year?: string) {
  const d = String(day || "").trim();
  const m = String(month || "").trim();
  const y = String(year || "").trim();
  if (!d || !m || !y) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function stripEveryPrefix(value: string) {
  return String(value || "")
    .trim()
    .replace(/^jeden\s+/i, "");
}

function weekdayIndexFromGerman(value: string) {
  const text = String(value || "").toLowerCase();

  if (text.includes("montag")) return 1;
  if (text.includes("dienstag")) return 2;
  if (text.includes("mittwoch")) return 3;
  if (text.includes("donnerstag")) return 4;
  if (text.includes("freitag")) return 5;
  if (text.includes("samstag")) return 6;
  if (text.includes("sonntag")) return 0;

  return null;
}

function nextDateForWeekday(scheduleLine: string, todayIso: string) {
  const target = weekdayIndexFromGerman(scheduleLine);
  if (target === null || !todayIso) return todayIso;

  const base = new Date(`${todayIso}T00:00:00`);
  if (Number.isNaN(base.getTime())) return todayIso;

  const diff = (target - base.getDay() + 7) % 7;
  const date = new Date(base);
  date.setDate(base.getDate() + diff);

  return date.toISOString().slice(0, 10);
}

function getBookContentHeight() {
  const formElement = document.querySelector(
    ".book-form",
  ) as HTMLElement | null;
  const body = document.body;
  const html = document.documentElement;

  return Math.max(
    formElement?.scrollHeight || 0,
    formElement?.offsetHeight || 0,
    body.scrollHeight,
    body.offsetHeight,
    html.scrollHeight,
    html.offsetHeight,
  );
}

function postBookHeight() {
  const height = getBookContentHeight();
  if (!height || height < 300) return;
  window.parent?.postMessage(
    { type: "KS_BOOKING_HEIGHT", height: height + 16 },
    "*",
  );
}

function postBookReady() {
  window.parent?.postMessage({ type: "KS_BOOKING_READY" }, "*");
}

function observeBookHeight(callback: () => void) {
  if (!("ResizeObserver" in window)) return null;
  const observer = new ResizeObserver(callback);
  observer.observe(document.body);
  return observer;
}

export default function BookClient() {
  const params = useSearchParams();
  const { t, i18n } = useTranslation("book");

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  )
    .trim()
    .replace(/\/+$/, "");

  const wpBase = String(
    process.env.NEXT_PUBLIC_WP_BASE_URL || "http://localhost/wordpress",
  ).replace(/\/+$/, "");

  const [form, setForm] = useState<FormState>(initialForm);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [offerLoading, setOfferLoading] = useState(true);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const [submitError, setSubmitError] = useState("");
  const [eligibleBookingId, setEligibleBookingId] = useState("");
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [today, setToday] = useState<string>("");

  const isEmbed = useMemo(() => params.get("embed") === "1", [params]);

  const langParam = useMemo(() => {
    const value = params.get("lang") || "";
    const language = value.slice(0, 2).toLowerCase();

    return ["de", "en", "tr"].includes(language) ? language : "de";
  }, [params]);

  useEffect(() => {
    if (i18n.language === langParam) return;
    i18n.changeLanguage(langParam);
  }, [i18n, langParam]);

  const holidayLabelParam = params.get("holidayLabel") || "";
  const holidayFromParam = params.get("holidayFrom") || "";
  const holidayToParam = params.get("holidayTo") || "";
  const ptMetaRaw = params.get("ptmeta") || "";

  const previewHeading = params.get("previewHeading") || "";
  const previewTitle = params.get("previewTitle") || "";
  const previewMeta = params.get("previewMeta") || "";

  useEffect(() => {
    setToday(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => setStatus("idle"), 5000);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isEmbed) return;

    document.body.classList.add("embed-mode");

    return () => {
      document.body.classList.remove("embed-mode");
    };
  }, [isEmbed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isEmbed || offerLoading) return;

    const frame = window.requestAnimationFrame(() => {
      postBookHeight();
      postBookReady();
    });

    const timer = window.setTimeout(() => {
      postBookHeight();
      postBookReady();
    }, 120);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [isEmbed, form.offerId, offerLoading, offer, offerError]);

  const ptMeta: PtMetaItem[] = useMemo(() => {
    if (!ptMetaRaw) return [];
    try {
      const parsed = JSON.parse(ptMetaRaw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((x: any) => ({
        id: x.id ? String(x.id) : undefined,
        day: typeof x.day === "string" ? x.day : "",
        dateFrom: typeof x.dateFrom === "string" ? x.dateFrom : "",
        dateTo: typeof x.dateTo === "string" ? x.dateTo : "",
        timeFrom: typeof x.timeFrom === "string" ? x.timeFrom : "",
        timeTo: typeof x.timeTo === "string" ? x.timeTo : "",
        price:
          typeof x.price === "number"
            ? x.price
            : typeof x.price === "string"
              ? Number(x.price)
              : undefined,
      }));
    } catch {
      return [];
    }
  }, [ptMetaRaw]);

  const urlCamp = useMemo(
    () =>
      (holidayLabelParam !== "" ||
        holidayFromParam !== "" ||
        holidayToParam !== "") &&
      ptMetaRaw === "",
    [holidayLabelParam, holidayFromParam, holidayToParam, ptMetaRaw],
  );

  useEffect(() => {
    const readOfferId = () => {
      const id = params?.get("offerId") || params?.get("id") || "";
      if (id) return id;
      if (typeof window !== "undefined") {
        const query = new URLSearchParams(window.location.search);
        return query.get("offerId") || query.get("id") || "";
      }
      return "";
    };

    const id = readOfferId();
    setForm((current) => ({ ...current, offerId: id }));

    if (!id) {
      setOffer(null);
      setOfferError(t("offer.missingUrl"));
      setOfferLoading(false);
      return;
    }

    let cancelled = false;

    setOffer(null);
    setOfferLoading(true);
    setOfferError(null);

    fetch(`/api/offers/${id}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data: Offer) => {
        if (!cancelled) setOffer(data);
      })
      .catch(() => {
        if (!cancelled) {
          setOffer(null);
          setOfferError(t("offer.unreachable"));
        }
      })
      .finally(() => {
        if (!cancelled) setOfferLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params, t]);

  const nonTrial = useMemo(() => isNonTrialProgram(offer), [offer]);
  const weekly = useMemo(() => isWeeklyCourse(offer), [offer]);
  const holiday = useMemo(() => isHolidayProgram(offer), [offer]);
  const powertraining = useMemo(() => isPowertraining(offer), [offer]);

  const offerPrice = useMemo(() => getOfferPriceText(offer), [offer]);
  const offerTimeLine = useMemo(() => getOfferTimeLine(offer), [offer]);

  const offerScheduleLabel = useMemo(
    () => getOfferScheduleLabel(offer),
    [offer],
  );

  const offerScheduleLine = useMemo(() => getOfferScheduleLine(offer), [offer]);

  const regularCourseLine = useMemo(() => {
    return stripEveryPrefix(offerScheduleLine);
  }, [offerScheduleLine]);

  const weeklyAutoDate = useMemo(() => {
    if (!weekly) return "";
    return nextDateForWeekday(offerScheduleLine, today);
  }, [weekly, offerScheduleLine, today]);

  const isCampBooking = useMemo(
    () => urlCamp || (holiday && !powertraining),
    [urlCamp, holiday, powertraining],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isEmbed) return;

    const sendHeight = () => postBookHeight();
    const frame = window.requestAnimationFrame(sendHeight);
    const firstTimer = window.setTimeout(sendHeight, 80);
    const secondTimer = window.setTimeout(sendHeight, 260);
    const observer = observeBookHeight(sendHeight);

    window.addEventListener("resize", sendHeight);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(firstTimer);
      window.clearTimeout(secondTimer);
      observer?.disconnect();
      window.removeEventListener("resize", sendHeight);
    };
  }, [
    isEmbed,
    offerLoading,
    offer,
    errors,
    status,
    submitError,
    isCampBooking,
  ]);

  useEffect(() => {
    const offerId = String(form.offerId || "").trim();
    const email = String(form.email || "").trim();
    const firstName = String(form.childFirst || "").trim();
    const lastName = String(form.childLast || "").trim();

    const shouldCheck =
      !!offerId && weekly && !!email && !!firstName && !!lastName;

    if (!shouldCheck) {
      setEligibleBookingId("");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setEligibleLoading(true);
        const query = new URLSearchParams({
          offerId,
          email,
          firstName,
          lastName,
        }).toString();

        const response = await fetch(
          `${apiBase}/public/booking-eligibility?${query}`,
          {
            cache: "no-store",
          },
        );

        const data = await response.json().catch(() => null);
        if (cancelled) return;

        if (!response.ok || !data?.eligible || !data?.bookingId) {
          setEligibleBookingId("");
          return;
        }

        setEligibleBookingId(String(data.bookingId));
      } finally {
        if (!cancelled) setEligibleLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    apiBase,
    offer?.type,
    form.offerId,
    form.email,
    form.childFirst,
    form.childLast,
    weekly,
  ]);

  const productName =
    offer?.title || previewTitle || offer?.type || t("product.default");

  const holidayTitle = useMemo(
    () => (offer?.holidayWeekLabel || holidayLabelParam || "").trim(),
    [offer, holidayLabelParam],
  );

  const holidayRangeStr = useMemo(
    () =>
      buildRangeText(
        offer?.dateFrom,
        offer?.dateTo,
        holidayFromParam,
        holidayToParam,
      ),
    [offer, holidayFromParam, holidayToParam],
  );

  const sessionLines: string[] = useMemo(() => {
    const lines: string[] = [];

    const price = offerPrice;
    const timeLineOffer = offerTimeLine;

    if (holiday) {
      const range = holidayRangeStr ? `(${holidayRangeStr})` : "";

      if (powertraining && ptMeta.length) {
        ptMeta.forEach((item) => {
          const rangeStr =
            item.dateFrom || item.dateTo
              ? buildRangeText(item.dateFrom, item.dateTo, "", "")
              : holidayRangeStr;
          const rangeInline = rangeStr ? `(${rangeStr})` : "";

          const timeLine =
            item.timeFrom && item.timeTo
              ? `${item.timeFrom} – ${item.timeTo}`
              : timeLineOffer;

          const priceLine =
            typeof item.price === "number" && Number.isFinite(item.price)
              ? `${item.price.toFixed(2)}€`
              : price;

          const parts: string[] = [];
          if (rangeInline) parts.push(rangeInline);
          if (timeLine) parts.push(timeLine);
          if (priceLine) parts.push(priceLine);
          if (parts.length) {
            lines.push(`${t("summary.registration")} | ${parts.join(" · ")}`);
          }
        });
        return lines;
      }

      const parts: string[] = [];
      if (range) parts.push(range);
      if (timeLineOffer) parts.push(timeLineOffer);
      if (price) parts.push(price);
      if (parts.length) {
        lines.push(`${t("summary.registration")} | ${parts.join(" · ")}`);
      }
      return lines;
    }

    if (weekly) {
      const parts: string[] = [];
      if (regularCourseLine) {
        parts.push(`${t("summary.regularCourseTime")}: ${regularCourseLine}`);
      }
      if (price) parts.push(`${price}${t("summary.perMonth")}`);

      lines.push(parts.filter(Boolean).join(" · "));
      return lines;
    }

    const title = offerScheduleLabel
      ? `${t("summary.registration")} ${offerScheduleLabel}`
      : t("summary.registration");

    const parts: string[] = [];
    if (timeLineOffer) parts.push(timeLineOffer);
    if (price) parts.push(`${price}${t("summary.perMonth")}`);

    lines.push([title, ...parts.filter(Boolean)].join(" · "));
    return lines;
  }, [
    offer,
    holiday,
    powertraining,
    holidayRangeStr,
    ptMeta,
    t,
    offerPrice,
    offerTimeLine,
    offerScheduleLabel,
    weekly,
    regularCourseLine,
  ]);

  const heading = useMemo(() => {
    if (offerLoading) return previewHeading || t("heading.request");
    if (offerError || !offer) return previewHeading || t("heading.request");
    if (weekly) return t("heading.trial");
    if (holiday) return t("heading.holiday");
    return t("heading.request");
  }, [offerLoading, previewHeading, offerError, offer, weekly, holiday, t]);

  const onChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, type } = event.target as HTMLInputElement;
    const value =
      type === "checkbox"
        ? (event.target as HTMLInputElement).checked
        : event.target.value;
    setForm((current) => ({ ...current, [name]: value as any }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const nonTrialLocal = isNonTrialProgram(offer);
    const weeklyLocal = isWeeklyCourse(offer);
    const campLocal =
      (isHolidayProgram(offer) && !isPowertraining(offer)) || urlCamp;

    if (!form.offerId) nextErrors.offerId = t("offer.missing");
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = t("validation.invalidEmail");
    }

    if (!nonTrialLocal) {
      const ageYears = calcAge(form.birthYear, form.birthMonth, form.birthDay);

      if (ageYears == null) {
        nextErrors.birthYear =
          nextErrors.birthMonth =
          nextErrors.birthDay =
            t("validation.birthdateComplete");
      } else if (ageYears < 5 || ageYears > 19) {
        nextErrors.birthYear =
          nextErrors.birthMonth =
          nextErrors.birthDay =
            t("validation.ageRange");
      }

      if (!form.childFirst.trim())
        nextErrors.childFirst = t("validation.required");
      if (!form.childLast.trim())
        nextErrors.childLast = t("validation.required");
    }

    if (weeklyLocal) {
      const autoDate = nextDateForWeekday(offerScheduleLine, today);
      if (!autoDate) nextErrors.date = t("validation.dateRequired");
      else if (today && autoDate < today) {
        nextErrors.date = t("validation.datePast");
      }
    }

    if (!form.accept) nextErrors.accept = t("validation.acceptRequired");

    if (campLocal) {
      if (!form.tshirtSize) {
        nextErrors.tshirtSize = t("validation.tshirtRequired");
      }

      if (form.siblingEnabled) {
        if (!form.siblingFirst.trim()) {
          nextErrors.siblingFirst = t("validation.required");
        }
        if (!form.siblingLast.trim()) {
          nextErrors.siblingLast = t("validation.required");
        }
        if (!form.siblingTshirtSize) {
          nextErrors.siblingTshirtSize = t("validation.tshirtRequired");
        }
      }
    }

    return nextErrors;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");

    const nonTrialLocal = isNonTrialProgram(offer);
    const weeklyLocal = isWeeklyCourse(offer);
    const holidayLocal = isHolidayProgram(offer);
    const powertrainingLocal = isPowertraining(offer);
    const campLocal = (holidayLocal && !powertrainingLocal) || urlCamp;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const ageYears = nonTrialLocal
      ? 18
      : calcAge(form.birthYear, form.birthMonth, form.birthDay);

    const birth = [form.birthDay, form.birthMonth, form.birthYear]
      .filter(Boolean)
      .join(".");

    const siblingBirth = [
      form.siblingBirthDay,
      form.siblingBirthMonth,
      form.siblingBirthYear,
    ]
      .filter(Boolean)
      .join(".");

    const childBirthDate = toIsoDate(
      form.birthDay,
      form.birthMonth,
      form.birthYear,
    );

    const siblingBirthDate = toIsoDate(
      form.siblingBirthDay,
      form.siblingBirthMonth,
      form.siblingBirthYear,
    );

    const firstName = nonTrialLocal
      ? form.parentFirst || form.childFirst || "Interessent"
      : form.childFirst;

    const lastName = nonTrialLocal
      ? form.parentLast || form.childLast || ""
      : form.childLast;

    const weeklyDateToSend = nextDateForWeekday(offerScheduleLine, today);
    const dateToSend = weeklyLocal ? weeklyDateToSend || null : today || null;

    const extraHeader = weeklyLocal
      ? "Anmeldung Schnuppertraining"
      : holidayLocal
        ? "Anmeldung Ferienprogramm"
        : "Anfrage";

    const holidayInfo = holidayLocal
      ? [
          `Ferien: ${holidayTitle || "-"}`,
          holidayRangeStr ? `Zeitraum: ${holidayRangeStr}` : null,
        ]
          .filter(Boolean)
          .join("\n")
      : "";

    const siblingDiscount = campLocal && form.siblingEnabled ? 14 : 0;

    const goalkeeperCount =
      (form.goalkeeper === "yes" ? 1 : 0) +
      (campLocal && form.siblingEnabled && form.siblingGoalkeeper === "yes"
        ? 1
        : 0);

    const campOptionsInfo = campLocal
      ? [
          `T-Shirt-Größe (Kind): ${form.tshirtSize || "-"}`,
          `Torwartschule (Kind): ${form.goalkeeper === "yes" ? "Ja (+40€)" : "Nein"}`,
          form.siblingEnabled
            ? [
                `Geschwisterkind: ${form.siblingFirst} ${form.siblingLast}`,
                `Geschlecht: ${form.siblingGender || "-"}`,
                `Geburtstag: ${siblingBirth || "-"}`,
                `T-Shirt: ${form.siblingTshirtSize || "-"}`,
                `Torwartschule: ${form.siblingGoalkeeper === "yes" ? "Ja (+40€)" : "Nein"} (Geschwisterrabatt: 14€)`,
              ].join("\n")
            : null,
        ]
          .filter(Boolean)
          .join("\n")
      : "";

    const extra =
      `${extraHeader}\n` +
      `Programm: ${productName}\n` +
      (weeklyLocal && regularCourseLine
        ? `Reguläre Kurszeit: ${regularCourseLine}\n`
        : offerScheduleLine
          ? `Termin: ${offerScheduleLine}\n`
          : "") +
      (holidayInfo ? `${holidayInfo}\n` : "") +
      (campOptionsInfo ? `Camp-Optionen:\n${campOptionsInfo}\n` : "") +
      `Kind: ${form.childFirst} ${form.childLast} (${form.childGender || "-"}), Geburtstag: ${birth || "-"}\n` +
      `Kontakt: ${form.salutation || ""} ${form.parentFirst} ${form.parentLast}\n` +
      `Adresse: ${form.street} ${form.houseNo}, ${form.zip} ${form.city}\n` +
      `Telefon: ${form.phone}${form.phone2 ? " / " + form.phone2 : ""}\n` +
      `Gutschein: ${form.voucher || "-"}\n` +
      `Quelle: ${form.source || "-"}`;

    try {
      setStatus("sending");

      const response = await fetch(`${apiBase}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: form.offerId,
          firstName,
          lastName,
          email: form.email,
          age: ageYears,
          date: dateToSend,
          level: form.level,
          childBirthDate: childBirthDate || null,
          childGender: form.childGender || null,
          holidayLabel: holidayTitle || null,
          holidayFrom: holidayFromParam || offer?.dateFrom || null,
          holidayTo: holidayToParam || offer?.dateTo || null,
          mainTShirtSize: form.tshirtSize || null,
          mainGoalkeeperSchool: form.goalkeeper === "yes",
          hasSibling: !!form.siblingEnabled,
          siblingGender: form.siblingGender || null,
          siblingBirthDate: siblingBirthDate || null,
          siblingFirstName: form.siblingFirst || null,
          siblingLastName: form.siblingLast || null,
          siblingTShirtSize: form.siblingTshirtSize || null,
          siblingGoalkeeperSchool: form.siblingGoalkeeper === "yes",
          message: [form.message, extra].filter(Boolean).join("\n\n"),

          parent: {
            salutation: form.salutation || "",
            firstName: form.parentFirst || "",
            lastName: form.parentLast || "",
            email: form.email || "",
            phone: form.phone || "",
            phone2: form.phone2 || "",
          },

          address: {
            street: form.street || "",
            houseNo: form.houseNo || "",
            zip: form.zip || "",
            city: form.city || "",
          },

          meta: {
            scheduleLine: weeklyLocal
              ? regularCourseLine || offerScheduleLine || null
              : offerScheduleLine || null,
            scheduleLabel: weeklyLocal
              ? "Reguläre Kurszeit"
              : offerScheduleLabel || null,
            isCampBooking: campLocal,
            tshirtSize: form.tshirtSize || null,
            goalkeeper: form.goalkeeper,
            siblingEnabled: form.siblingEnabled,
            siblingFirst: form.siblingFirst || null,
            siblingLast: form.siblingLast || null,
            siblingGender: form.siblingGender || null,
            siblingBirthDay: form.siblingBirthDay || null,
            siblingBirthMonth: form.siblingBirthMonth || null,
            siblingBirthYear: form.siblingBirthYear || null,
            siblingTshirtSize: form.siblingTshirtSize || null,
            siblingGoalkeeper: form.siblingGoalkeeper,
            siblingDiscount,
            goalkeeperCount,
            childBirthDate: childBirthDate || null,
            childGender: form.childGender || null,
            holidayLabel: holidayTitle || null,
            holidayFrom: holidayFromParam || offer?.dateFrom || null,
            holidayTo: holidayToParam || offer?.dateTo || null,
            mainTShirtSize: form.tshirtSize || null,
            mainGoalkeeperSchool: form.goalkeeper === "yes",
            hasSibling: !!form.siblingEnabled,
            siblingBirthDate: siblingBirthDate || null,
            siblingFirstName: form.siblingFirst || null,
            siblingLastName: form.siblingLast || null,
            siblingTShirtSize: form.siblingTshirtSize || null,
            siblingGoalkeeperSchool: form.siblingGoalkeeper === "yes",
          },
        }),
      });

      let payload: any = null;
      try {
        payload = await response.clone().json();
      } catch {}

      if (!response.ok) {
        if (payload?.errors) {
          setErrors((current) => ({
            ...current,
            ...payload.errors,
          }));
        }
        setStatus("error");
        return;
      }

      const createdBookingId =
        payload?.booking?._id || payload?.booking?.id || "";

      const isOneTimePayable = holidayLocal || campLocal || powertrainingLocal;

      if (createdBookingId && isOneTimePayable) {
        const returnTo = `${wpBase}/angebote/?type=Camp`;

        const stripeRes = await fetch(
          `${apiBase}/payments/stripe/checkout-session`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId: createdBookingId, returnTo }),
          },
        );

        const stripePayload = await stripeRes.json().catch(() => null);

        if (!stripeRes.ok) {
          const code = String(stripePayload?.code || "");
          const message =
            code === "SUBSCRIPTION_ALREADY_CREATED"
              ? t("errors.subscriptionStarted")
              : stripePayload?.message ||
                stripePayload?.error ||
                code ||
                `HTTP ${stripeRes.status}`;
          setSubmitError(message);
          setStatus("error");
          return;
        }

        if (isEmbed && typeof window !== "undefined" && window.top) {
          window.top.location.href = stripePayload.url;
        } else {
          window.location.href = stripePayload.url;
        }
        return;
      }

      setStatus("success");
      setForm((current) => ({ ...initialForm, offerId: current.offerId }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
    }
  };

  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, index) => start + index);

  const DAY_OPTS = range(1, 31).map((n) => String(n).padStart(2, "0"));
  const MONTH_OPTS = range(1, 12).map((n) => String(n).padStart(2, "0"));
  const YEAR_OPTS = range(1980, 2025).reverse().map(String);

  const coach = deriveCoach(offer || undefined);

  const submitLabel = useMemo(() => {
    if (status === "sending") return t("submit.sending");

    if (offerLoading) {
      const preview = previewHeading.toLowerCase();
      if (preview.includes("schnupper")) return t("submit.trial");
      if (preview.includes("ferien")) return t("submit.paid");
      return t("submit.request");
    }

    if (weekly) {
      if (eligibleBookingId) return t("submit.subscription");
      if (eligibleLoading) return t("submit.checking");
      return t("submit.trial");
    }

    if (holiday || isCampBooking || powertraining) return t("submit.paid");

    return t("submit.request");
  }, [
    status,
    offerLoading,
    previewHeading,
    weekly,
    eligibleBookingId,
    eligibleLoading,
    holiday,
    isCampBooking,
    powertraining,
    t,
  ]);

  const handleCaretClick = (event: React.MouseEvent<HTMLElement>) => {
    const wrapper = event.currentTarget.parentElement;
    if (!wrapper) return;
    wrapper.classList.toggle("is-open");
  };

  const handleCaretBlur = (event: React.FocusEvent<HTMLElement>) => {
    const wrapper = event.currentTarget.parentElement;
    if (!wrapper) return;
    wrapper.classList.remove("is-open");
  };

  const isSubmitDisabled =
    status === "sending" || !!offerError || !form.offerId;

  const canShowOfferHeader = !!heading || !!previewTitle || !!previewMeta;

  const cleanSessionLines = sessionLines
    .map((line) => line.trim())
    .filter(Boolean);

  const visibleSessionLines =
    (offerLoading || offerError || !offer) && previewMeta.trim()
      ? [previewMeta.trim()]
      : cleanSessionLines;

  return (
    <>
      <section className={`book-embed ${isEmbed ? "is-embed" : ""}`}>
        <div className="book-grid book-grid--single">
          <div className="book-main">
            <form className="book-form" onSubmit={onSubmit} noValidate>
              {!isEmbed && (
                <div className="book-sticky">
                  {canShowOfferHeader ? (
                    <div className="book-sub">
                      <div className="book-sub__left">
                        <div className="book-sub__titles">
                          <h2 className="book-h1">{heading}</h2>

                          {holiday ? (
                            holidayTitle && (
                              <div className="book-product">{holidayTitle}</div>
                            )
                          ) : (
                            <div className="book-product">{productName}</div>
                          )}

                          {visibleSessionLines.map((line, index) => (
                            <div key={index} className="book-meta">
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="book-scroll">
                <input type="hidden" name="offerId" value={form.offerId} />
                {!offerLoading &&
                  (coach.first ||
                    coach.last ||
                    coach.avatar ||
                    offer?.info) && (
                    <div className="book-contact card">
                      <h3>{t("contact.title")}</h3>
                      <div className="contact-coach">
                        {coach.avatar ? (
                          <img
                            className="contact-coach__avatar"
                            src={coach.avatar}
                            alt={`${coach.first} ${coach.last}`.trim()}
                          />
                        ) : null}

                        <div className="contact-coach__stack">
                          <div className="contact-coach__name">
                            <span className="contact-coach__first">
                              {coach.first}
                            </span>
                            {coach.last ? (
                              <span className="contact-coach__last">
                                {coach.last}
                              </span>
                            ) : null}
                          </div>
                          {coach.email ? (
                            <a
                              className="contact-coach__mail"
                              href={`mailto:${coach.email}`}
                            >
                              {coach.email}
                            </a>
                          ) : (
                            <span className="contact-coach__mail contact-coach__mail--empty">
                              —
                            </span>
                          )}
                        </div>
                      </div>
                      {offer?.info ? (
                        <p className="muted coach-info-text">{offer.info}</p>
                      ) : null}
                    </div>
                  )}

                {!nonTrial && (
                  <ChildSection
                    form={form}
                    errors={errors}
                    DAY_OPTS={DAY_OPTS}
                    MONTH_OPTS={MONTH_OPTS}
                    YEAR_OPTS={YEAR_OPTS}
                    onChange={onChange}
                  />
                )}

                {isCampBooking && (
                  <CampOptionsSection
                    form={form}
                    errors={errors}
                    DAY_OPTS={DAY_OPTS}
                    MONTH_OPTS={MONTH_OPTS}
                    YEAR_OPTS={YEAR_OPTS}
                    onChange={onChange}
                    setForm={setForm}
                    handleCaretClick={handleCaretClick}
                    handleCaretBlur={handleCaretBlur}
                  />
                )}

                <BillingSection
                  form={form}
                  errors={errors}
                  onChange={onChange}
                  handleCaretClick={handleCaretClick}
                  handleCaretBlur={handleCaretBlur}
                />

                <AgbRow
                  form={form}
                  errors={errors}
                  isCampBooking={!!isCampBooking}
                  onChange={onChange}
                />

                {status === "error" && submitError ? (
                  <div className="book-alert book-alert--error">
                    {submitError}
                  </div>
                ) : null}
              </div>

              <BookActions
                status={status}
                submitLabel={submitLabel}
                isSubmitDisabled={isSubmitDisabled}
                errors={errors}
                offerError={offerError}
                offerLoading={offerLoading}
              />
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
