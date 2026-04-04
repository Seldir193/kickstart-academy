// src/app/admin/franchise-locations/components/SortSelect.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SortKey } from "../franchise_locations.utils";

type Props = {
  value: SortKey;
  onChange: (v: SortKey) => void;
};

const options: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "name_az", label: "Name A–Z" },
  { key: "name_za", label: "Name Z–A" },
  { key: "city_az", label: "City A–Z" },
  { key: "city_za", label: "City Z–A" },
];

export default function SortSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(ev: PointerEvent) {
      const t = ev.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t))
        return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const label = useMemo(() => {
    return options.find((o) => o.key === value)?.label || "Newest first";
  }, [value]);

  return (
    <div
      className={
        "ks-training-select" + (open ? " ks-training-select--open" : "")
      }
    >
      <button
        ref={triggerRef}
        type="button"
        className="ks-training-select__trigger"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ks-training-select__label">{label}</span>
        <span className="ks-training-select__chevron" aria-hidden="true" />
      </button>

      {open ? (
        <ul
          ref={menuRef}
          className="ks-training-select__menu"
          role="listbox"
          aria-label="Sorting"
        >
          {options.map((o) => (
            <li key={o.key}>
              <button
                type="button"
                className={
                  "ks-training-select__option" +
                  (o.key === value ? " is-selected" : "")
                }
                onClick={() => {
                  onChange(o.key);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

// // src/app/admin/franchise-locations/components/SortSelect.tsx
// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import type { SortKey } from "../franchise_locations.utils";

// type Props = {
//   value: SortKey;
//   onChange: (v: SortKey) => void;
// };

// const options: { key: SortKey; label: string }[] = [
//   { key: "newest", label: "Neueste zuerst" },
//   { key: "oldest", label: "Älteste zuerst" },
//   { key: "name_az", label: "Name A–Z" },
//   { key: "name_za", label: "Name Z–A" },
//   { key: "city_az", label: "City A–Z" },
//   { key: "city_za", label: "City Z–A" },
// ];

// export default function SortSelect({ value, onChange }: Props) {
//   const [open, setOpen] = useState(false);
//   const triggerRef = useRef<HTMLButtonElement | null>(null);
//   const menuRef = useRef<HTMLUListElement | null>(null);

//   useEffect(() => {
//     if (!open) return;
//     function onPointerDown(ev: PointerEvent) {
//       const t = ev.target as Node;
//       if (triggerRef.current?.contains(t) || menuRef.current?.contains(t))
//         return;
//       setOpen(false);
//     }
//     document.addEventListener("pointerdown", onPointerDown);
//     return () => document.removeEventListener("pointerdown", onPointerDown);
//   }, [open]);

//   const label = useMemo(() => {
//     return options.find((o) => o.key === value)?.label || "Neueste zuerst";
//   }, [value]);

//   return (
//     <div
//       className={
//         "ks-training-select" + (open ? " ks-training-select--open" : "")
//       }
//     >
//       <button
//         ref={triggerRef}
//         type="button"
//         className="ks-training-select__trigger"
//         onClick={() => setOpen((o) => !o)}
//       >
//         <span className="ks-training-select__label">{label}</span>
//         <span className="ks-training-select__chevron" aria-hidden="true" />
//       </button>

//       {open ? (
//         <ul
//           ref={menuRef}
//           className="ks-training-select__menu"
//           role="listbox"
//           aria-label="Sortierung"
//         >
//           {options.map((o) => (
//             <li key={o.key}>
//               <button
//                 type="button"
//                 className={
//                   "ks-training-select__option" +
//                   (o.key === value ? " is-selected" : "")
//                 }
//                 onClick={() => {
//                   onChange(o.key);
//                   setOpen(false);
//                 }}
//               >
//                 {o.label}
//               </button>
//             </li>
//           ))}
//         </ul>
//       ) : null}
//     </div>
//   );
// }
