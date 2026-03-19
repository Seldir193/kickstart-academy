// //src\app\admin\(app)\invoices\components\KsDatePicker.tsx
"use client";

export { default } from "./ks-date-picker/KsDatePicker";
export type { KsDatePickerProps } from "./ks-date-picker/KsDatePicker";

// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";

// function pad2(n: number) {
//   return String(n).padStart(2, "0");
// }

// function isoFromDate(d: Date) {
//   const y = d.getFullYear();
//   const m = pad2(d.getMonth() + 1);
//   const day = pad2(d.getDate());
//   return `${y}-${m}-${day}`;
// }

// function dateFromIso(iso?: string) {
//   if (!iso) return null;
//   const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
//   if (!m) return null;
//   const y = Number(m[1]);
//   const mo = Number(m[2]) - 1;
//   const da = Number(m[3]);
//   const d = new Date(y, mo, da);
//   if (Number.isNaN(d.getTime())) return null;
//   if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== da)
//     return null;
//   return d;
// }

// function weekdayIndexMondayFirst(jsDay: number) {
//   return (jsDay + 6) % 7;
// }

// function buildMonthGrid(viewMonth: Date) {
//   const year = viewMonth.getFullYear();
//   const month = viewMonth.getMonth();
//   const first = new Date(year, month, 1);
//   const startOffset = weekdayIndexMondayFirst(first.getDay());
//   const daysInMonth = new Date(year, month + 1, 0).getDate();

//   const cells: Array<
//     { kind: "empty" } | { kind: "day"; iso: string; day: number }
//   > = [];
//   for (let i = 0; i < startOffset; i++) cells.push({ kind: "empty" });
//   for (let day = 1; day <= daysInMonth; day++) {
//     const d = new Date(year, month, day);
//     cells.push({ kind: "day", iso: isoFromDate(d), day });
//   }
//   while (cells.length % 7 !== 0) cells.push({ kind: "empty" });
//   return cells;
// }

// function addMonths(base: Date, delta: number) {
//   const d = new Date(base.getFullYear(), base.getMonth(), 1);
//   d.setMonth(d.getMonth() + delta);
//   return d;
// }

// function monthLabel(d: Date) {
//   return new Intl.DateTimeFormat("de-DE", {
//     month: "long",
//     year: "numeric",
//   }).format(d);
// }

// export type KsDatePickerProps = {
//   value: string;
//   onChange: (nextIso: string) => void;
//   placeholder?: string;
//   fromYear?: number;
//   toYear?: number;
//   disabled?: boolean;
// };

// export default function KsDatePicker({
//   value,
//   onChange,
//   placeholder = "tt.mm.jjjj",
//   fromYear = 1970,
//   toYear = new Date().getFullYear() + 2,
//   disabled,
// }: KsDatePickerProps) {
//   const btnRef = useRef<HTMLButtonElement | null>(null);
//   const panelRef = useRef<HTMLDivElement | null>(null);

//   const [open, setOpen] = useState(false);
//   const [yearOpen, setYearOpen] = useState(false);
//   const [pos, setPos] = useState<{ left: number; top: number; width: number }>({
//     left: 0,
//     top: 0,
//     width: 0,
//   });

//   const selected = useMemo(() => dateFromIso(value), [value]);

//   const [viewMonth, setViewMonth] = useState(() => {
//     const now = new Date();
//     return selected
//       ? new Date(selected.getFullYear(), selected.getMonth(), 1)
//       : new Date(now.getFullYear(), now.getMonth(), 1);
//   });

//   useEffect(() => {
//     if (!selected) return;
//     setViewMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
//   }, [selected]);

//   const label = useMemo(() => {
//     if (!value) return "";
//     const d = dateFromIso(value);
//     if (!d) return "";
//     return new Intl.DateTimeFormat("de-DE", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     }).format(d);
//   }, [value]);

//   function computePos() {
//     const el = btnRef.current;
//     if (!el) return;
//     const r = el.getBoundingClientRect();
//     setPos({
//       left: Math.round(r.left),
//       top: Math.round(r.bottom + 6),
//       width: Math.round(r.width),
//     });
//   }

//   function close() {
//     setOpen(false);
//     setYearOpen(false);
//   }

//   function openPicker() {
//     computePos();
//     setYearOpen(false);
//     setOpen(true);
//   }

//   useEffect(() => {
//     if (!open) return;

//     function onDown(e: MouseEvent) {
//       const t = e.target as Node;
//       if (btnRef.current?.contains(t)) return;
//       if (panelRef.current?.contains(t)) return;
//       close();
//     }

//     function onResize() {
//       computePos();
//     }

//     function onScroll() {
//       close();
//     }

//     document.addEventListener("mousedown", onDown);
//     window.addEventListener("resize", onResize);
//     window.addEventListener("scroll", onScroll, true);
//     return () => {
//       document.removeEventListener("mousedown", onDown);
//       window.removeEventListener("resize", onResize);
//       window.removeEventListener("scroll", onScroll, true);
//     };
//   }, [open]);

//   const cells = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

//   const years = useMemo(() => {
//     const ys: number[] = [];
//     for (let y = toYear; y >= fromYear; y--) ys.push(y);
//     return ys;
//   }, [fromYear, toYear]);

//   const [yearQuery, setYearQuery] = useState("");
//   const filteredYears = useMemo(() => {
//     const q = yearQuery.trim();
//     if (!q) return years;
//     return years.filter((y) => String(y).includes(q));
//   }, [years, yearQuery]);

//   function pickIso(iso: string) {
//     onChange(iso);
//     close();
//   }

