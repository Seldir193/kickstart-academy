"use client";

import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { NewsletterFilter } from "../hooks/useCustomersList";
import { useOutsideClick } from "../hooks/useOutsideClick";

const options: { value: NewsletterFilter; labelKey: string }[] = [
  { value: "all", labelKey: "admin.customers.newsletterSelect.all" },
  { value: "true", labelKey: "admin.customers.newsletterSelect.yes" },
  { value: "false", labelKey: "admin.customers.newsletterSelect.no" },
];

type Props = {
  value: NewsletterFilter;
  onChange: (v: NewsletterFilter) => void;
  onAnyChange: () => void;
};

export default function NewsletterSelect({
  value,
  onChange,
  onAnyChange,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const label = useMemo(() => {
    if (value === "true") {
      return t("admin.customers.newsletterSelect.yes");
    }
    if (value === "false") {
      return t("admin.customers.newsletterSelect.no");
    }
    return t("admin.customers.newsletterSelect.all");
  }, [t, value]);

  useOutsideClick(open, ref, () => setOpen(false));

  function pick(v: NewsletterFilter) {
    onAnyChange();
    onChange(v);
    setOpen(false);
  }

  return (
    <div className="ks-customers-toolbar-select">
      <div
        ref={ref}
        className={`ks-filter-select ${open ? "ks-filter-select--open" : ""}`}
      >
        <button
          type="button"
          className="ks-filter-select__trigger"
          onClick={() => setOpen((o) => !o)}
          aria-label={t("admin.customers.newsletterSelect.ariaLabel")}
          title={t("admin.customers.newsletterSelect.ariaLabel")}
        >
          <span className="ks-filter-select__label">{label}</span>
          <span className="ks-filter-select__chevron" aria-hidden="true" />
        </button>

        {open && (
          <ul className="ks-filter-select__menu">
            {options.map((opt) => (
              <li key={`${opt.value}-${opt.labelKey}`}>
                <button
                  type="button"
                  className={
                    "ks-filter-select__option" +
                    (value === opt.value ? " is-selected" : "")
                  }
                  onClick={() => pick(opt.value)}
                >
                  {t(opt.labelKey)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// //src\app\admin\(app)\customers\components\NewsletterSelect.tsx
// "use client";

// import React, { useMemo, useRef, useState } from "react";
// import type { NewsletterFilter } from "../hooks/useCustomersList";
// import { useOutsideClick } from "../hooks/useOutsideClick";

// const options: { value: NewsletterFilter; label: string }[] = [
//   { value: "all", label: "All" },
//   { value: "true", label: "Yes" },
//   { value: "false", label: "No" },
// ];

// type Props = {
//   value: NewsletterFilter;
//   onChange: (v: NewsletterFilter) => void;
//   onAnyChange: () => void;
// };

// export default function NewsletterSelect({
//   value,
//   onChange,
//   onAnyChange,
// }: Props) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement | null>(null);

//   const label = useMemo(() => {
//     if (value === "true") return "Yes";
//     if (value === "false") return "No";
//     return "All";
//   }, [value]);

//   useOutsideClick(open, ref, () => setOpen(false));

//   function pick(v: NewsletterFilter) {
//     onAnyChange();
//     onChange(v);
//     setOpen(false);
//   }

//   return (
//     <div>
//       <label className="block text-sm text-gray-600">Newsletter</label>

//       <div
//         ref={ref}
//         className={`ks-filter-select ${open ? "ks-filter-select--open" : ""}`}
//       >
//         <button
//           type="button"
//           className="ks-filter-select__trigger"
//           onClick={() => setOpen((o) => !o)}
//         >
//           <span className="ks-filter-select__label">{label}</span>
//           <span className="ks-filter-select__chevron" aria-hidden="true" />
//         </button>

//         {open && (
//           <ul className="ks-filter-select__menu">
//             {options.map((opt) => (
//               <li key={`${opt.value}-${opt.label}`}>
//                 <button
//                   type="button"
//                   className={
//                     "ks-filter-select__option" +
//                     (value === opt.value ? " is-selected" : "")
//                   }
//                   onClick={() => pick(opt.value)}
//                 >
//                   {opt.label}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }
