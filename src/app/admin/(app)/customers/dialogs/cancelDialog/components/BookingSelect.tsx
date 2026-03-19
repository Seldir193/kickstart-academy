//src\app\admin\(app)\customers\dialogs\cancelDialog\components\BookingSelect.tsx
"use client";

import React, { useMemo } from "react";
import type { StatusFilter } from "../constants";
import { bookingDisplay } from "../bookingDisplay";

type Trigger = {
  title: string;
  invoice: string;
  venue: string;
  status: string;
};

type Props = {
  label: string;
  open: boolean;
  setOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  rootRef: React.RefObject<HTMLDivElement | null>;
  disabled: boolean;
  title?: string;
  trigger: Trigger;
  items: any[];
  selectedId: string;
  onSelect: (id: string) => void;
  statusFilter: StatusFilter;
};

export function BookingSelect({
  label,
  open,
  setOpen,
  rootRef,
  disabled,
  title,
  trigger,
  items,
  selectedId,
  onSelect,
  statusFilter,
}: Props) {
  const triggerNode = useMemo(() => <TriggerNode d={trigger} />, [trigger]);

  return (
    <div className="ks-booking-select">
      <label className="lbl">{label}</label>

      <div
        className={
          "ks-selectbox" +
          (open ? " ks-selectbox--open" : "") +
          (disabled ? " ks-selectbox--disabled" : "")
        }
        ref={rootRef}
      >
        <button
          type="button"
          className="ks-selectbox__trigger"
          title={title}
          onClick={() => {
            if (disabled) return;
            setOpen((o) => !o);
          }}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="ks-selectbox__label ks-booking-select__triggerLabel">
            {triggerNode}
          </span>
          <span className="ks-selectbox__chevron" aria-hidden="true" />
        </button>

        {open && items.length > 0 && (
          <div className="ks-selectbox__panel" role="listbox">
            {items.map((b: any) => {
              const cancelled = String(b.status || "") === "cancelled";
              const active = selectedId === String(b._id);
              const d = bookingDisplay(b, false, statusFilter);

              return (
                <button
                  //   key={b._id || `${b.offerId}-${b.createdAt}`}

                  key={
                    [
                      b._id,
                      b.bookingId,
                      b.invoiceNumber || b.invoiceNo,
                      b.childUid,
                      b.offerId,
                      b.date,
                      b.createdAt,
                    ]
                      .filter(Boolean)
                      .join("__") || cryptoKeyFallback(b)
                  }
                  type="button"
                  role="option"
                  aria-selected={active}
                  aria-disabled={cancelled}
                  disabled={cancelled}
                  className={
                    "ks-selectbox__option" +
                    (active ? " ks-selectbox__option--active" : "") +
                    " ks-booking-select__option ks-storno__option"
                  }
                  onClick={() => {
                    if (cancelled) return;
                    onSelect(String(b._id));
                    setOpen(false);
                  }}
                >
                  <OptionNode d={d} cancelled={cancelled} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function cryptoKeyFallback(b: any) {
  return JSON.stringify({
    id: b?._id || "",
    bookingId: b?.bookingId || "",
    offerId: b?.offerId || "",
    invoice: b?.invoiceNumber || b?.invoiceNo || "",
    childUid: b?.childUid || "",
    date: b?.date || "",
    createdAt: b?.createdAt || "",
  });
}

function TriggerNode({ d }: { d: Trigger }) {
  return (
    <div className="ks-booking-select__row">
      <RowTop title={d.title} invoice={d.invoice} />
      <RowBottom venue={d.venue} status={d.status} cancelled={false} />
    </div>
  );
}

function OptionNode({ d, cancelled }: { d: Trigger; cancelled: boolean }) {
  return (
    <div className="ks-booking-select__row">
      <RowTop title={d.title} invoice={d.invoice} />
      <RowBottom venue={d.venue} status={d.status} cancelled={cancelled} />
    </div>
  );
}

function RowTop({ title, invoice }: { title: string; invoice: string }) {
  return (
    <div className="ks-booking-select__top">
      <div className="ks-booking-select__title" title={title}>
        {title}
      </div>

      {invoice ? (
        <div className="ks-booking-select__invoiceCol">
          <span className="ks-booking-select__invoice">{invoice}</span>
        </div>
      ) : (
        <div className="ks-booking-select__invoiceCol" />
      )}
    </div>
  );
}

function RowBottom({
  venue,
  status,
  cancelled,
}: {
  venue: string;
  status: string;
  cancelled: boolean;
}) {
  const text = [venue, status].filter(Boolean).join(" · ");
  if (!text) return null;

  return (
    <div
      className={
        "ks-booking-select__bottom" +
        (cancelled ? " ks-booking-select__bottom--cancelled" : "")
      }
      title={text}
    >
      {text}
    </div>
  );
}

// "use client";

// import React, { useMemo } from "react";
// import type { StatusFilter } from "../constants";
// import { bookingDisplay } from "../bookingDisplay";

// type Trigger = {
//   title: string;
//   invoice: string;
//   venue: string;
//   status: string;
// };

// type Props = {
//   label: string;
//   open: boolean;
//   setOpen: (v: boolean | ((p: boolean) => boolean)) => void;
//   // rootRef: React.RefObject<HTMLDivElement>;
//   rootRef: React.RefObject<HTMLDivElement | null>;

//   disabled: boolean;
//   title?: string;
//   trigger: Trigger;
//   items: any[];
//   selectedId: string;
//   onSelect: (id: string) => void;
//   statusFilter: StatusFilter;
// };

// export function BookingSelect({
//   label,
//   open,
//   setOpen,
//   rootRef,
//   disabled,
//   title,
//   trigger,
//   items,
//   selectedId,
//   onSelect,
//   statusFilter,
// }: Props) {
//   const triggerNode = useMemo(() => {
//     return <TriggerNode d={trigger} />;
//   }, [trigger]);

//   return (
//     <div>
//       <label className="lbl">{label}</label>

//       <div
//         className={
//           "ks-selectbox" +
//           (open ? " ks-selectbox--open" : "") +
//           (disabled ? " ks-selectbox--disabled" : "")
//         }
//         ref={rootRef}
//       >
//         <button
//           type="button"
//           className="ks-selectbox__trigger"
//           title={title}
//           onClick={() => {
//             if (disabled) return;
//             setOpen((o) => !o);
//           }}
//           disabled={disabled}
//           aria-haspopup="listbox"
//           aria-expanded={open}
//         >
//           <span className="ks-selectbox__label" style={{ display: "block" }}>
//             {triggerNode}
//           </span>
//           <span className="ks-selectbox__chevron" aria-hidden="true" />
//         </button>

//         {open && items.length > 0 && (
//           <div className="ks-selectbox__panel" role="listbox">
//             {items.map((b: any) => {
//               const cancelled = String(b.status || "") === "cancelled";
//               const active = selectedId === String(b._id);
//               const d = bookingDisplay(b, false, statusFilter);

//               return (
//                 <button
//                   key={b._id || `${b.offerId}-${b.createdAt}`}
//                   type="button"
//                   role="option"
//                   aria-selected={active}
//                   aria-disabled={cancelled}
//                   disabled={cancelled}
//                   className={
//                     "ks-selectbox__option" +
//                     (active ? " ks-selectbox__option--active" : "")
//                   }
//                   onClick={() => {
//                     if (cancelled) return;
//                     onSelect(String(b._id));
//                     setOpen(false);
//                   }}
//                 >
//                   <OptionNode d={d} cancelled={cancelled} />
//                 </button>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function TriggerNode({ d }: { d: Trigger }) {
//   return (
//     <div>
//       <RowTop title={d.title} invoice={d.invoice} />
//       <RowBottom venue={d.venue} status={d.status} cancelled={false} />
//     </div>
//   );
// }

// function OptionNode({ d, cancelled }: { d: Trigger; cancelled: boolean }) {
//   return (
//     <div>
//       <RowTop title={d.title} invoice={d.invoice} />
//       <RowBottom venue={d.venue} status={d.status} cancelled={cancelled} />
//     </div>
//   );
// }

// function RowTop({ title, invoice }: { title: string; invoice: string }) {
//   return (
//     <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
//       <div
//         style={{
//           fontWeight: 700,
//           minWidth: 0,
//           overflow: "hidden",
//           textOverflow: "ellipsis",
//           whiteSpace: "nowrap",
//         }}
//       >
//         {title}
//       </div>

//       {invoice ? (
//         <div style={{ flexShrink: 0 }}>
//           <span
//             style={{
//               fontSize: 12,
//               fontWeight: 600,
//               padding: "2px 8px",
//               borderRadius: 999,
//               border: "1px solid rgba(0,0,0,0.15)",
//               background: "rgba(0,0,0,0.06)",
//               opacity: 1,
//               display: "inline-flex",
//               alignItems: "center",
//               justifyContent: "center",
//               minWidth: 92,
//             }}
//           >
//             {invoice}
//           </span>
//         </div>
//       ) : null}
//     </div>
//   );
// }

// function RowBottom({
//   venue,
//   status,
//   cancelled,
// }: {
//   venue: string;
//   status: string;
//   cancelled: boolean;
// }) {
//   const text = [venue, status].filter(Boolean).join(" · ");
//   if (!text) return null;

//   return (
//     <div
//       style={{
//         fontSize: 12,
//         opacity: cancelled ? 0.6 : 0.8,
//         minWidth: 0,
//         overflow: "hidden",
//         textOverflow: "ellipsis",
//         whiteSpace: "nowrap",
//         marginTop: 2,
//       }}
//     >
//       {text}
//     </div>
//   );
// }