//   function clear() {
//     onChange("");
//     close();
//   }

//   function goToday() {
//     const t = new Date();
//     const iso = isoFromDate(t);
//     onChange(iso);
//     setViewMonth(new Date(t.getFullYear(), t.getMonth(), 1));
//     close();
//   }

//   function jumpYear(nextYear: number) {
//     setViewMonth(new Date(nextYear, viewMonth.getMonth(), 1));
//     setYearOpen(false);
//   }

//   useEffect(() => {
//     if (!open) setYearQuery("");
//   }, [open]);

//   return (
//     <div className={"ks-datepicker" + (open ? " ks-datepicker--open" : "")}>
//       <button
//         ref={btnRef}
//         type="button"
//         className="input ks-datepicker__trigger"
//         onClick={() => (open ? close() : openPicker())}
//         disabled={disabled}
//         aria-haspopup="dialog"
//         aria-expanded={open}
//       >
//         <span
//           className={"ks-datepicker__value" + (label ? "" : " is-placeholder")}
//         >
//           {label || placeholder}
//         </span>
//         <span className="ks-datepicker__icon" aria-hidden="true">
//           <img src="/icons/calender.svg" alt="" />
//         </span>
//       </button>

//       {open && (
//         <div
//           ref={panelRef}
//           className="ks-datepicker__panel ks-scroll-thin"
//           role="dialog"
//           aria-label="Datum auswählen"
//           style={{
//             position: "fixed",
//             left: pos.left,
//             top: pos.top,
//             width: pos.width,
//             scrollbarWidth: "thin",
//           }}
//           onWheel={(e) => e.stopPropagation()}
//           onScroll={(e) => e.stopPropagation()}
//         >
//           <div className="ks-datepicker__head">
//             <button
//               type="button"
//               className="ks-datepicker__nav ks-datepicker__nav--prev"
//               onClick={() => setViewMonth(addMonths(viewMonth, -1))}
//               aria-label="Vorheriger Monat"
//             >
//               <img src="/icons/arrow_right_alt.svg" alt="" />
//             </button>

//             <button
//               type="button"
//               className="ks-datepicker__title"
//               onClick={() => setYearOpen((v) => !v)}
//               aria-label="Jahr auswählen"
//             >
//               {monthLabel(viewMonth)}
//             </button>

//             <button
//               type="button"
//               className="ks-datepicker__nav ks-datepicker__nav--next"
//               onClick={() => setViewMonth(addMonths(viewMonth, 1))}
//               aria-label="Nächster Monat"
//             >
//               <img src="/icons/arrow_right_alt.svg" alt="" />
//             </button>
//           </div>

//           {yearOpen ? (
//             <div className="ks-datepicker__years">
//               <input
//                 className="input ks-datepicker__yearinput"
//                 value={yearQuery}
//                 onChange={(e) => setYearQuery(e.target.value)}
//                 placeholder="Jahr suchen…"
//                 inputMode="numeric"
//               />

//               <div
//                 className="ks-datepicker__yearlist ks-scroll-thin"
//                 role="listbox"
//                 aria-label="Jahre"
//                 style={{ scrollbarWidth: "thin" }}
//               >
//                 {filteredYears.map((y) => (
//                   <button
//                     key={y}
//                     type="button"
//                     className={
//                       "ks-datepicker__year" +
//                       (y === viewMonth.getFullYear() ? " is-active" : "")
//                     }
//                     onClick={() => jumpYear(y)}
//                     role="option"
//                     aria-selected={y === viewMonth.getFullYear()}
//                   >
//                     {y}
//                   </button>
//                 ))}
//               </div>

//               <div className="ks-datepicker__foot">
//                 <button
//                   type="button"
//                   className="ks-datepicker__link"
//                   onClick={() => setYearOpen(false)}
//                 >
//                   Zurück
//                 </button>
//                 <button
//                   type="button"
//                   className="ks-datepicker__link"
//                   onClick={goToday}
//                 >
//                   Heute
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="ks-datepicker__weekdays">
//                 <div className="ks-datepicker__weekday">Mo</div>
//                 <div className="ks-datepicker__weekday">Di</div>
//                 <div className="ks-datepicker__weekday">Mi</div>
//                 <div className="ks-datepicker__weekday">Do</div>
//                 <div className="ks-datepicker__weekday">Fr</div>
//                 <div className="ks-datepicker__weekday">Sa</div>
//                 <div className="ks-datepicker__weekday">So</div>
//               </div>

//               <div
//                 className="ks-datepicker__grid"
//                 role="grid"
//                 aria-label="Kalender"
//               >
//                 {cells.map((c, idx) => {
//                   if (c.kind === "empty") {
//                     return (
//                       <div key={idx} className="ks-datepicker__cell is-empty" />
//                     );
//                   }
//                   const isSel = !!value && c.iso === value;
//                   return (
//                     <button
//                       key={c.iso}
//                       type="button"
//                       className={
//                         "ks-datepicker__cell" + (isSel ? " is-selected" : "")
//                       }
//                       onClick={() => pickIso(c.iso)}
//                       role="gridcell"
//                       aria-selected={isSel}
//                     >
//                       {c.day}
//                     </button>
//                   );
//                 })}
//               </div>

//               <div className="ks-datepicker__foot">
//                 <button
//                   type="button"
//                   className="ks-datepicker__link"
//                   onClick={clear}
//                 >
//                   Löschen
//                 </button>
//                 <button
//                   type="button"
//                   className="ks-datepicker__link"
//                   onClick={goToday}
//                 >
//                   Heute
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
