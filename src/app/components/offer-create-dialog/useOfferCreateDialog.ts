"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Place } from "@/types/place";

import type {
  CategoryKey,
  CreateOfferPayload,
  OfferDialogInitial,
  OfferDialogMode,
  OfferType,
} from "./types";

import { COURSES, HOLIDAY_WEEK_PRESETS, CATEGORY_ORDER } from "./constants";
import { normalizeCoachSrc } from "./utils";
import { useOnClickOutside } from "./useOnClickOutside";

type HookArgs = {
  open: boolean;
  mode: OfferDialogMode;
  initial?: OfferDialogInitial;
  onClose: () => void;
  onCreate?: (payload: CreateOfferPayload) => Promise<void> | void;
  onSave?: (id: string, payload: CreateOfferPayload) => Promise<void> | void;
};

function isHolidayShape(input: Partial<CreateOfferPayload> | null | undefined) {
  const category = String(input?.category || "").trim();
  return category === "Holiday";
}

export function useOfferCreateDialog({
  open,
  mode,
  initial,
  onClose,
  onCreate,
  onSave,
}: HookArgs) {
  const blank: CreateOfferPayload = {
    type: "",
    category: "",
    sub_type: "",
    placeId: "",
    location: "",
    price: "",
    timeFrom: "",
    timeTo: "",
    ageFrom: "",
    ageTo: "",
    info: "",
    onlineActive: true,
    coachName: "",
    coachEmail: "",
    coachImage: "",
    holidayWeekLabel: "",
    dateFrom: "",
    dateTo: "",
  };

  const computeInitial = (): CreateOfferPayload => {
    const base = { ...blank };
    if (!initial) return base;

    return {
      type: (initial.type as OfferType) ?? "",
      category: (initial.category as CategoryKey) ?? "",
      sub_type: initial.sub_type ?? "",
      placeId: initial.placeId ?? "",
      location: initial.location ?? "",
      price: (initial.price as number) ?? "",
      timeFrom: initial.timeFrom ?? "",
      timeTo: initial.timeTo ?? "",
      ageFrom:
        initial.ageFrom === undefined || initial.ageFrom === null
          ? ""
          : Number(initial.ageFrom),
      ageTo:
        initial.ageTo === undefined || initial.ageTo === null
          ? ""
          : Number(initial.ageTo),
      info: initial.info ?? "",
      onlineActive:
        typeof initial.onlineActive === "boolean" ? initial.onlineActive : true,
      coachName: initial.coachName ?? "",
      coachEmail: initial.coachEmail ?? "",
      coachImage: initial.coachImage ?? "",
      holidayWeekLabel: initial.holidayWeekLabel ?? "",
      dateFrom: initial.dateFrom ?? "",
      dateTo: initial.dateTo ?? "",
    };
  };

  const [form, setForm] = useState<CreateOfferPayload>(computeInitial);

  const [categoryUI, setCategoryUI] = useState<CategoryKey | "">("");
  const [courseUI, setCourseUI] = useState<string>("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);

  const [holidayPreset, setHolidayPreset] = useState<string>("");
  const [holidayCustom, setHolidayCustom] = useState<string>("");
  const [holidayOpen, setHolidayOpen] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [places, setPlaces] = useState<Place[]>([]);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
  const courseDropdownRef = useRef<HTMLDivElement | null>(null);
  const placeDropdownRef = useRef<HTMLDivElement | null>(null);
  const holidayDropdownRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(panelRef, onClose);
  useOnClickOutside(categoryDropdownRef, () => setCategoryOpen(false));
  useOnClickOutside(courseDropdownRef, () => setCourseOpen(false));
  useOnClickOutside(placeDropdownRef, () => setPlaceOpen(false));
  useOnClickOutside(holidayDropdownRef, () => setHolidayOpen(false));

  const selectedPlace = useMemo(
    () => places.find((p) => p._id === form.placeId) || null,
    [places, form.placeId],
  );

  let PLACES_CACHE: Place[] | null = null;
  let PLACES_CACHE_AT = 0;
  let PLACES_INFLIGHT: Promise<Place[]> | null = null;

  const PLACES_TTL_MS = 5 * 60 * 1000;

  useEffect(() => {
    if (!open) return;

    const ctrl = new AbortController();

    (async () => {
      try {
        const now = Date.now();

        if (PLACES_CACHE && now - PLACES_CACHE_AT < PLACES_TTL_MS) {
          setPlaces(PLACES_CACHE);
          return;
        }

        if (PLACES_INFLIGHT) {
          const cached = await PLACES_INFLIGHT;
          if (!ctrl.signal.aborted) setPlaces(cached);
          return;
        }

        PLACES_INFLIGHT = (async () => {
          const r = await fetch("/api/admin/places?page=1&pageSize=50", {
            cache: "no-store",
            signal: ctrl.signal,
          });
          const j = await r.json().catch(() => ({}));
          const arr: Place[] = Array.isArray(j?.items) ? j.items : [];
          return arr;
        })();

        const arr = await PLACES_INFLIGHT;

        PLACES_CACHE = arr;
        PLACES_CACHE_AT = Date.now();
        PLACES_INFLIGHT = null;

        if (!ctrl.signal.aborted) setPlaces(arr);
      } catch {
        PLACES_INFLIGHT = null;
        if (!ctrl.signal.aborted) setPlaces([]);
      }
    })();

    return () => ctrl.abort();
  }, [open]);

  const initialKey = useMemo(() => JSON.stringify(initial), [initial]);

  useEffect(() => {
    if (open) {
      const init = computeInitial();
      setForm(init);
      setPreviewUrl(normalizeCoachSrc(init.coachImage));

      if (init.category) setCategoryUI(init.category as CategoryKey);
      else setCategoryUI("");

      if (init.type) {
        const found = COURSES.find(
          (c) =>
            c.type === init.type &&
            (init.sub_type ? c.sub_type === init.sub_type : true) &&
            (init.category ? c.category === init.category : true),
        );
        if (found) setCourseUI(found.value);
        else setCourseUI("");
      } else {
        setCourseUI("");
      }

      if (init.holidayWeekLabel) {
        const presetHit = HOLIDAY_WEEK_PRESETS.find(
          (p) => p === init.holidayWeekLabel,
        );
        if (presetHit) {
          setHolidayPreset(presetHit);
          setHolidayCustom("");
        } else {
          setHolidayPreset("__custom__");
          setHolidayCustom(init.holidayWeekLabel);
        }
      } else {
        setHolidayPreset("");
        setHolidayCustom("");
      }

      setUploading(false);
      setUploadError(null);
      setCategoryOpen(false);
      setHolidayOpen(false);
      setCourseOpen(false);
      setPlaceOpen(false);
    } else {
      setForm({ ...blank });
      setPreviewUrl("");
      setCategoryUI("");
      setCourseUI("");
      setHolidayPreset("");
      setHolidayCustom("");
      setUploading(false);
      setUploadError(null);
      setCategoryOpen(false);
      setCourseOpen(false);
      setPlaceOpen(false);
      setHolidayOpen(false);
    }
  }, [open, mode, initialKey]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const canSubmit = useMemo(() => {
    const basicOk =
      !!form.type &&
      !!form.placeId &&
      form.location.trim().length > 0 &&
      form.price !== "" &&
      Number(form.price) >= 0 &&
      form.timeFrom &&
      form.timeTo &&
      (form.ageFrom === "" ||
        form.ageTo === "" ||
        Number(form.ageFrom) <= Number(form.ageTo));

    return basicOk && !uploading;
  }, [form, uploading]);

  function handleCategoryChange(next: CategoryKey | "") {
    setCategoryUI(next);
    setCourseUI("");
    setForm((f) => ({
      ...f,
      category: next,
      sub_type: "",
    }));
  }

  function handleCourseChange(value: string) {
    setCourseUI(value);
    const def = COURSES.find((c) => c.value === value);
    if (!def) return;

    const cat = (categoryUI || def.category) as CategoryKey;

    setCategoryUI(cat);
    setForm((f) => ({
      ...f,
      type: def.type,
      category: cat,
      sub_type: def.sub_type || "",
    }));
  }

  function onPlaceChange(placeId: string) {
    const p = places.find((x) => x._id === placeId);
    setForm((f) => ({
      ...f,
      placeId,
      location: p?.city ? p.city : "",
    }));
  }

  function handleHolidayPresetChange(next: string) {
    setHolidayPreset(next);

    if (next && next !== "__custom__") {
      setForm((f) => ({ ...f, holidayWeekLabel: next }));
      setHolidayCustom("");
    }

    if (next === "__custom__") {
      setForm((f) => ({ ...f, holidayWeekLabel: "" }));
    }

    if (!next) {
      setForm((f) => ({ ...f, holidayWeekLabel: "" }));
      setHolidayCustom("");
    }
  }

  function onHolidayCustomChange(val: string) {
    setHolidayCustom(val);
    setForm((f) => ({ ...f, holidayWeekLabel: val }));
  }

  async function handleCoachFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      fd.append("filename", file.name);

      const res = await fetch("/api/uploads/coach", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Upload failed (${res.status})`);
      }

      const url: string = data.url || "";
      setForm((f) => ({ ...f, coachImage: url }));
      setPreviewUrl(url);
    } catch (err: any) {
      setUploadError(err?.message || "Upload error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const finalHolidayName =
      holidayPreset === "__custom__"
        ? (holidayCustom || "").trim()
        : (holidayPreset || form.holidayWeekLabel || "").trim();

    const payload: CreateOfferPayload = {
      ...form,
      price: Number(form.price),
      ageFrom: form.ageFrom === "" ? "" : Number(form.ageFrom),
      ageTo: form.ageTo === "" ? "" : Number(form.ageTo),
      holidayWeekLabel: finalHolidayName || "",
      dateFrom: form.dateFrom || "",
      dateTo: form.dateTo || "",
    };

    if (mode === "edit" && initial?._id && onSave) {
      await onSave(initial._id, payload);
      return;
    }

    if (mode === "create" && onCreate) {
      await onCreate(payload);
    }
  }

  const visibleCourses = useMemo(() => {
    return COURSES.filter((c) => !categoryUI || c.category === categoryUI);
  }, [categoryUI]);

  const groupedCourses = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => ({
      cat,
      items: visibleCourses
        .filter((c) => c.category === cat)
        .map((c) => ({ value: c.value, label: c.label })),
    })).filter((g) => g.items.length);
  }, [visibleCourses]);

  const selectedCourse = useMemo(() => {
    return courseUI ? COURSES.find((c) => c.value === courseUI) || null : null;
  }, [courseUI]);

  const isHolidayCamp = form.category === "Holiday" && form.type === "Camp";
  const isHolidayPower =
    form.category === "Holiday" && form.sub_type === "Powertraining";
  const isHolidayOffer = form.category === "Holiday";

  return {
    panelRef,
    categoryDropdownRef,
    courseDropdownRef,
    placeDropdownRef,
    holidayDropdownRef,

    form,
    setForm,

    categoryUI,
    courseUI,

    categoryOpen,
    setCategoryOpen,

    courseOpen,
    setCourseOpen,

    placeOpen,
    setPlaceOpen,

    holidayPreset,
    holidayCustom,

    holidayOpen,
    setHolidayOpen,

    uploading,
    uploadError,
    previewUrl,

    places,
    selectedPlace,

    canSubmit,
    groupedCourses,
    selectedCourseLabel: selectedCourse ? selectedCourse.label : null,

    isHolidayCamp,
    isHolidayPower,
    isHolidayOffer,

    handleCategoryChange,
    handleCourseChange,
    onPlaceChange,

    handleHolidayPresetChange,
    onHolidayCustomChange,

    handleCoachFileChange,
    handleSubmit,
  };
}

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import type { Place } from "@/types/place";

// import type {
//   CategoryKey,
//   CreateOfferPayload,
//   OfferDialogInitial,
//   OfferDialogMode,
//   OfferType,
// } from "./types";

// import { COURSES, HOLIDAY_WEEK_PRESETS, CATEGORY_ORDER } from "./constants";
// import { normalizeCoachSrc } from "./utils";
// import { useOnClickOutside } from "./useOnClickOutside";

// type HookArgs = {
//   open: boolean;
//   mode: OfferDialogMode;
//   initial?: OfferDialogInitial;
//   onClose: () => void;
//   onCreate?: (payload: CreateOfferPayload) => Promise<void> | void;
//   onSave?: (id: string, payload: CreateOfferPayload) => Promise<void> | void;
// };

// function isHolidayShape(input: Partial<CreateOfferPayload> | null | undefined) {
//   const category = String(input?.category || "").trim();
//   return category === "Holiday";
// }

// export function useOfferCreateDialog({
//   open,
//   mode,
//   initial,
//   onClose,
//   onCreate,
//   onSave,
// }: HookArgs) {
//   const blank: CreateOfferPayload = {
//     type: "",
//     category: "",
//     sub_type: "",
//     placeId: "",
//     location: "",
//     price: "",
//     days: [],
//     timeFrom: "",
//     timeTo: "",
//     ageFrom: "",
//     ageTo: "",
//     info: "",
//     onlineActive: true,
//     coachName: "",
//     coachEmail: "",
//     coachImage: "",
//     holidayWeekLabel: "",
//     dateFrom: "",
//     dateTo: "",
//   };

//   const computeInitial = (): CreateOfferPayload => {
//     const base = { ...blank };
//     if (!initial) return base;

//     const initialDays = isHolidayShape(initial)
//       ? []
//       : Array.isArray(initial.days)
//         ? initial.days
//         : [];

//     return {
//       type: (initial.type as OfferType) ?? "",
//       category: (initial.category as CategoryKey) ?? "",
//       sub_type: initial.sub_type ?? "",
//       placeId: initial.placeId ?? "",
//       location: initial.location ?? "",
//       price: (initial.price as number) ?? "",
//       days: initialDays,
//       timeFrom: initial.timeFrom ?? "",
//       timeTo: initial.timeTo ?? "",
//       ageFrom:
//         initial.ageFrom === undefined || initial.ageFrom === null
//           ? ""
//           : Number(initial.ageFrom),
//       ageTo:
//         initial.ageTo === undefined || initial.ageTo === null
//           ? ""
//           : Number(initial.ageTo),
//       info: initial.info ?? "",
//       onlineActive:
//         typeof initial.onlineActive === "boolean" ? initial.onlineActive : true,
//       coachName: initial.coachName ?? "",
//       coachEmail: initial.coachEmail ?? "",
//       coachImage: initial.coachImage ?? "",
//       holidayWeekLabel: initial.holidayWeekLabel ?? "",
//       dateFrom: initial.dateFrom ?? "",
//       dateTo: initial.dateTo ?? "",
//     };
//   };

//   const [form, setForm] = useState<CreateOfferPayload>(computeInitial);

//   const [categoryUI, setCategoryUI] = useState<CategoryKey | "">("");
//   const [courseUI, setCourseUI] = useState<string>("");

//   const [categoryOpen, setCategoryOpen] = useState(false);
//   const [courseOpen, setCourseOpen] = useState(false);
//   const [placeOpen, setPlaceOpen] = useState(false);

//   const [holidayPreset, setHolidayPreset] = useState<string>("");
//   const [holidayCustom, setHolidayCustom] = useState<string>("");
//   const [holidayOpen, setHolidayOpen] = useState(false);

//   const [uploading, setUploading] = useState(false);
//   const [uploadError, setUploadError] = useState<string | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string>("");

//   const [places, setPlaces] = useState<Place[]>([]);

//   const panelRef = useRef<HTMLDivElement | null>(null);
//   const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
//   const courseDropdownRef = useRef<HTMLDivElement | null>(null);
//   const placeDropdownRef = useRef<HTMLDivElement | null>(null);
//   const holidayDropdownRef = useRef<HTMLDivElement | null>(null);

//   useOnClickOutside(panelRef, onClose);
//   useOnClickOutside(categoryDropdownRef, () => setCategoryOpen(false));
//   useOnClickOutside(courseDropdownRef, () => setCourseOpen(false));
//   useOnClickOutside(placeDropdownRef, () => setPlaceOpen(false));
//   useOnClickOutside(holidayDropdownRef, () => setHolidayOpen(false));

//   const selectedPlace = useMemo(
//     () => places.find((p) => p._id === form.placeId) || null,
//     [places, form.placeId],
//   );

//   let PLACES_CACHE: Place[] | null = null;
//   let PLACES_CACHE_AT = 0;
//   let PLACES_INFLIGHT: Promise<Place[]> | null = null;

//   const PLACES_TTL_MS = 5 * 60 * 1000;

//   useEffect(() => {
//     if (!open) return;

//     const ctrl = new AbortController();

//     (async () => {
//       try {
//         const now = Date.now();

//         if (PLACES_CACHE && now - PLACES_CACHE_AT < PLACES_TTL_MS) {
//           setPlaces(PLACES_CACHE);
//           return;
//         }

//         if (PLACES_INFLIGHT) {
//           const cached = await PLACES_INFLIGHT;
//           if (!ctrl.signal.aborted) setPlaces(cached);
//           return;
//         }

//         PLACES_INFLIGHT = (async () => {
//           const r = await fetch("/api/admin/places?page=1&pageSize=50", {
//             cache: "no-store",
//             signal: ctrl.signal,
//           });
//           const j = await r.json().catch(() => ({}));
//           const arr: Place[] = Array.isArray(j?.items) ? j.items : [];
//           return arr;
//         })();

//         const arr = await PLACES_INFLIGHT;

//         PLACES_CACHE = arr;
//         PLACES_CACHE_AT = Date.now();
//         PLACES_INFLIGHT = null;

//         if (!ctrl.signal.aborted) setPlaces(arr);
//       } catch {
//         PLACES_INFLIGHT = null;
//         if (!ctrl.signal.aborted) setPlaces([]);
//       }
//     })();

//     return () => ctrl.abort();
//   }, [open]);

//   const initialKey = useMemo(() => JSON.stringify(initial), [initial]);

//   useEffect(() => {
//     if (open) {
//       const init = computeInitial();
//       setForm(init);
//       setPreviewUrl(normalizeCoachSrc(init.coachImage));

//       if (init.category) setCategoryUI(init.category as CategoryKey);
//       else setCategoryUI("");

//       if (init.type) {
//         const found = COURSES.find(
//           (c) =>
//             c.type === init.type &&
//             (init.sub_type ? c.sub_type === init.sub_type : true) &&
//             (init.category ? c.category === init.category : true),
//         );
//         if (found) setCourseUI(found.value);
//         else setCourseUI("");
//       } else {
//         setCourseUI("");
//       }

//       if (init.holidayWeekLabel) {
//         const presetHit = HOLIDAY_WEEK_PRESETS.find(
//           (p) => p === init.holidayWeekLabel,
//         );
//         if (presetHit) {
//           setHolidayPreset(presetHit);
//           setHolidayCustom("");
//         } else {
//           setHolidayPreset("__custom__");
//           setHolidayCustom(init.holidayWeekLabel);
//         }
//       } else {
//         setHolidayPreset("");
//         setHolidayCustom("");
//       }

//       setUploading(false);
//       setUploadError(null);
//       setCategoryOpen(false);
//       setHolidayOpen(false);
//       setCourseOpen(false);
//       setPlaceOpen(false);
//     } else {
//       setForm({ ...blank });
//       setPreviewUrl("");
//       setCategoryUI("");
//       setCourseUI("");
//       setHolidayPreset("");
//       setHolidayCustom("");
//       setUploading(false);
//       setUploadError(null);
//       setCategoryOpen(false);
//       setCourseOpen(false);
//       setPlaceOpen(false);
//       setHolidayOpen(false);
//     }
//   }, [open, mode, initialKey]);

//   useEffect(() => {
//     function onKey(e: KeyboardEvent) {
//       if (e.key === "Escape") onClose();
//     }

//     if (open) document.addEventListener("keydown", onKey);
//     return () => document.removeEventListener("keydown", onKey);
//   }, [open, onClose]);

//   const canSubmit = useMemo(() => {
//     const basicOk =
//       !!form.type &&
//       !!form.placeId &&
//       form.location.trim().length > 0 &&
//       form.price !== "" &&
//       Number(form.price) >= 0 &&
//       form.timeFrom &&
//       form.timeTo &&
//       (form.ageFrom === "" ||
//         form.ageTo === "" ||
//         Number(form.ageFrom) <= Number(form.ageTo));

//     return basicOk && !uploading;
//   }, [form, uploading]);

//   function handleCategoryChange(next: CategoryKey | "") {
//     setCategoryUI(next);
//     setCourseUI("");
//     setForm((f) => ({
//       ...f,
//       category: next,
//       sub_type: "",
//       days: next === "Holiday" ? [] : f.days,
//     }));
//   }

//   function handleCourseChange(value: string) {
//     setCourseUI(value);
//     const def = COURSES.find((c) => c.value === value);
//     if (!def) return;

//     const cat = (categoryUI || def.category) as CategoryKey;
//     const nextIsHoliday = cat === "Holiday";

//     setCategoryUI(cat);
//     setForm((f) => ({
//       ...f,
//       type: def.type,
//       category: cat,
//       sub_type: def.sub_type || "",
//       days: nextIsHoliday ? [] : f.days,
//     }));
//   }

//   function onPlaceChange(placeId: string) {
//     const p = places.find((x) => x._id === placeId);
//     setForm((f) => ({
//       ...f,
//       placeId,
//       location: p?.city ? p.city : "",
//     }));
//   }

//   function handleHolidayPresetChange(next: string) {
//     setHolidayPreset(next);

//     if (next && next !== "__custom__") {
//       setForm((f) => ({ ...f, holidayWeekLabel: next }));
//       setHolidayCustom("");
//     }

//     if (next === "__custom__") {
//       setForm((f) => ({ ...f, holidayWeekLabel: "" }));
//     }

//     if (!next) {
//       setForm((f) => ({ ...f, holidayWeekLabel: "" }));
//       setHolidayCustom("");
//     }
//   }

//   function onHolidayCustomChange(val: string) {
//     setHolidayCustom(val);
//     setForm((f) => ({ ...f, holidayWeekLabel: val }));
//   }

//   async function handleCoachFileChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setUploadError(null);
//     setUploading(true);

//     try {
//       const fd = new FormData();
//       fd.append("file", file, file.name);
//       fd.append("filename", file.name);

//       const res = await fetch("/api/uploads/coach", {
//         method: "POST",
//         body: fd,
//       });

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok || !data?.ok) {
//         throw new Error(data?.error || `Upload failed (${res.status})`);
//       }

//       const url: string = data.url || "";
//       setForm((f) => ({ ...f, coachImage: url }));
//       setPreviewUrl(url);
//     } catch (err: any) {
//       setUploadError(err?.message || "Upload error");
//     } finally {
//       setUploading(false);
//     }
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!canSubmit) return;

//     const finalHolidayName =
//       holidayPreset === "__custom__"
//         ? (holidayCustom || "").trim()
//         : (holidayPreset || form.holidayWeekLabel || "").trim();

//     const payload: CreateOfferPayload = {
//       ...form,
//       price: Number(form.price),
//       ageFrom: form.ageFrom === "" ? "" : Number(form.ageFrom),
//       ageTo: form.ageTo === "" ? "" : Number(form.ageTo),
//       holidayWeekLabel: finalHolidayName || "",
//       dateFrom: form.dateFrom || "",
//       dateTo: form.dateTo || "",
//       days: isHolidayShape(form) ? [] : form.days,
//     };

//     if (mode === "edit" && initial?._id && onSave) {
//       await onSave(initial._id, payload);
//       return;
//     }

//     if (mode === "create" && onCreate) {
//       await onCreate(payload);
//     }
//   }

//   const visibleCourses = useMemo(() => {
//     return COURSES.filter((c) => !categoryUI || c.category === categoryUI);
//   }, [categoryUI]);

//   const groupedCourses = useMemo(() => {
//     return CATEGORY_ORDER.map((cat) => ({
//       cat,
//       items: visibleCourses
//         .filter((c) => c.category === cat)
//         .map((c) => ({ value: c.value, label: c.label })),
//     })).filter((g) => g.items.length);
//   }, [visibleCourses]);

//   const selectedCourse = useMemo(() => {
//     return courseUI ? COURSES.find((c) => c.value === courseUI) || null : null;
//   }, [courseUI]);

//   const isHolidayCamp = form.category === "Holiday" && form.type === "Camp";
//   const isHolidayPower =
//     form.category === "Holiday" && form.sub_type === "Powertraining";
//   const isHolidayOffer = form.category === "Holiday";

//   return {
//     panelRef,
//     categoryDropdownRef,
//     courseDropdownRef,
//     placeDropdownRef,
//     holidayDropdownRef,

//     form,
//     setForm,

//     categoryUI,
//     courseUI,

//     categoryOpen,
//     setCategoryOpen,

//     courseOpen,
//     setCourseOpen,

//     placeOpen,
//     setPlaceOpen,

//     holidayPreset,
//     holidayCustom,

//     holidayOpen,
//     setHolidayOpen,

//     uploading,
//     uploadError,
//     previewUrl,

//     places,
//     selectedPlace,

//     canSubmit,
//     groupedCourses,
//     selectedCourseLabel: selectedCourse ? selectedCourse.label : null,

//     isHolidayCamp,
//     isHolidayPower,
//     isHolidayOffer,

//     handleCategoryChange,
//     handleCourseChange,
//     onPlaceChange,

//     handleHolidayPresetChange,
//     onHolidayCustomChange,

//     handleCoachFileChange,
//     handleSubmit,
//   };
// }
